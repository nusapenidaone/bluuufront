<?php namespace Noren\Booking\Odoo;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Noren\Booking\Models\Closeddates;
use Noren\Booking\Models\Boat;
use Noren\Booking\Models\Company;
use Noren\Booking\Models\Tours;
use Noren\Booking\Models\Extras;
use Noren\Booking\Odoo\OdooService;
use Input;
use Log;

class OdooWebhookController extends Controller
{
    public function handle()
    {
        $payload = Input::all();

        $odooId = (int) ($payload['id'] ?? $payload['_id'] ?? (isset($payload['ids']) ? $payload['ids'][0] : 0));

        if (!$odooId) {
            return response()->json(['ok' => false], 400);
        }

        // Заказы чужих компаний (напр. Bluuu Tours Phuket) календарь этого сайта не трогают.
        // «Свои» компании — те, что заведены на сайте (Company.odoo_id, к ним привязаны лодки).
        // company_id приходит как id или [id, name]. Нет поля → обрабатываем как раньше,
        // чтобы не сломать календарь из-за настройки автоматизации.
        if (array_key_exists('company_id', $payload)) {
            $company   = $payload['company_id'];
            $companyId = (int) (is_array($company) ? ($company[0] ?? 0) : $company);
            if (!$companyId || !Company::where('odoo_id', $companyId)->exists()) {
                Log::info("Odoo webhook SKIP foreign company | odoo_id={$odooId} | company_id={$companyId}");
                return response()->json(['ok' => true, 'skipped' => 'foreign company']);
            }
        } else {
            Log::warning("Odoo webhook: no company_id in payload | odoo_id={$odooId}");
        }

        $state = $payload['state'] ?? null;

        // cancel → delete record
        if ($state === 'cancel') {
            return $this->handleCancel($odooId);
        }

        // quotation (draft/sent) → order is no longer confirmed, remove from calendar
        if (in_array($state, ['draft', 'sent'])) {
            return $this->handleCancel($odooId);
        }

        // sale → create or update record
        if ($state === 'sale') {
            return $this->handleSale($odooId, $payload);
        }

        return response()->json(['ok' => true]);
    }

    // ─── cancel / quotation → delete ─────────────────────────────────────────

    protected function handleCancel(int $odooId)
    {
        Closeddates::where('odoo_id', $odooId)->delete();
        return response()->json(['ok' => true]);
    }

    // ─── sale → upsert (create or update) ────────────────────────────────────

    protected function handleSale(int $odooId, array $payload)
    {
        // Resolve tour type (needed to determine shared=1 / private=2)
        $tourType = $payload['x_studio_tour_type'] ?? null;
        if (!$tourType) {
            $tourType = OdooService::fetchTourType($odooId);
        }

        $tour = $tourType ? Tours::where('odoo_type', $tourType)->first() : null;
        if (!$tour) {
            return response()->json(['ok' => true]);
        }

        $type = (int) $tour->classes_id === 9 ? 1 : 2;

        // Load existing record so we can preserve fields missing from payload
        $existing = Closeddates::where('odoo_id', $odooId)->first();

        // ── Case 1: date ──────────────────────────────────────────────────────
        $dateRaw = $payload['rental_start_date'] ?? null;
        $date    = $dateRaw
            ? Carbon::parse($dateRaw, 'UTC')->addHours(4)->format('Y-m-d')
            : ($existing?->date ?? null);

        if (!$date) {
            Log::warning("Odoo webhook SKIP | odoo_id={$odooId} | no date in payload and no existing record");
            return response()->json(['ok' => false, 'error' => 'no date'], 400);
        }

        // ── Case 3: boat ──────────────────────────────────────────────────────
        // Use array_key_exists so we can distinguish "not sent" from "empty string"
        if (array_key_exists('x_studio_boat_name', $payload)) {
            $boatName = $payload['x_studio_boat_name'];
            $boat     = $boatName ? Boat::where('amo_name', $boatName)->first() : null;
            $boatId   = $boat?->id;
        } else {
            // field not in payload → keep existing value
            $boatId = $existing?->boat_id;
        }

        // ── Case 2: qtty ──────────────────────────────────────────────────────
        if (array_key_exists('x_studio_count_of_people', $payload)) {
            $qtty = (int) $payload['x_studio_count_of_people'];
        } else {
            $qtty = $existing?->qtty ?? 0;
        }

        Closeddates::updateOrCreate(
            ['odoo_id' => $odooId],
            [
                'date'      => $date,
                'type'      => $type,
                'boat_id'   => $boatId,
                'qtty'      => $qtty ?: null,
                'tour_type' => $tourType ?: null,
            ]
        );

        return response()->json(['ok' => true]);
    }

