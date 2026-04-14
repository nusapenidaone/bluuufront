<?php namespace Noren\Booking\Odoo;

use Illuminate\Routing\Controller;
use Noren\Booking\Models\CloseddatesTest as Closeddates;
use Noren\Booking\Models\Boat;
use Noren\Booking\Models\Tours;
use Noren\Booking\Odoo\OdooService;
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

        Log::info("Odoo webhook DELETE | odoo_id={$odooId} | {$found}");
        Closeddates::where('odoo_id', $odooId)->delete();

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
        $tourType = $payload['x_studio_tour_type'] ?? '';
        $qtty     = (int) ($payload['x_studio_count_of_people'] ?? 0);

        if (!$tourType) {
            $tourType = OdooService::fetchTourType($odooId);
            Log::info("Odoo webhook | odoo_id={$odooId} | x_studio_tour_type not in payload, fetched from Odoo: '{$tourType}'");
        }

        $tour = $tourType ? Tours::where('odoo_type', $tourType)->first() : null;

        if (!$tour) {
            Log::info("Odoo webhook SKIP | odoo_id={$odooId} | tour not found by odoo_type={$tourType}");
            return response()->json(['ok' => true]);
        }

        $type      = (int) $tour->types_id === 1 ? 1 : 2;
        $boat      = $boatName ? Boat::where('amo_name', $boatName)->first() : null;
        $newBoatId = $boat?->id;

        return $this->upsertCloseddate($odooId, $date, $type, $newBoatId, $boatName, $qtty, $tourType);
    }

    // ─── Upsert ───────────────────────────────────────────────────────────────

    protected function upsertCloseddate(int $odooId, string $date, int $type, ?int $boatId, string $boatName, int $qtty, string $tourType)
    {
        Closeddates::updateOrCreate(
            ['odoo_id' => $odooId],
            ['date' => $date, 'type' => $type, 'boat_id' => $boatId, 'qtty' => $qtty ?: null]
        );

        return response()->json(['ok' => true]);
    }
}
