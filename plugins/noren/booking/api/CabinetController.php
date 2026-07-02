<?php

namespace Noren\Booking\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Log;
use Noren\Booking\Classes\XenditService;
use Noren\Booking\Models\Cover;
use Noren\Booking\Models\Extras;
use Noren\Booking\Models\Order;
use Noren\Booking\Models\Route;
use Noren\Booking\Models\Transfer;
use Noren\Booking\Odoo\OdooService;

class CabinetController extends Controller
{
    private function cors(): void
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
        header('Access-Control-Allow-Headers: *');
    }

    private function findOrder(int $odooId): ?Order
    {
        return Order::where('odoo_id', $odooId)->first();
    }

    // Reuses the same boat/closeddates availability logic the booking site
    // already exposes publicly, instead of duplicating it here. Calling the
    // controller methods directly (not via routing) returns plain arrays.
    // Mirrors the site's own logic (private.jsx / shared.jsx):
    //  - private: date is binary available/not (boat exclusivity) — capacity
    //    against the order's already-assigned boat is checked separately
    //  - shared: date must have available_seats >= members (shared.jsx:7286)
    private function isDateAvailable(Order $order, string $date, int $members): bool
    {
        if (!$order->tours_id) {
            return true;
        }

        $order->loadMissing('tours');
        $isPrivate = in_array((int) $order->tours?->classes_id, [8]);
        $controller = app(FullController::class);
        $req = new Request(['date' => $date]);

        $resp = $isPrivate
            ? $controller->getPrivateAvailability($req, $order->tours_id)
            : $controller->getSharedAvailability($req, $order->tours_id);

        $data = $resp instanceof \Illuminate\Http\JsonResponse ? $resp->getData(true) : $resp;

        if ($isPrivate) {
            // Keyed by date => 1/0
            return !is_array($data) || !array_key_exists($date, $data) || (int) $data[$date] === 1;
        }

        // List of {date, available_seats, ...}
        $entry = collect($data)->firstWhere('date', $date);
        return !$entry || (int) ($entry['available_seats'] ?? 0) >= $members;
    }

    // ─── GET /api/new/cabinet/{odooId} ───────────────────────────────────────

    public function show(Request $request, int $odooId)
    {
        $this->cors();

        $order = $this->findOrder($odooId);
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        try {
            $odooOrder = OdooService::getFullOrder((int) $order->odoo_id);
        } catch (\Exception $e) {
            Log::error('CabinetController::show — Odoo error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch order'], 502);
        }

        $order->loadMissing(['tours', 'transfer', 'cover', 'route']);
        $isPrivate = in_array((int) $order->tours?->classes_id, [8]);
        $classesId = $isPrivate ? 8 : 9;

        $transfers = Transfer::orderBy('id')->get()
            ->filter(fn($t) => !$t->classes_id || (int) $t->classes_id === $classesId)
            ->map(fn($t) => [
                'id'        => $t->id,
                'name'      => $t->name,
                'price'     => (int) $t->price,
                'bus_price' => $t->bus_price ? (int) $t->bus_price : null,
            ])->values();

        $covers = Cover::orderBy('id')->get()
            ->filter(fn($c) => !$c->classes_id || (int) $c->classes_id === $classesId)
            ->map(fn($c) => [
                'id'       => $c->id,
                'name'     => $c->name,
                'price'    => (int) $c->price,
                'per_boat' => (bool) $c->per_boat,
            ])->values();

        // Routes & extras are only selectable on private tours — shared tours
        // have a fixed route+restaurant per tour (CLAUDE.md). Each route carries
        // its own extras catalog so switching routes client-side needs no refetch.
        $routes = [];
        if ($isPrivate) {
            $routes = Route::with(['ecategories.extras' => function ($q) {
                $q->whereNull('parent_id');
            }])
                ->where('classes_id', $classesId)
                ->orderBy('sort_order')
                ->get()
                ->map(fn($route) => [
                    'id'     => $route->id,
                    'title'  => $route->title,
                    'start'  => $route->start,
                    'end'    => $route->end,
                    'extras' => $route->ecategories
                        ->flatMap(fn($cat) => $cat->extras)
                        ->unique('id')
                        ->map(fn($e) => [
                            'id'       => $e->id,
                            'name'     => $e->name,
                            'price'    => (int) $e->price,
                            'qty_type' => $e->qty_type ?? 'manual',
                        ])->values(),
                ])
                ->values();
        }

        return response()->json([
            'local' => [
                'id'              => $order->id,
                'external_id'     => $order->external_id,
                'odoo_id'         => (int) $order->odoo_id,
                'tours_id'        => $order->tours_id ? (int) $order->tours_id : null,
                'tour_name'       => $order->tours?->name,
                'is_private'      => $isPrivate,
                'travel_date'     => $order->travel_date,
                'adults'          => (int) $order->adults,
                'kids'            => (int) $order->kids,
                'members'         => (int) $order->members,
                'transfer_id'     => $order->transfer_id ? (int) $order->transfer_id : null,
                'transfer_name'   => $order->transfer?->name,
                'cover_id'        => $order->cover_id ? (int) $order->cover_id : null,
                'cover_name'      => $order->cover?->name,
                'route_id'        => $order->route_id ? (int) $order->route_id : null,
                'route_name'      => $order->route?->title,
                'extras'          => $order->extras ?: [],
                'pickup_address'  => $order->pickup_address ?? '',
                'dropoff_address' => $order->dropoff_address ?? '',
                'name'            => $order->name,
                'email'           => $order->email,
                'whatsapp'        => $order->whatsapp,
            ],
            'odoo' => [
                'order_number'       => $odooOrder['name'] ?? '',
                'state'              => $odooOrder['state'] ?? '',
                'boat_name'          => $odooOrder['x_studio_boat_name'] ?? '',
                'route'              => $odooOrder['x_studio_route_new'] ?? '',
                'rental_start_date'  => $odooOrder['rental_start_date'] ?? null,
                'rental_return_date' => $odooOrder['rental_return_date'] ?? null,
                'deposit_paid'       => (float) ($odooOrder['x_studio_deposit'] ?? 0),
                'collect'            => (float) ($odooOrder['x_studio_collect'] ?? 0),
                'partner_name'       => is_array($odooOrder['partner_id'] ?? null)
                    ? ($odooOrder['partner_id'][1] ?? '')
                    : '',
                'lines'              => $odooOrder['lines'] ?? [],
            ],
            'options' => [
                'transfers' => $transfers,
                'covers'    => $covers,
                'routes'    => $routes,
            ],
        ]);
    }

    // ─── PATCH /api/new/cabinet/{odooId} ──────────────────────────────────────
    // Single combined update: date, addresses, adults, kids, transfer_id,
    // cover_id, route_id, extras → recalculate prices → recreate Odoo order.
    // Date is included in the same recalculation pass because tour price can
    // depend on the travel date (seasonal PricesByDates packages).

    public function update(Request $request, int $odooId)
    {
        $this->cors();

        $order = $this->findOrder($odooId);
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $order->loadMissing(['tours', 'boat.company', 'route', 'program', 'restaurant']);

        $date           = $request->has('date')           ? $request->input('date')           : $order->travel_date;
        $pickupAddress  = $request->has('pickup_address')  ? $request->input('pickup_address')  : $order->pickup_address;
        $dropoffAddress = $request->has('dropoff_address') ? $request->input('dropoff_address') : $order->dropoff_address;
        $adults         = $request->has('adults')          ? (int) $request->input('adults')    : (int) $order->adults;
        $kids           = $request->has('kids')            ? (int) $request->input('kids')      : (int) $order->kids;
        $transferId     = $request->has('transfer_id')     ? $request->input('transfer_id')     : $order->transfer_id;
        $coverId        = $request->has('cover_id')        ? $request->input('cover_id')        : $order->cover_id;
        $routeId        = $request->has('route_id')        ? $request->input('route_id')        : $order->route_id;
        $extras         = $request->has('extras')          ? $request->input('extras', [])      : ($order->extras ?: []);

        $members   = $adults + $kids;
        $isPrivate = in_array((int) $order->tours?->classes_id, [8]);

        // Recompute qty for auto-qty extras server-side so the stored value
        // always reflects the current guest count, regardless of what the
        // client sent (per_person, per_car, fixed types are never user-editable).
        if (!empty($extras)) {
            $extraIds    = array_filter(array_column((array) $extras, 'id'));
            $extraModels = Extras::whereIn('id', $extraIds)->get()->keyBy('id');
            $normalized  = [];
            foreach ((array) $extras as $item) {
                $mdl = $extraModels->get($item['id'] ?? null);
                if (!$mdl) continue;
                $qtyType = $mdl->qty_type ?? 'manual';
                $qty = match ($qtyType) {
                    'per_person' => max(1, $members),
                    'per_car'    => max(1, (int) ceil($members / 5)),
                    'fixed'      => 1,
                    default      => max(1, (int) ($item['qty'] ?? $item['quantity'] ?? 1)),
                };
                $normalized[] = [
                    'id'    => (int) $mdl->id,
                    'name'  => $item['name'] ?? $mdl->name,
                    'price' => (int) ($item['price'] ?? $mdl->price ?? 0),
                    'qty'   => $qty,
                ];
            }
            $extras = $normalized;
        }

        if ($date && $date !== $order->travel_date && !$this->isDateAvailable($order, $date, $members)) {
            return response()->json(['success' => false, 'error' => 'Selected date is not available for this many guests'], 422);
        }

        // Private tours keep the originally assigned boat — the cabinet doesn't
        // let the guest change it — so growing the party just needs a capacity
        // check, matching private.jsx's `totalGuests <= yacht.people`.
        if ($isPrivate && $order->boat && $order->boat->capacity && $members > (int) $order->boat->capacity) {
            return response()->json(['success' => false, 'error' => "This boat fits at most {$order->boat->capacity} guests"], 422);
        }

        $order->travel_date     = $date;
        $order->pickup_address  = $pickupAddress;
        $order->dropoff_address = $dropoffAddress;

        // ── Route change (private only) — pulls in matching program/restaurant ──
        if ($isPrivate && $routeId && (int) $routeId !== (int) $order->route_id) {
            $newRoute = Route::find($routeId);
            if ($newRoute) {
                $order->route_id      = $newRoute->id;
                $order->program_id    = $newRoute->program_id;
                $order->restaurant_id = $newRoute->restaurant_id;
                $order->setRelation('route', $newRoute);
                $order->setRelation('restaurant', $newRoute->restaurant);
            }
        }

        // ── Recalculate tour price ────────────────────────────────────────────
        $tour = $order->tours;
        $tour->loadMissing(['packages', 'pricesbydates.packages']);
        $pricelist = $tour->packages?->pricelist ?? [];

        if ($order->travel_date && $tour->pricesbydates->isNotEmpty()) {
            $seasonal = $tour->pricesbydates->first(
                fn($pbd) => $order->travel_date >= $pbd->date_start && $order->travel_date <= $pbd->date_end
            );
            if ($seasonal?->packages?->pricelist) {
                $pricelist = $seasonal->packages->pricelist;
            }
        }

        $tierPrice = 0;
        if (!empty($pricelist)) {
            $sorted    = collect($pricelist)->sortBy(fn($p) => (int) $p['members_count']);
            $entry     = $sorted->last(fn($p) => (int) $p['members_count'] <= $members) ?? $sorted->first();
            $tierPrice = (int) ($entry['price'] ?? 0);
        }

        $boatPrice = $isPrivate ? (int) ($tour->boat_price ?? 0) : 0;

        // ── Transfer ──────────────────────────────────────────────────────────
        // Total = unit price (bus_price tier if >5 pax) × cars — scales with
        // passenger count since more passengers need more cars.
        $transfer          = null;
        $transferUnitPrice = 0;
        $transferPrice     = 0;
        $cars              = 0;
        if ($transferId) {
            $transfer = Transfer::find($transferId);
            if ($transfer) {
                $cars = in_array((int) $transfer->id, [1, 2]) ? (int) ceil($members / 5) : 0;
                $transferUnitPrice = ($members > 5 && $transfer->bus_price)
                    ? (int) $transfer->bus_price
                    : (int) $transfer->price;
                $transferPrice = $transferUnitPrice * max(1, $cars);
            }
        }

        // ── Cover ─────────────────────────────────────────────────────────────
        // Private tours are charged per boat (qty 1); shared tours per passenger
        // (qty = members) — matches OdooService::addOrderLines' isShared switch.
        $cover          = null;
        $coverUnitPrice = 0;
        $coverPrice     = 0;
        if ($coverId) {
            $cover = Cover::find($coverId);
            if ($cover) {
                $coverUnitPrice = (int) ($cover->price ?? 0);
                $coverQty       = $isPrivate ? 1 : max(1, $members);
                $coverPrice     = $coverUnitPrice * $coverQty;
            }
        }

        // ── Extras total ──────────────────────────────────────────────────────
        $extrasTotal = 0;
        foreach ((array) $extras as $item) {
            $extrasTotal += (int) ($item['price'] ?? 0) * max(1, (int) ($item['qty'] ?? $item['quantity'] ?? 1));
        }

        $fullPrice = $tierPrice + $boatPrice + $transferPrice + $coverPrice + $extrasTotal;

        // ── Update local order ────────────────────────────────────────────────
        $order->adults         = $adults;
        $order->kids           = $kids;
        $order->members        = $members;
        $order->transfer_id    = $transferId ?: null;
        $order->cover_id       = $coverId ?: null;
        $order->extras         = $extras;
        $order->cars           = $cars;
        $order->tour_price     = $tierPrice;
        $order->boat_price     = $boatPrice;
        $order->transfer_price = $transferPrice;
        $order->cover_price    = $coverPrice;
        $order->extras_total   = $extrasTotal;
        $order->total_price    = $fullPrice;
        $order->full_price     = $fullPrice;
        $order->saveQuietly();

        // ── Recreate Odoo order ───────────────────────────────────────────────
        try {
            $result         = OdooService::recreateLead($order, $order->status_id == 2);
            $order->odoo_id = $result['order_id'];
            $order->saveQuietly();
        } catch (\Exception $e) {
            Log::error('CabinetController::update — ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }

        return response()->json([
            'success'     => true,
            'new_odoo_id' => (int) $order->odoo_id,
            'prices'      => [
                'tour_price'     => $tierPrice,
                'boat_price'     => $boatPrice,
                'transfer_price' => $transferPrice,
                'cover_price'    => $coverPrice,
                'extras_total'   => $extrasTotal,
                'full_price'     => $fullPrice,
            ],
        ]);
    }

    // ─── POST /api/new/cabinet/{odooId}/pay ──────────────────────────────────
    // Create payment link for remaining collect amount

    public function createPayment(Request $request, int $odooId)
    {
        $this->cors();

        $order = $this->findOrder($odooId);
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        try {
            $collectAmount = OdooService::getOrderCollect((int) $order->odoo_id);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to get collect amount'], 502);
        }

        if ($collectAmount <= 0) {
            return response()->json(['error' => 'No remaining amount to pay'], 400);
        }

        $order->loadMissing('tours');
        $description = $order->tours?->name ?? 'Bluuu Tour';

        // Use 'odoo_{odoo_id}' prefix: VerifyController handles it via OdooService::registerPayment / clearCollect
        $collectExtId = 'odoo_' . $order->odoo_id;
        $cancelUrl    = url('/cabinet/' . $order->odoo_id);
        $successUrl   = url('/cabinet/' . $order->odoo_id) . '?paid=1';

        // PayPal is disabled for the cabinet — Xendit only.
        $payUrl = XenditService::createPaymentLink(
            $collectExtId, $collectAmount, $order->email, $successUrl, $cancelUrl, $description
        );

        return response()->json(['payment_url' => $payUrl]);
    }
}
