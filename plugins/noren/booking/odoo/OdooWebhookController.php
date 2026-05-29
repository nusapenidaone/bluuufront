<?php namespace Noren\Booking\Odoo;

use Carbon\Carbon;
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

        $type = (int) $tour->types_id === 1 ? 1 : 2;

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
}
