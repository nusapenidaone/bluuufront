<?php namespace Noren\Booking\Odoo;

use Illuminate\Routing\Controller;
use Noren\Booking\Models\Closeddates;
use Noren\Booking\Models\Boat;
use Noren\Booking\Models\Tours;
use Input;
use Log;

class OdooWebhookController extends Controller
{
    public function handle()
    {
        $payload = Input::all();
        Log::info($payload);

        $odooId = (int) ($payload['id'] ?? $payload['_id'] ?? (isset($payload['ids']) ? $payload['ids'][0] : 0));

        if (!$odooId) {
            return response()->json(['ok' => false], 400);
        }

        $state = $payload['state'] ?? null;

        if ($state === 'cancel') {
            return $this->handleCancel($odooId);
        }

        if ($state !== 'sale') {
            return response()->json(['ok' => true]);
        }

        return $this->handleSale($odooId, $payload);
    }

    // ─── Cancel ───────────────────────────────────────────────────────────────

    protected function handleCancel(int $odooId)
    {
        $existing = Closeddates::where('odoo_id', $odooId)->first();
        $found    = $existing ? "found in DB (id={$existing->id})" : "not in DB";

        Log::info("Odoo webhook [DRY-RUN] DELETE | odoo_id={$odooId} | {$found}");
        // Closeddates::where('odoo_id', $odooId)->delete();

        return response()->json(['ok' => true]);
    }

    // ─── Sale ─────────────────────────────────────────────────────────────────

    protected function handleSale(int $odooId, array $payload)
    {
        $date = isset($payload['rental_start_date'])
            ? substr($payload['rental_start_date'], 0, 10)
            : null;

        if (!$date) {
            return response()->json(['ok' => false], 400);
        }

        $boatName = $payload['x_studio_boat_name'] ?? '';
        $qtty     = (int) ($payload['x_studio_count_of_people'] ?? 0);
        $lineIds  = array_filter((array) ($payload['order_line'] ?? []));

        $tour = $this->resolveTour($lineIds);

        if (!$tour) {
            Log::info("Odoo webhook [DRY-RUN] SKIP | odoo_id={$odooId} | tour not found in order lines");
            return response()->json(['ok' => true]);
        }

        $type      = (int) $tour->types_id === 1 ? 1 : 2;
        $boat      = $boatName ? Boat::where('amo_name', $boatName)->first() : null;
        $newBoatId = $boat?->id;

        return $this->upsertCloseddate($odooId, $date, $type, $newBoatId, $boatName, $qtty, $tour);
    }

    // ─── Upsert ───────────────────────────────────────────────────────────────

    protected function upsertCloseddate(int $odooId, string $date, int $type, ?int $boatId, string $boatName, int $qtty, $tour)
    {
        $existing = Closeddates::where('odoo_id', $odooId)->first();

        if (!$existing) {
            $boatInfo = $boatId ? "boat_id={$boatId}" : "boat NOT FOUND (name={$boatName})";
            Log::info("Odoo webhook [DRY-RUN] CREATE | odoo_id={$odooId} | date={$date} | type={$type} | {$boatInfo} | qtty={$qtty} | tour={$tour->name}");
        } else {
            $changed = $existing->date    !== $date
                || (int) $existing->type    !== $type
                || (int) $existing->boat_id !== (int) $boatId
                || (int) $existing->qtty    !== $qtty;

            if (!$changed) {
                Log::info("Odoo webhook [DRY-RUN] NO CHANGE | odoo_id={$odooId} | date={$date} | type={$type} | boat_id={$boatId} | qtty={$qtty}");
                return response()->json(['ok' => true]);
            }

            Log::info("Odoo webhook [DRY-RUN] UPDATE | odoo_id={$odooId} | date: {$existing->date}->{$date} | type: {$existing->type}->{$type} | boat_id: {$existing->boat_id}->{$boatId} | qtty: {$existing->qtty}->{$qtty}");
        }

        // Closeddates::upsert([
        //     ['odoo_id' => $odooId, 'date' => $date, 'type' => $type, 'boat_id' => $boatId, 'qtty' => $qtty ?: null],
        // ], ['odoo_id'], ['date', 'type', 'boat_id', 'qtty']);

        return response()->json(['ok' => true]);
    }

    // ─── Resolve tour from order line IDs ────────────────────────────────────

    protected function resolveTour(array $lineIds): ?Tours
    {
        if (empty($lineIds)) {
            return null;
        }

        $lines = OdooService::post('/json/2/sale.order.line/search_read', [
            'domain' => [['id', 'in', array_values($lineIds)]],
            'fields' => ['product_id'],
            'limit'  => 50,
        ]);

        foreach ($lines as $line) {
            $productId = \is_array($line['product_id']) ? (int) $line['product_id'][0] : (int) $line['product_id'];
            $tour      = Tours::where('odoo_id', $productId)->first();
            if ($tour) {
                return $tour;
            }
        }

        return null;
    }
}