    // ─── product price sync (Odoo product write → update Extras.price) ────────

    public function handleProductPrice(Request $request)
    {
        // Raw request is logged before anything else (incl. auth) — so we always see what Odoo sent
        $this->priceLog('info', 'request', [
            'ip'           => $request->ip(),
            'method'       => $request->method(),
            'url'          => $request->url(),
            'user_agent'   => $request->header('User-Agent'),
            'content_type' => $request->header('Content-Type'),
            'raw_body'     => $request->getContent(),
            'input'        => array_diff_key(Input::all(), ['key' => true]),
        ]);

        $cfg = require __DIR__ . '/services.config.php';
        $key = $cfg['odoo_webhook_key'] ?? null;
        if (!$key || $request->get('key') !== $key) {
            $this->priceLog('warning', 'unauthorized', ['ip' => $request->ip()]);
            return response()->json(['ok' => false, 'error' => 'Unauthorized'], 401);
        }

        $payload = array_diff_key(Input::all(), ['key' => true]);
        $items   = $this->normalizeProductPayload($payload);

        $updated = [];
        $skipped = [];

        foreach ($items as $item) {
            $isPtav = $this->isPtavItem($item);
            [$priceKey, $price] = $this->extractPrice($item, $isPtav);

            $ctx = [
                'model'     => $item['_model'] ?? null,
                'item_id'   => $item['id'] ?? $item['_id'] ?? null,
                'price_key' => $priceKey,
                'price'     => $price,
            ];

            if ($price === null || !is_numeric($price)) {
                $skipped[] = ['item_id' => $ctx['item_id'], 'reason' => 'no price'];
                $this->priceLog('warning', 'skip: no price', $ctx + ['item' => $item]);
                continue;
            }

            $candidateIds = $this->extractCandidateOdooIds($item, $isPtav);
            $ctx['candidates'] = $candidateIds;
            if (!$candidateIds) {
                $skipped[] = ['item_id' => $ctx['item_id'], 'reason' => 'no candidate ids'];
                $this->priceLog('warning', 'skip: no candidate ids', $ctx + ['item' => $item]);
                continue;
            }

            $extra = null;
            foreach ($candidateIds as $candidateId) {
                $extra = Extras::where('odoo_id', $candidateId)->first();
                if ($extra) {
                    break;
                }
            }

            if (!$extra) {
                $skipped[] = ['candidates' => $candidateIds, 'reason' => 'extra not found'];
                $this->priceLog('info', 'skip: extra not found', $ctx);
                continue;
            }

            $oldPrice = (float) $extra->price;
            $newPrice = (float) $price;
            $ctx += [
                'extra_id'   => $extra->id,
                'extra_name' => $extra->name,
                'odoo_id'    => $extra->odoo_id,
                'old_price'  => $oldPrice,
                'new_price'  => $newPrice,
            ];

            // Never wipe a real price with 0 — Odoo fires this on any ptav write, often with price_extra=0.0
            if ($newPrice <= 0 && $oldPrice > 0) {
                $skipped[] = ['extra_id' => $extra->id, 'odoo_id' => $extra->odoo_id, 'reason' => 'zero_price_guard'];
                $this->priceLog('warning', 'skip: zero_price_guard', $ctx);
                continue;
            }

            if ($newPrice == $oldPrice) {
                $skipped[] = ['extra_id' => $extra->id, 'odoo_id' => $extra->odoo_id, 'reason' => 'unchanged'];
                $this->priceLog('info', 'skip: unchanged', $ctx);
                continue;
            }

            $extra->price = $newPrice;
            $extra->saveQuietly();

            $updated[] = ['odoo_id' => $extra->odoo_id, 'extra_id' => $extra->id, 'old_price' => $oldPrice, 'price' => $extra->price];
            $this->priceLog('info', 'updated', $ctx);
        }

        return response()->json(['ok' => true, 'updated' => $updated, 'skipped' => $skipped]);
    }

