<?php

namespace Noren\Booking\Ota;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Noren\Booking\Models\Tours;

class OtaController extends Controller
{
    private const API_KEY = 'ota_bluuu_k9x2m7p4n1q8r3s6';

    private function authenticate(Request $request): bool
    {
        return $request->header('Authorization') === 'Bearer ' . self::API_KEY;
    }

    private function cors(): void
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type');
    }

    // GET /api/ota/tours?source_id={n}
    public function tours(Request $request)
    {
        $this->cors();

        if (!$this->authenticate($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $sourceId = $request->query('source_id');
        if (!$sourceId) {
            return response()->json(['error' => 'source_id required'], 422);
        }

        $tours = Tours::with(['classes', 'source'])
            ->where('source_id', $sourceId)
            ->orderBy('sort_order')
            ->get();

        return response()->json(
            $tours->map(fn($tour) => $this->formatTour($tour))->values()
        );
    }

    // GET /api/ota/tour/{id}/availability?date=YYYY-MM-DD&members={n}
    public function availability(Request $request, int $id)
    {
        $this->cors();

        if (!$this->authenticate($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $date    = $request->query('date');
        $members = max(1, (int) $request->query('members', 1));
        $amount  = (float) $request->query('amount', 0);

        if (!$date) {
            return response()->json(['error' => 'date required'], 422);
        }

        $tour = Tours::with(['boat.closeddates', 'boat.company', 'route.restaurant', 'source', 'ota_transfer'])->find($id);

        if (!$tour) {
            return response()->json(['error' => 'Tour not found'], 404);
        }

        $isShared = $tour->types_id == 1;
        $boatModel = $isShared
            ? $this->findSharedBoat($tour, $date, $members)
            : $this->findPrivateBoat($tour, $date);

        $available = $boatModel !== null;

        if (!$available && $tour->boat->isNotEmpty()) {
            $boatModel = $tour->boat->first();
        }

        $route      = $tour->route;
        $restaurant = $route?->restaurant;
        $company    = optional($boatModel)->company;
        $boatName   = $boatModel ? ($boatModel->amo_name ?? $boatModel->name) : '';

        // Apply OTA commission
        $commission  = (float) ($tour->ota_commission ?? 0);
        $netAmount   = $amount > 0 ? round($amount * (1 - $commission / 100), 2) : 0;

        // Transfer from tour defaults
        $transfer       = $tour->ota_transfer;
        $cars           = 0;
        $transferCost   = 0;
        $carType        = '';
        $pickupCars     = 0;
        $dropOffCars    = 0;

        if ($transfer) {
            $cars         = (int) ceil($members / 5);
            $transferCost = $netAmount > 0 ? round((float) ($transfer->price ?? 0) * $cars, 2) : 0;
            $carType      = $transfer->odoo_name ?? '';
            $transferId   = (int) $transfer->id;
            $pickupCars   = ($transferId === 1 || $transferId === 2) ? $cars : 0;
            $dropOffCars  = ($transferId === 2) ? $cars : 0;
        }

        $tourNet    = round($netAmount - $transferCost, 2);
        $orderLines = [];

        if ($tour->odoo_id) {
            $tourLinePrice = $isShared && $members > 0 ? round($tourNet / $members, 2) : $tourNet;
            $tourLineQty   = $isShared ? $members : 1;
            $orderLines[] = [
                'product_id' => (int) $tour->odoo_id,
                'name'       => $tour->name,
                'qty'        => $tourLineQty,
                'price'      => $tourLinePrice,
            ];
        }

        if ($boatModel && $boatModel->odoo_id) {
            $orderLines[] = [
                'product_id' => (int) $boatModel->odoo_id,
                'name'       => $boatName,
                'qty'        => 1,
                'price'      => 0,
            ];
        }

        if ($restaurant && $restaurant->odoo_id) {
            $orderLines[] = [
                'product_id' => (int) $restaurant->odoo_id,
                'name'       => $restaurant->odoo_name ?? $restaurant->name,
                'qty'        => $members,
                'price'      => 0,
            ];
        }

        if ($transfer && $transfer->odoo_id && $cars > 0) {
            $orderLines[] = [
                'product_id' => (int) $transfer->odoo_id,
                'name'       => $transfer->name,
                'qty'        => $cars,
                'price'      => $netAmount > 0 ? (float) ($transfer->price ?? 0) : 0,
            ];
        }

        $start = $route?->start ?? '08:00:00';
        $end   = $route?->end   ?? '18:00:00';

        $odoo = [
            'x_studio_tour_type'      => $tour->odoo_type        ?? '',
            'x_studio_route_new'      => $route?->odoo_name      ?? '',
            'x_studio_lunch'          => $restaurant?->odoo_name ?? '',
            'x_studio_boat_name'      => $boatName,
            'x_studio_source'         => $tour->source?->name    ?? '',
            'x_studio_payment_source' => $tour->source?->name    ?? '',
            'company_id'              => $company?->odoo_id ? (int) $company->odoo_id : null,
            'rental_start_date'       => Carbon::parse("{$date} {$start}", 'Asia/Makassar')->utc()->format('Y-m-d H:i:s'),
            'rental_return_date'      => Carbon::parse("{$date} {$end}",   'Asia/Makassar')->utc()->format('Y-m-d H:i:s'),
            'x_studio_deposit'        => $netAmount,
            'order_lines'             => $orderLines,
        ];

        if ($transfer) {
            $odoo['x_studio_car_type']       = $carType;
            $odoo['x_studio_pickup_cars']    = $pickupCars;
            $odoo['x_studio_drop_off_cars']  = $dropOffCars;
        }

        return response()->json([
            'tour_id'   => $tour->id,
            'date'      => $date,
            'members'   => $members,
            'available' => $available,
            'source'    => $tour->source?->name,
            'odoo'      => $odoo,
        ]);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function formatTour(Tours $tour): array
    {
        return [
            'id'               => $tour->id,
            'name'             => $tour->name,
            'class_name'       => $tour->classes?->name,
            'source_id'        => $tour->source_id,
            'source'           => $tour->source?->name,
            'availability_url' => "/api/ota/tour/{$tour->id}/availability",
        ];
    }

    private function findSharedBoat(Tours $tour, string $date, int $members): ?object
    {
        $tourType = $tour->odoo_type ?? null;

        // $tour->boat already sorted by pivot sort_order ASC, then boat sort_order ASC
        foreach ($tour->boat as $boat) {
            if (!empty($boat->closed)) continue;

            $records = $boat->closeddates->filter(
                fn($cd) => $cd->deleted_at === null && substr($cd->date, 0, 10) === $date
            );

            // Block if type 2/3/4 (fully closed) OR has bookings of a different shared tour type
            $blocked = $records->contains(function ($cd) use ($tourType) {
                $t = (int) $cd->type;
                if ($cd->type === null || $cd->type === '' || in_array($t, [2, 3, 4])) return true;
                if ($t === 1 && $cd->tour_type && $tourType && $cd->tour_type !== $tourType) return true;
                return false;
            });

            if ($blocked) continue;

            // Count occupied seats for this tour type only
            $booked = $records->where('type', 1)->filter(
                fn($cd) => !$cd->tour_type || !$tourType || $cd->tour_type === $tourType
            )->sum('qtty');

            $available = max(0, (int) ($boat->capacity ?? 0) - (int) $booked);

            if ($available >= $members) {
                return $boat;
            }
        }

        return null;
    }

    private function findPrivateBoat(Tours $tour, string $date): ?object
    {
        foreach ($tour->boat as $boat) {
            if (!empty($boat->closed)) {
                continue;
            }

            $hasRecord = $boat->closeddates->first(
                fn($cd) => $cd->deleted_at === null && substr($cd->date, 0, 10) === $date
            );

            if (!$hasRecord) {
                return $boat;
            }
        }

        return null;
    }
}
