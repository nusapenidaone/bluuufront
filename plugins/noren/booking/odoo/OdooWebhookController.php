<?php namespace Noren\Booking\Odoo;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Noren\Booking\Models\Closeddates;
use Noren\Booking\Models\Boat;
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
        $cfg = require __DIR__ . '/services.config.php';
        $key = $cfg['odoo_webhook_key'] ?? null;
        if (!$key || $request->get('key') !== $key) {
            return response()->json(['ok' => false, 'error' => 'Unauthorized'], 401);
        }

        $payload = Input::all();
        $items   = $this->normalizeProductPayload($payload);

        $updated = [];
        $skipped = [];

        foreach ($items as $item) {
            $price = $item['price'] ?? $item['lst_price'] ?? $item['list_price'] ?? $item['price_extra'] ?? null;

            if ($price === null || !is_numeric($price)) {
                $skipped[] = $item;
                continue;
            }

            $candidateIds = $this->extractCandidateOdooIds($item);
            if (!$candidateIds) {
                $skipped[] = $item;
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
                continue;
            }

            $extra->price = (float) $price;
            $extra->saveQuietly();

            $updated[] = ['odoo_id' => $extra->odoo_id, 'extra_id' => $extra->id, 'price' => $extra->price];
        }

        if ($skipped) {
            Log::warning('Odoo product price webhook — skipped items: ' . json_encode($skipped));
        }

        return response()->json(['ok' => true, 'updated' => $updated, 'skipped' => $skipped]);
    }

    // Extras.odoo_id is expected to be a product.product (variant) id — the same id
    // used as `product_id` when building sale.order.line (see OdooService::buildOrderLines).
    // The webhook usually fires on `product.template.attribute.value` (see docs/extras-price-sync.md),
    // whose own `id` is unrelated to the product. Try, in priority order:
    //   1. `ptav_product_variant_ids` — the actual product.product variant id(s) this value applies to
    //   2. `product_tmpl_id` — the product.template id, in case Extras.odoo_id was set up against that instead
    //   3. `id` / `product_id` / `odoo_id` — plain top-level id (covers a direct product.product webhook)
    protected function extractCandidateOdooIds(array $item): array
    {
        $ids = [];

        $variantIds = $item['ptav_product_variant_ids'] ?? null;
        if (is_array($variantIds)) {
            foreach ($variantIds as $variantId) {
                $ids[] = (int) (is_array($variantId) ? ($variantId[0] ?? 0) : $variantId);
            }
        }

        foreach (['product_tmpl_id', 'id', 'product_id', 'odoo_id'] as $key) {
            if (!empty($item[$key])) {
                $value = $item[$key];
                $ids[] = (int) (is_array($value) ? ($value[0] ?? 0) : $value);
            }
        }

        return array_values(array_unique(array_filter($ids)));
    }

    // Odoo may send a single record `{...}`, a batch under `records: [...]`,
    // or a bare list `[{...}, {...}]` — normalize all of these to a flat array.
    protected function normalizeProductPayload(array $payload): array
    {
        if (isset($payload['records']) && is_array($payload['records'])) {
            return $payload['records'];
        }

        if (array_is_list($payload) && isset($payload[0]) && is_array($payload[0])) {
            return $payload;
        }

        return [$payload];
    }
}