    // Dedicated log: storage/logs/odoo-product-price.log (one JSON line per entry).
    // Warnings/errors are duplicated into the standard system log.
    protected function priceLog(string $level, string $message, array $context = []): void
    {
        $line = json_encode([
            'time'    => Carbon::now('Asia/Makassar')->format('Y-m-d H:i:s'),
            'level'   => $level,
            'message' => $message,
            'context' => $context,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        @file_put_contents(storage_path('logs/odoo-product-price.log'), $line . PHP_EOL, FILE_APPEND | LOCK_EX);

        if ($level !== 'info') {
            Log::$level('[Odoo product-price] ' . $message, $context);
        }
    }

    protected function isPtavItem(array $item): bool
    {
        return ($item['_model'] ?? null) === 'product.template.attribute.value'
            || array_key_exists('ptav_product_variant_ids', $item)
            || array_key_exists('price_extra', $item);
    }

    // ptav → only `price_extra`. product.product → `lst_price` / `list_price`, then `price`
    // (`price` is computed from pricelist context in Odoo and is usually 0 without it).
    protected function extractPrice(array $item, bool $isPtav): array
    {
        $keys = $isPtav ? ['price_extra'] : ['lst_price', 'list_price', 'price'];
        foreach ($keys as $key) {
            if (array_key_exists($key, $item) && $item[$key] !== null && $item[$key] !== false) {
                return [$key, $item[$key]];
            }
        }
        return [null, null];
    }

    // Extras.odoo_id is expected to be a product.product (variant) id — the same id
    // used as `product_id` when building sale.order.line (see OdooService::buildOrderLines).
    // ptav (`product.template.attribute.value`): ONLY `ptav_product_variant_ids` — the record's own `id`
    // and `product_tmpl_id` belong to other id spaces and can accidentally match an unrelated Extras.odoo_id.
    // Other models (direct product.product webhook): `id` / `product_id` / `odoo_id`, then `product_tmpl_id`.
    protected function extractCandidateOdooIds(array $item, bool $isPtav): array
    {
        $ids = [];

        if ($isPtav) {
            $variantIds = $item['ptav_product_variant_ids'] ?? null;
            if (is_array($variantIds)) {
                foreach ($variantIds as $variantId) {
                    $ids[] = (int) (is_array($variantId) ? ($variantId[0] ?? 0) : $variantId);
                }
            }
            return array_values(array_unique(array_filter($ids)));
        }

        foreach (['id', 'product_id', 'odoo_id', 'product_tmpl_id'] as $key) {
            if (!empty($item[$key])) {
                $value = $item[$key];
                $ids[] = (int) (is_array($value) ? ($value[0] ?? 0) : $value);
            }
        }

        return array_values(array_unique(array_filter($ids)));
    }

    // Odoo may send a single record `{...}`, a batch under `records: [...]`,
    // or a bare list `[{...}, {...}]` — normalize all of these to a flat array.
    // Top-level `_model` is propagated into batch items so ptav detection works per item.
    protected function normalizeProductPayload(array $payload): array
    {
        if (isset($payload['records']) && is_array($payload['records'])) {
            $model = $payload['_model'] ?? null;
            return array_map(
                fn($item) => is_array($item) && $model && !isset($item['_model']) ? $item + ['_model' => $model] : $item,
                array_filter($payload['records'], 'is_array')
            );
        }

        if (array_is_list($payload) && isset($payload[0]) && is_array($payload[0])) {
            return $payload;
        }

        return [$payload];
    }
}
