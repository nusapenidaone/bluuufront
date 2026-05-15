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

        $odooId = (int) ($payload['id'] ?? $payload['_id'] ?? (isset($payload['ids']) ? $payload['ids'][0] : 0));

        if (!$odooId) {
            return response()->json(['ok' => false], 400);
        }

        $state = $payload['state'] ?? null;

        Log::info("Odoo webhook | odoo_id={$odooId} | state={$state}");

        // Case 4: cancel → delete record
        if ($state === 'cancel') {
            return $this->handleCancel($odooId);
        }

        // Cases 0, 1, 2, 3: sale → create or update record
        if ($state === 'sale') {
            return $this->handleSale($odooId, $payload);
        }

        // quotation / draft / sent → ignore (don't touch the record)
        return response()->json(['ok' => true]);
    }

    // ─── Case 4: cancel → delete ──────────────────────────────────────────────

    protected function handleCancel(int $odooId)
    {
        $deleted = Closeddates::where('odoo_id', $odooId)->delete();
        Log::info("Odoo webhook CANCEL | odoo_id={$odooId} | deleted={$deleted}");
        return response()->json(['ok' => true]);
    }

    // ─── Cases 0, 1, 2, 3: sale → upsert ─────────────────────────────────────

    protected function handleSale(int $odooId, array $payload)
    {
        // Resolve tour type (needed to determine shared=1 / private=2)
        $tourType = $payload['x_studio_tour_type'] ?? null;
        if (!$tourType) {
            $tourType = OdooService::fetchTourType($odooId);
        }

        $tour = $tourType ? Tours::where('odoo_type', $tourType)->first() : null;
        if (!$tour) {
            Log::info("Odoo webhook SKIP | odoo_id={$odooId} | tour not found for odoo_type={$tourType}");
            return response()->json(['ok' => true]);
        }

        $type = (int) $tour->types_id === 1 ? 1 : 2;

        // Load existing record so we can preserve fields missing from payload
        $existing = Closeddates::where('odoo_id', $odooId)->first();

        // ── Case 1: date ──────────────────────────────────────────────────────
        $dateRaw = $payload['rental_start_date'] ?? null;
        $date    = $dateRaw
            ? substr($dateRaw, 0, 10)
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

        $action = $existing ? 'UPDATE' : 'CREATE';

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

        Log::info("Odoo webhook {$action} | odoo_id={$odooId} | date={$date} | type={$type} | boat_id={$boatId} | qtty={$qtty}");

        return response()->json(['ok' => true]);
    }
}
