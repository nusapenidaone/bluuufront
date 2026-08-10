<?php

namespace Noren\Booking\Api;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Log;
use Noren\Booking\Classes\XenditService;
use Noren\Booking\Models\Boat;
use Noren\Booking\Models\Cover;
use Noren\Booking\Models\Extras;
use Noren\Booking\Models\Restaurant;
use Noren\Booking\Models\Route;
use Noren\Booking\Models\Tours;
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

    // Fetch Odoo order and verify key matches client_order_ref (= external_id set at order creation).
    private function fetchOdooOrder(int $odooId, string $key): ?array
    {
        try {
            $order = OdooService::getFullOrder($odooId);
        } catch (\Exception $e) {
            Log::warning('CabinetController: Odoo fetch failed', ['odoo_id' => $odooId, 'error' => $e->getMessage()]);
            return null;
        }

        $uniqueKey = $order['x_studio_unique_key'] ?? '';
        if (!$uniqueKey || $uniqueKey !== $key) {
            return null;
        }

        if (($order['state'] ?? '') === 'cancel') {
            return null;
        }

        return $order;
    }

    // Detect private/shared and local toursId from Odoo order lines → local Tours.types_id.
    // Returns [$isPrivate, $classesId, $toursId] or null if tour not found in local DB.
    private function detectTourType(array $odooOrder): ?array
    {
        $lines      = $odooOrder['lines'] ?? [];
        $productIds = array_filter(array_map(function ($line) {
            $pid = $line['product_id'] ?? null;
            return is_array($pid) ? (int) $pid[0] : ($pid ? (int) $pid : null);
        }, $lines));

        if (!empty($productIds)) {
            $tour = Tours::whereIn('odoo_id', array_values($productIds))->first();
            if ($tour && $tour->types_id) {
                $isPrivate = (int) $tour->types_id === 2;
                $classesId = $isPrivate ? 8 : 9;
                return [$isPrivate, $classesId, (int) $tour->id];
            }
        }

        return null;
    }

    // ─── GET /api/new/cabinet/{odooId}/{key} ─────────────────────────────────

    public function show(Request $request, int $odooId, string $key)
    {
        $this->cors();

        $odooOrder = $this->fetchOdooOrder($odooId, $key);
        if (!$odooOrder) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $tourType = $this->detectTourType($odooOrder);
        if ($tourType === null) {
            return response()->json(['error' => 'Tour not found'], 404);
        }
        [$isPrivate, $classesId, $toursId] = $tourType;

        // Tour image via local Tours lookup by product odoo_id from order lines
        $tourImage = null;
        $productIds = array_filter(array_map(
            fn($l) => is_array($l['product_id'] ?? null) ? $l['product_id'][0] : ($l['product_id'] ?? null),
            $odooOrder['lines'] ?? []
        ));
        $tourName = null;
        if (!empty($productIds)) {
            $tour = Tours::with(['included', 'includes', 'packages', 'pricesbydates.packages'])
                ->whereIn('odoo_id', array_values($productIds))->first();
            if ($tour) {
                $tourName = $tour->name;
                $imgs = $tour->images_with_thumbs ?? [];
                if (!empty($imgs)) {
                    $tourImage = $imgs[0]['thumb2'] ?? $imgs[0]['thumb1'] ?? $imgs[0]['original'] ?? null;
                }
            }
        }

        // Boat capacity for guest stepper max
        $boatCapacity = null;
        $boatNameOdoo = $odooOrder['x_studio_boat_name'] ?? null;
        if ($boatNameOdoo) {
            $boatModel = Boat::where('amo_name', $boatNameOdoo)->orWhere('name', $boatNameOdoo)->first();
            if ($boatModel) $boatCapacity = (int) $boatModel->capacity ?: null;
        }

        // Travel date: rental_start_date (UTC) → Bali date
        $travelDate = null;
        if (!empty($odooOrder['rental_start_date'])) {
            $travelDate = Carbon::parse($odooOrder['rental_start_date'], 'UTC')
                ->setTimezone('Asia/Makassar')
                ->format('Y-m-d');
        }

        $partnerName = is_array($odooOrder['partner_id'] ?? null)
            ? ($odooOrder['partner_id'][1] ?? '')
            : '';

        // Options from local DB
        // Map Odoo order lines: product_id → {qty, price}
        $lineProducts = [];
        foreach ($odooOrder['lines'] ?? [] as $line) {
            $pid = $line['product_id'] ?? null;
            if (is_array($pid)) $pid = (int) $pid[0];
            // Skip qty=0 lines (soft-removed on confirmed orders)
            if ($pid && (int) ($line['product_uom_qty'] ?? 0) > 0) {
                $lineProducts[(int) $pid] = [
                    'qty'   => (int) ($line['product_uom_qty'] ?? 1),
                    'price' => (float) ($line['price_unit'] ?? 0),
                ];
            }
        }
        $lineProductIds = array_keys($lineProducts);

        // Detect current transfer from order lines
        $allTransferModels = Transfer::orderBy('id')->get();
        $currentTransferId = null;
        foreach ($allTransferModels as $t) {
            if ($t->odoo_id && in_array((int) $t->odoo_id, $lineProductIds)) {
                $currentTransferId = $t->id;
                break;
            }
        }

        // Detect current cover from order lines
        $allCoverModels = Cover::orderBy('id')->get();
        $currentCoverId = null;
        foreach ($allCoverModels as $c) {
            if ($c->odoo_id && in_array((int) $c->odoo_id, $lineProductIds)) {
                $currentCoverId = $c->id;
                break;
            }
        }

        $toursTypeId = isset($tour) ? (int) $tour->types_id : null;

        $transfers = $allTransferModels
            ->filter(fn($t) => !$t->types_id || (int) $t->types_id === $toursTypeId)
            ->map(fn($t) => [
                'id'        => $t->id,
                'name'      => $t->name,
                'price'     => (int) $t->price,
                'bus_price' => $t->bus_price ? (int) $t->bus_price : null,
            ])->values();

        $covers = $allCoverModels
            ->filter(fn($c) => !$c->types_id || (int) $c->types_id === $toursTypeId)
            ->map(fn($c) => [
                'id'       => $c->id,
                'name'     => $c->name,
                'price'    => (int) $c->price,
                'per_boat' => (bool) $c->per_boat,
            ])->values();

        $routes        = [];
        $currentRouteId = null;
        $currentExtras  = [];

        if ($isPrivate) {
            $routeModels = Route::with([
                    'photos',
                    'ecategories'                  => fn($q) => $q->orderBy('sort_order'),
                    'ecategories.extras'           => fn($q) => $q->whereNull('parent_id')->orderBy('sort_order'),
                    'ecategories.extras.children'  => fn($q) => $q->orderBy('sort_order'),
                ])
                ->where('classes_id', $classesId)
                ->orderBy('sort_order')
                ->get();

            // Build extras lookup by odoo_id to detect current extras from order lines
            $extrasByOdooId = [];
            foreach ($routeModels as $routeObj) {
                foreach ($routeObj->ecategories as $cat) {
                    foreach ($cat->extras as $extra) {
                        if ($extra->odoo_id) {
                            $extrasByOdooId[(int) $extra->odoo_id] = $extra;
                        }
                        foreach ($extra->children ?? [] as $child) {
                            if ($child->odoo_id) {
                                $extrasByOdooId[(int) $child->odoo_id] = $child;
                            }
                        }
                    }
                }
            }
            // Detect current extras from Odoo order lines matched against site catalog
            foreach ($lineProductIds as $pid) {
                if (isset($extrasByOdooId[$pid])) {
                    $extra = $extrasByOdooId[$pid];
                    $currentExtras[] = [
                        'id'    => $extra->id,
                        'name'  => $extra->name,
                        'price' => (int) $extra->price,
                        'qty'   => $lineProducts[$pid]['qty'],
                    ];
                }
            }

            // Detect current route from x_studio_route_new
            $routeNameOdoo = $odooOrder['x_studio_route_new'] ?? null;
            if ($routeNameOdoo) {
                $routeMatch = $routeModels->first(
                    fn($r) => ($r->odoo_name ?? $r->title) === $routeNameOdoo
                );
                if ($routeMatch) $currentRouteId = $routeMatch->id;
            }
            if (!$currentRouteId && $routeModels->isNotEmpty()) {
                $currentRouteId = $routeModels->first()->id;
            }

            $mapExtra = fn($e) => [
                'id'       => $e->id,
                'name'     => $e->name,
                'price'    => (int) $e->price,
                'qty_type' => $e->qty_type ?? 'manual',
                'image'    => $e->images_with_thumbs[0]['thumb_small'] ?? null,
                'children' => ($e->children ?? collect())->sortBy('sort_order')->map(fn($c) => [
                    'id'       => $c->id,
                    'name'     => $c->name,
                    'price'    => (int) $c->price,
                    'qty_type' => $c->qty_type ?? 'manual',
                    'image'    => $c->images_with_thumbs[0]['thumb_small'] ?? null,
                ])->values(),
            ];

            $routes = $routeModels->map(function ($route) use ($mapExtra) {
                    $categories = $route->ecategories
                        ->map(fn($cat) => [
                            'id'     => $cat->id,
                            'name'   => $cat->name,
                            'extras' => $cat->extras->map($mapExtra)->values(),
                        ])
                        ->filter(fn($cat) => count($cat['extras']) > 0)
                        ->values();
                    $image = null;
                    if ($route->photos->isNotEmpty()) {
                        try { $image = $route->photos->first()->getThumb(900, 600, ['mode' => 'crop']); }
                        catch (\Exception $e) { $image = $route->photos->first()->path ?? null; }
                    }
                    return [
                        'id'          => $route->id,
                        'title'       => $route->title,
                        'start'       => $route->start,
                        'end'         => $route->end,
                        'description' => $route->description,
                        'image'       => $image,
                        'highlights'  => $route->highlights ?? [],
                        'best_for'    => $route->best_for,
                        'categories'  => $categories,
                        'extras'      => $route->ecategories->flatMap(fn($c) => $c->extras)->unique('id')->map($mapExtra)->values(),
                        'schedule'    => [
                            'before_lunch' => $route->schedule_before_lunch ?? [],
                            'after_lunch'  => $route->schedule_after_lunch  ?? [],
                        ],
                    ];
                })
                ->values();
        }

        // Shared tour: look up the current route's schedule by Odoo route name
        $sharedRouteSchedule = null;
        if (!$isPrivate) {
            $routeNameOdoo = $odooOrder['x_studio_route_new'] ?? null;
            if ($routeNameOdoo) {
                $sharedRoute = Route::where('odoo_name', $routeNameOdoo)
                    ->orWhere('title', $routeNameOdoo)
                    ->first();
                if ($sharedRoute) {
                    $sharedRouteSchedule = [
                        'before_lunch' => $sharedRoute->schedule_before_lunch ?? [],
                        'after_lunch'  => $sharedRoute->schedule_after_lunch  ?? [],
                    ];
                }
            }
        }

        return response()->json([
            'local' => [
                'odoo_id'         => $odooId,
                'is_private'      => $isPrivate,
                'tour_name'       => $tourName,
                'tour_image'      => $tourImage,
                'travel_date'     => $travelDate,
                'adults'          => (int) ($odooOrder['x_studio_adults']          ?? 0),
                'kids'            => (int) ($odooOrder['x_studio_kids']            ?? 0),
                'members'         => (int) ($odooOrder['x_studio_count_of_people'] ?? 0),
                'pickup_address'  => $odooOrder['x_studio_pickup_address']   ?? '',
                'dropoff_address' => $odooOrder['x_studio_drop_off_address'] ?? '',
                'boat_name'       => $odooOrder['x_studio_boat_name'] ?? null,
                'boat_capacity'   => $boatCapacity,
                'name'            => $partnerName,
                'tours_id'        => $toursId,
                'transfer_id'     => $currentTransferId,
                'cover_id'        => $currentCoverId,
                'route_id'        => $currentRouteId,
                'route_name'      => $isPrivate
                    ? (isset($routeModels) ? optional($routeModels->firstWhere('id', $currentRouteId))->title : null)
                    : ($odooOrder['x_studio_route_new'] ?? null),
                'extras'          => $currentExtras,
                'tour_odoo_type'  => isset($tour) ? ($tour->odoo_type ?? null) : null,
                'source_id'       => isset($tour) ? (int) $tour->source_id : null,
            ],
            'odoo' => [
                'order_number'       => $odooOrder['name']             ?? '',
                'state'              => $odooOrder['state']            ?? '',
                'source'             => $odooOrder['x_studio_source']  ?? null,
                'boat_name'          => $odooOrder['x_studio_boat_name']  ?? '',
                'route'              => $odooOrder['x_studio_route_new']  ?? '',
                'rental_start_date'  => $odooOrder['rental_start_date']   ?? null,
                'rental_return_date' => $odooOrder['rental_return_date']  ?? null,
                'deposit_paid'       => (float) ($odooOrder['x_studio_deposit'] ?? 0),
                'collect'            => (float) ($odooOrder['x_studio_collect']  ?? 0),
                'partner_name'       => $partnerName,
                'lines'              => $odooOrder['lines'] ?? [],
                'online_checked_in'  => !empty($odooOrder['x_studio_online_check_in_complete']),
            ],
            'options' => [
                'transfers'     => $transfers,
                'covers'        => $covers,
                'routes'        => $routes,
                'price_list'    => $this->buildPricelist($tour ?? null, $travelDate),
                'upgrade_tour'  => $this->buildUpgradeTour(
                    isset($tour) ? $tour : null,
                    $isPrivate,
                    $travelDate,
                    (int) ($odooOrder['x_studio_count_of_people'] ?? 0)
                ),
                'route_schedule' => $isPrivate ? null : $sharedRouteSchedule,
                'tour_included'  => isset($tour) ? $tour->included->map(fn($i) => [
                    'name'        => $i->name,
                    'description' => $i->description ?? null,
                    'icon_svg'    => $i->icon_svg    ?? null,
                ])->values() : [],
                'tour_includes'  => isset($tour) ? $tour->includes->map(fn($i) => [
                    'name'     => $i->name,
                    'icon_svg' => $i->icon_svg ?? null,
                ])->values() : [],
            ],
        ]);
    }

    // ─── PATCH /api/new/cabinet/{odooId}/{key} ────────────────────────────────
    // Updates Odoo order: header fields (date, guests, addresses) + order lines
    // (transfer, cover, extras). No price recalculation for tour itself.

    public function update(Request $request, int $odooId, string $key)
    {
        $this->cors();

        $odooOrder = $this->fetchOdooOrder($odooId, $key);
        if (!$odooOrder) {
            return response()->json(['success' => false, 'error' => 'Order not found'], 404);
        }

        $date           = $request->input('date');
        $pickupAddress  = $request->input('pickup_address');
        $dropoffAddress = $request->input('dropoff_address');
        $adults         = $request->has('adults') ? (int) $request->input('adults') : null;
        $kids           = $request->has('kids')   ? (int) $request->input('kids')   : null;

        $curAdults = (int) ($odooOrder['x_studio_adults'] ?? 0);
        $curKids   = (int) ($odooOrder['x_studio_kids']   ?? 0);
        $newAdults = $adults ?? $curAdults;
        $newKids   = $kids   ?? $curKids;
        $members   = $newAdults + $newKids;

        $dateChanged    = $date !== null;
        $membersChanged = $adults !== null || $kids !== null;

        // ── Header fields ──────────────────────────────────────────────────────
        $fields = [];

        if ($date) {
            $fields['rental_start_date']  = Carbon::parse($date . ' 08:00:00', 'Asia/Makassar')->utc()->format('Y-m-d H:i:s');
            $fields['rental_return_date'] = Carbon::parse($date . ' 18:00:00', 'Asia/Makassar')->utc()->format('Y-m-d H:i:s');
        }

        if ($adults !== null) $fields['x_studio_adults'] = $newAdults;
        if ($kids   !== null) $fields['x_studio_kids']   = $newKids;
        if ($adults !== null || $kids !== null) {
            $fields['x_studio_count_of_people'] = $members;
        }

        if ($pickupAddress  !== null) $fields['x_studio_pickup_address']   = $pickupAddress;
        if ($dropoffAddress !== null) $fields['x_studio_drop_off_address'] = $dropoffAddress;

        // ── Parse current order lines → match to local models ─────────────────
        $allTransfers    = Transfer::orderBy('id')->get();
        $allCovers       = Cover::orderBy('id')->get();
        $allExtrasById   = Extras::whereNotNull('odoo_id')->get()->keyBy('id');
        $allRestaurants  = Restaurant::whereNotNull('odoo_id')->get();

        $existingTransferLine    = null; // ['id', 'local_id', 'qty', 'price']
        $existingNoTransferLineId = null; // line ID of the "No Transfer" placeholder (product_id=23)
        $existingCoverLine       = null;
        $existingRestaurantLine  = null; // ['id', 'qty']
        // keyed by odoo product_id: ['id' => lineId, 'qty' => qty]
        $existingExtrasLines  = [];

        foreach ($odooOrder['lines'] ?? [] as $line) {
            $pid = $line['product_id'] ?? null;
            if (is_array($pid)) $pid = (int) $pid[0];
            if (!$pid) continue;
            $lineQty = (int) ($line['product_uom_qty'] ?? 0);

            if ($pid === 23) {
                $existingNoTransferLineId = $line['id'];
            }
            foreach ($allTransfers as $t) {
                if ($t->odoo_id && (int) $t->odoo_id === $pid && $lineQty > 0) {
                    $existingTransferLine = ['id' => $line['id'], 'local_id' => (int) $t->id, 'qty' => $lineQty, 'price' => (float) ($line['price_unit'] ?? 0)];
                }
            }
            foreach ($allCovers as $c) {
                if ($c->odoo_id && (int) $c->odoo_id === $pid && $lineQty > 0) {
                    $existingCoverLine = ['id' => $line['id'], 'local_id' => (int) $c->id, 'qty' => $lineQty, 'price' => (float) ($line['price_unit'] ?? 0)];
                }
            }
            foreach ($allRestaurants as $r) {
                if ($r->odoo_id && (int) $r->odoo_id === $pid) {
                    $existingRestaurantLine = ['id' => $line['id'], 'qty' => $lineQty];
                }
            }
            foreach ($allExtrasById as $extra) {
                if ($extra->odoo_id && (int) $extra->odoo_id === $pid) {
                    // Store all extras lines (including qty=0) so we can update them
                    $existingExtrasLines[$pid] = ['id' => $line['id'], 'qty' => $lineQty];
                }
            }
        }

        // ── Cancel → draft before any changes ────────────────────────────────
        $wasSale = ($odooOrder['state'] ?? '') === 'sale';
        if ($wasSale) {
            try {
                OdooService::cancelOrder($odooId);
                OdooService::draftOrder($odooId);
            } catch (\Exception $e) {
                Log::error('CabinetController::update cancel/draft — ' . $e->getMessage());
                return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
            }
        }

        try {
            // ── Transfer line ──────────────────────────────────────────────────
            $requestHasTransfer = $request->has('transfer_id');
            $requestedTransferId = $requestHasTransfer
                ? ($request->input('transfer_id') ? (int) $request->input('transfer_id') : null)
                : null;

            if ($requestHasTransfer) {
                if ($requestedTransferId === null) {
                    // No transfer — replace line with "No transfer" product (id=23, price=0)
                    if ($existingTransferLine) {
                        OdooService::writeOrderLine($existingTransferLine['id'], [
                            'product_id'      => 23,
                            'product_uom_qty' => 1,
                            'price_unit'      => 0.0,
                            'name'            => 'Transfer',
                        ]);
                    }
                    $fields['x_studio_pickup_cars']   = 0;
                    $fields['x_studio_drop_off_cars'] = 0;
                    $fields['x_studio_car_type']      = false;
                } else {
                    $newTransfer = $allTransfers->firstWhere('id', $requestedTransferId);
                    if ($newTransfer && $newTransfer->odoo_id) {
                        $cars      = in_array((int) $newTransfer->id, [1, 2]) ? max(1, (int) ceil($members / 5)) : 1;
                        $unitPrice = (float) $newTransfer->price;
                        $fields['x_studio_pickup_cars']   = in_array((int) $newTransfer->id, [1, 2]) ? $cars : 0;
                        $fields['x_studio_drop_off_cars'] = (int) $newTransfer->id === 2 ? $cars : 0;
                        $fields['x_studio_car_type']      = $newTransfer->odoo_name ?: false;

                        if ($existingTransferLine && $existingTransferLine['local_id'] === $requestedTransferId) {
                            OdooService::writeOrderLine($existingTransferLine['id'], [
                                'product_uom_qty' => $cars,
                                'price_unit'      => $unitPrice,
                            ]);
                        } else {
                            if ($existingTransferLine) {
                                OdooService::writeOrderLine($existingTransferLine['id'], [
                                    'product_id'      => (int) $newTransfer->odoo_id,
                                    'product_uom_qty' => $cars,
                                    'price_unit'      => $unitPrice,
                                    'name'            => $newTransfer->name,
                                ]);
                            } else {
                                if ($existingNoTransferLineId) {
                                    OdooService::unlinkOrderLines([$existingNoTransferLineId]);
                                }
                                OdooService::addOrderLine($odooId, (int) $newTransfer->odoo_id, $cars, $unitPrice, $newTransfer->name);
                            }
                        }
                    }
                }
            } elseif ($adults !== null || $kids !== null) {
                if ($existingTransferLine && in_array($existingTransferLine['local_id'], [1, 2])) {
                    $cars = max(1, (int) ceil($members / 5));
                    OdooService::writeOrderLine($existingTransferLine['id'], ['product_uom_qty' => $cars]);
                    $fields['x_studio_pickup_cars'] = $cars;
                }
            }

            // ── Cover line ─────────────────────────────────────────────────────
            if ($request->has('cover_id')) {
                $requestedCoverId = $request->input('cover_id') ? (int) $request->input('cover_id') : null;

                if ($requestedCoverId === null) {
                    if ($existingCoverLine) {
                        OdooService::unlinkOrderLines([$existingCoverLine['id']]);
                    }
                } else {
                    $newCover = $allCovers->firstWhere('id', $requestedCoverId);
                    if ($newCover && $newCover->odoo_id) {
                        $coverQty   = $newCover->per_boat ? 1 : max(1, $members);
                        $coverPrice = (float) $newCover->price;

                        if ($existingCoverLine && $existingCoverLine['local_id'] === $requestedCoverId) {
                            if ($existingCoverLine['qty'] !== $coverQty) {
                                OdooService::writeOrderLine($existingCoverLine['id'], ['product_uom_qty' => $coverQty]);
                            }
                        } elseif ($existingCoverLine) {
                            OdooService::writeOrderLine($existingCoverLine['id'], [
                                'product_id'      => (int) $newCover->odoo_id,
                                'product_uom_qty' => $coverQty,
                                'price_unit'      => $coverPrice,
                                'name'            => $newCover->name,
                            ]);
                        } else {
                            OdooService::addOrderLine($odooId, (int) $newCover->odoo_id, $coverQty, $coverPrice, $newCover->name);
                        }
                    }
                }
            } elseif (($adults !== null || $kids !== null) && $existingCoverLine) {
                $covObj = $allCovers->firstWhere('id', $existingCoverLine['local_id']);
                if ($covObj && !$covObj->per_boat) {
                    OdooService::writeOrderLine($existingCoverLine['id'], ['product_uom_qty' => max(1, $members)]);
                }
            }

            // ── Restaurant qty (follows members count) ────────────────────────
            if (($adults !== null || $kids !== null) && $existingRestaurantLine) {
                if ($existingRestaurantLine['qty'] !== $members) {
                    OdooService::writeOrderLine($existingRestaurantLine['id'], ['product_uom_qty' => max(1, $members)]);
                }
            }

            // ── Tour line price recalculation (date or members changed) ───────
            if ($dateChanged || $membersChanged) {
                $allTourOdooIds = Tours::whereNotNull('odoo_id')
                    ->pluck('odoo_id')->map(fn($v) => (int) $v)->toArray();
                $tourLineId     = null;
                $tourLineOdooId = null;
                foreach ($odooOrder['lines'] ?? [] as $line) {
                    $lpid = $line['product_id'] ?? null;
                    if (is_array($lpid)) $lpid = (int) $lpid[0];
                    if ($lpid && in_array($lpid, $allTourOdooIds) && (int) ($line['product_uom_qty'] ?? 0) > 0) {
                        $tourLineId     = $line['id'];
                        $tourLineOdooId = $lpid;
                        break;
                    }
                }

                if ($tourLineId && $tourLineOdooId) {
                    $localTour = Tours::with(['packages', 'pricesbydates.packages'])
                        ->where('odoo_id', $tourLineOdooId)->first();

                    if ($localTour) {
                        $newTravelDate = $date ?? (
                            !empty($odooOrder['rental_start_date'])
                                ? Carbon::parse($odooOrder['rental_start_date'], 'UTC')
                                    ->setTimezone('Asia/Makassar')->format('Y-m-d')
                                : null
                        );

                        $pricelist = $localTour->packages?->pricelist ?? [];
                        if ($newTravelDate && $localTour->pricesbydates->isNotEmpty()) {
                            $seasonal = $localTour->pricesbydates->first(
                                fn($p) => $newTravelDate >= $p->date_start && $newTravelDate <= $p->date_end
                            );
                            if ($seasonal?->packages?->pricelist) {
                                $pricelist = $seasonal->packages->pricelist;
                            }
                        }

                        $tourPrice = null;
                        if (!empty($pricelist)) {
                            $entry = collect($pricelist)->sortByDesc('members_count')
                                ->first(fn($e) => $members >= (int) ($e['members_count'] ?? 0));
                            if (!$entry) {
                                $entry = collect($pricelist)->sortBy('members_count')->first();
                            }
                            $tourPrice = isset($entry) ? (int) ($entry['price'] ?? 0) : null;
                        }

                        if ($tourPrice !== null) {
                            if ((int) $localTour->types_id === 2) {
                                // private: qty=1, price = tour_price + boat_price
                                $boatPrice = (int) ($localTour->boat_price ?? 0);
                                OdooService::writeOrderLine($tourLineId, [
                                    'product_uom_qty' => 1,
                                    'price_unit'      => (float) ($tourPrice + $boatPrice),
                                ]);
                            } else {
                                // shared: qty=members, price per person
                                $pricePerPerson = $members > 0 ? $tourPrice / $members : 0;
                                OdooService::writeOrderLine($tourLineId, [
                                    'product_uom_qty' => max(1, $members),
                                    'price_unit'      => round((float) $pricePerPerson, 2),
                                ]);
                            }
                        }
                    }
                }
            }

            // ── Extras lines ───────────────────────────────────────────────────
            if ($request->has('extras')) {
                $requestedExtrasMap = [];
                foreach ((array) $request->input('extras', []) as $item) {
                    $localId = (int) ($item['id'] ?? 0);
                    $extra   = $allExtrasById->get($localId);
                    if (!$extra || !$extra->odoo_id) continue;
                    $requestedExtrasMap[(int) $extra->odoo_id] = [
                        'extra' => $extra,
                        'item'  => $item,
                        'qty'   => (int) ($item['qty'] ?? 1),
                    ];
                }

                $toUnlink = [];
                foreach ($existingExtrasLines as $productOdooId => $info) {
                    if (!isset($requestedExtrasMap[$productOdooId])) {
                        $toUnlink[] = $info['id'];
                    }
                }
                if (!empty($toUnlink)) {
                    OdooService::unlinkOrderLines($toUnlink);
                }

                $newExtrasVals = [];
                foreach ($requestedExtrasMap as $productOdooId => $req) {
                    if (isset($existingExtrasLines[$productOdooId])) {
                        if ($existingExtrasLines[$productOdooId]['qty'] !== $req['qty']) {
                            OdooService::writeOrderLine($existingExtrasLines[$productOdooId]['id'], [
                                'product_uom_qty' => $req['qty'],
                            ]);
                        }
                    } else {
                        $newExtrasVals[] = [
                            'product_id'      => $productOdooId,
                            'product_uom_qty' => $req['qty'],
                            'price_unit'      => (float) ($req['item']['price'] ?? $req['extra']->price ?? 0),
                            'name'            => $req['item']['name'] ?? $req['extra']->name,
                        ];
                    }
                }
                if (!empty($newExtrasVals)) {
                    OdooService::bulkAddOrderLines($odooId, $newExtrasVals);
                }
            }

            // ── Auto-extras qty recalculation (per_car / per_person / fixed) ──
            if ($membersChanged) {
                $autoCars = max(1, (int) ceil($members / 5));
                foreach ($existingExtrasLines as $productOdooId => $info) {
                    if ($info['qty'] <= 0) continue;
                    $extra = $allExtrasById->first(fn($e) => (int) ($e->odoo_id ?? 0) === $productOdooId);
                    if (!$extra) continue;
                    $newQty = match ($extra->qty_type ?? 'manual') {
                        'per_person' => max(1, $members),
                        'per_car'    => $autoCars,
                        'fixed'      => 1,
                        default      => null,
                    };
                    if ($newQty !== null && $info['qty'] !== $newQty) {
                        OdooService::writeOrderLine($info['id'], ['product_uom_qty' => $newQty]);
                    }
                }
            }

            // ── Header fields ──────────────────────────────────────────────────
            if (!empty($fields)) {
                OdooService::updateOrderHeaderFields($odooId, $fields);
            }
        } catch (\Exception $e) {
            Log::error('CabinetController::update — ' . $e->getMessage());
            if ($wasSale) {
                try { OdooService::confirmOrder($odooId); } catch (\Exception $ignored) {}
            }
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }

        // ── Re-confirm ────────────────────────────────────────────────────────
        if ($wasSale) {
            try {
                OdooService::confirmOrder($odooId);
            } catch (\Exception $e) {
                Log::error('CabinetController::update confirm — ' . $e->getMessage());
                return response()->json(['success' => false, 'error' => 'Changes saved but order could not be re-confirmed. Please check in Odoo.'], 500);
            }
        }

        return response()->json(['success' => true]);
    }

    // ─── POST /api/new/cabinet/{odooId}/{key}/pay ─────────────────────────────

    public function createPayment(Request $request, int $odooId, string $key)
    {
        $this->cors();

        $odooOrder = $this->fetchOdooOrder($odooId, $key);
        if (!$odooOrder) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $collectAmount = (float) ($odooOrder['x_studio_collect'] ?? 0);
        if ($collectAmount <= 0) {
            return response()->json(['error' => 'No remaining amount to pay'], 400);
        }

        $partnerId = is_array($odooOrder['partner_id'] ?? null) ? $odooOrder['partner_id'][0] : null;
        $email     = null;
        if ($partnerId) {
            try {
                $partners = OdooService::readPartners([$partnerId]);
                $email    = $partners[$partnerId]['email'] ?? null;
            } catch (\Exception $e) {
                Log::warning('CabinetController::createPayment — partner fetch failed', ['odoo_id' => $odooId]);
            }
        }

        $description  = $odooOrder['x_studio_route_new'] ?? $odooOrder['x_studio_boat_name'] ?? 'Bluuu Tour';
        $baseUrl      = url("/cabinet/{$odooId}/{$key}");
        $collectExtId = 'odoo_' . $odooId;

        $payUrl = XenditService::createPaymentLink(
            $collectExtId, $collectAmount, $email ?? '', $baseUrl . '?paid=1', $baseUrl, $description
        );

        return response()->json(['payment_url' => $payUrl]);
    }

    // ─── GET /api/new/cabinet/{odooId}/{key}/upgrade ──────────────────────────
    // Live availability check for the next upgrade tier.
    public function checkUpgrade(Request $request, int $odooId, string $key)
    {
        $this->cors();

        $odooOrder = $this->fetchOdooOrder($odooId, $key);
        if (!$odooOrder) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $members    = (int) ($odooOrder['x_studio_count_of_people'] ?? 0);
        $travelDate = null;
        if (!empty($odooOrder['rental_start_date'])) {
            $travelDate = Carbon::parse($odooOrder['rental_start_date'], 'UTC')
                ->setTimezone('Asia/Makassar')->format('Y-m-d');
        }

        // Detect current tour
        $productIds = array_filter(array_map(
            fn($l) => is_array($l['product_id'] ?? null) ? $l['product_id'][0] : ($l['product_id'] ?? null),
            $odooOrder['lines'] ?? []
        ));
        $currentTour = !empty($productIds)
            ? Tours::whereIn('odoo_id', array_values($productIds))->first()
            : null;

        $tierMap     = ['Standard Shared' => 'Premium Shared', 'Premium Shared' => 'First Class Shared'];
        $upgradeType = $tierMap[$currentTour->odoo_type ?? ''] ?? null;

        if (!$upgradeType) {
            return response()->json(['available' => false]);
        }

        $upgradeTour = Tours::with(['boat', 'boat.closeddates', 'packages', 'pricesbydates.packages'])
            ->where('classes_id', 9)
            ->where('odoo_type', $upgradeType)
            ->first();

        if (!$upgradeTour) {
            return response()->json(['available' => false]);
        }

        // Check availability per boat + pick assigned boat
        $boatIndex      = SharedAvailability::buildBoatIndex($upgradeTour, $travelDate ? [$travelDate] : []);
        $avail          = $travelDate ? SharedAvailability::calcDate($upgradeTour, $boatIndex, $travelDate, $members) : ['available' => false, 'available_seats' => 0, 'assigned_boat' => null];
        $available      = $avail['available'];
        $availableSeats = $avail['available_seats'];
        $assignedBoat   = $avail['assigned_boat'];

        // Upgrade price
        $pricelist = $upgradeTour->packages?->pricelist ?? [];
        if ($travelDate && $upgradeTour->pricesbydates->isNotEmpty()) {
            $s = $upgradeTour->pricesbydates->first(fn($p) => $travelDate >= $p->date_start && $travelDate <= $p->date_end);
            if ($s?->packages?->pricelist) $pricelist = $s->packages->pricelist;
        }
        $upgradePrice = 0;
        if (!empty($pricelist)) {
            $sorted       = collect($pricelist)->sortBy(fn($p) => (int) $p['members_count']);
            $entry        = $sorted->last(fn($p) => (int) $p['members_count'] <= $members) ?? $sorted->first();
            $upgradePrice = (int) ($entry['price'] ?? 0);
        }

        // Current price (for diff)
        $currentTour?->loadMissing(['packages', 'pricesbydates.packages']);
        $curPricelist = $currentTour?->packages?->pricelist ?? [];
        if ($travelDate && $currentTour?->pricesbydates?->isNotEmpty()) {
            $s = $currentTour->pricesbydates->first(fn($p) => $travelDate >= $p->date_start && $travelDate <= $p->date_end);
            if ($s?->packages?->pricelist) $curPricelist = $s->packages->pricelist;
        }
        $currentPrice = 0;
        if (!empty($curPricelist)) {
            $sorted       = collect($curPricelist)->sortBy(fn($p) => (int) $p['members_count']);
            $entry        = $sorted->last(fn($p) => (int) $p['members_count'] <= $members) ?? $sorted->first();
            $currentPrice = (int) ($entry['price'] ?? 0);
        }

        return response()->json([
            'available'       => $available,
            'available_seats' => $availableSeats,
            'upgrade_tour_id' => (int) $upgradeTour->id,
            'upgrade_type'    => $upgradeType,
            'price'           => $upgradePrice,
            'price_diff'      => $upgradePrice - $currentPrice,
            'boat_name'       => $assignedBoat?->name,
        ]);
    }

    // ─── Helper: active pricelist for the current tour + date ────────────────────
    private function buildPricelist(?object $tour, ?string $travelDate): array
    {
        if (!$tour) return [];
        $pricelist = $tour->packages?->pricelist ?? [];
        if ($travelDate && $tour->pricesbydates->isNotEmpty()) {
            $seasonal = $tour->pricesbydates->first(
                fn($p) => $travelDate >= $p->date_start && $travelDate <= $p->date_end
            );
            if ($seasonal?->packages?->pricelist) {
                $pricelist = $seasonal->packages->pricelist;
            }
        }
        return array_values(array_map(fn($e) => [
            'members_count' => (int) ($e['members_count'] ?? 0),
            'price'         => (int) ($e['price'] ?? 0),
        ], $pricelist));
    }

    // ─── Helper: build upgrade_tour option for shared tiers ──────────────────────
    private function buildUpgradeTour(?object $currentTour, bool $isPrivate, ?string $travelDate, int $members): ?array
    {
        if ($isPrivate || !$currentTour) return null;

        $tierMap = [
            'Standard Shared'   => 'Premium Shared',
            'Premium Shared'    => 'First Class Shared',
        ];
        $currentType = $currentTour->odoo_type ?? null;
        $upgradeType = $tierMap[$currentType] ?? null;
        if (!$upgradeType) return null;

        $upgradeTour = Tours::with(['boat.closeddates', 'packages', 'pricesbydates.packages'])
            ->where('classes_id', 9)
            ->where('odoo_type', $upgradeType)
            ->first();
        if (!$upgradeTour) return null;

        // Calculate upgrade tour price for same members count
        $pricelist = $upgradeTour->packages?->pricelist ?? [];
        if ($travelDate && $upgradeTour->pricesbydates->isNotEmpty()) {
            $seasonal = $upgradeTour->pricesbydates->first(
                fn($p) => $travelDate >= $p->date_start && $travelDate <= $p->date_end
            );
            if ($seasonal?->packages?->pricelist) {
                $pricelist = $seasonal->packages->pricelist;
            }
        }
        $upgradePrice = 0;
        if (!empty($pricelist)) {
            $sorted = collect($pricelist)->sortBy(fn($p) => (int) $p['members_count']);
            $entry  = $sorted->last(fn($p) => (int) $p['members_count'] <= $members) ?? $sorted->first();
            $upgradePrice = (int) ($entry['price'] ?? 0);
        }

        // Calculate current tour price for same members (for diff)
        $currentTour->loadMissing(['packages', 'pricesbydates.packages']);
        $currentPricelist = $currentTour->packages?->pricelist ?? [];
        if ($travelDate && $currentTour->pricesbydates->isNotEmpty()) {
            $seasonal = $currentTour->pricesbydates->first(
                fn($p) => $travelDate >= $p->date_start && $travelDate <= $p->date_end
            );
            if ($seasonal?->packages?->pricelist) {
                $currentPricelist = $seasonal->packages->pricelist;
            }
        }
        $currentPrice = 0;
        if (!empty($currentPricelist)) {
            $sorted = collect($currentPricelist)->sortBy(fn($p) => (int) $p['members_count']);
            $entry  = $sorted->last(fn($p) => (int) $p['members_count'] <= $members) ?? $sorted->first();
            $currentPrice = (int) ($entry['price'] ?? 0);
        }

        // Check availability on travel_date (mirrors FullController logic)
        $upgradeBoatIndex = SharedAvailability::buildBoatIndex($upgradeTour, $travelDate ? [$travelDate] : []);
        $avail            = $travelDate ? SharedAvailability::calcDate($upgradeTour, $upgradeBoatIndex, $travelDate, $members) : ['available' => false, 'available_seats' => 0, 'assigned_boat' => null];
        $availableSeats = $avail['available_seats'];

        return [
            'id'              => (int) $upgradeTour->id,
            'name'            => $upgradeTour->name,
            'odoo_type'       => $upgradeType,
            'price'           => $upgradePrice,
            'price_diff'      => $upgradePrice - $currentPrice,
            'available_seats' => $availableSeats,
            'available'       => $avail['available'],
        ];
    }

    // ─── PATCH /api/new/cabinet/{odooId}/{key}/upgrade ────────────────────────
    public function upgrade(Request $request, int $odooId, string $key)
    {
        $this->cors();

        $odooOrder = $this->fetchOdooOrder($odooId, $key);
        if (!$odooOrder) {
            return response()->json(['success' => false, 'error' => 'Order not found'], 404);
        }

        $upgradeToursId = (int) $request->input('tours_id');
        if (!$upgradeToursId) {
            return response()->json(['success' => false, 'error' => 'tours_id required'], 422);
        }

        $upgradeTour = Tours::with(['packages', 'pricesbydates.packages', 'boat.closeddates', 'route.restaurant'])->find($upgradeToursId);
        if (!$upgradeTour) {
            return response()->json(['success' => false, 'error' => 'Upgrade tour not found'], 404);
        }

        $members    = (int) ($odooOrder['x_studio_adults'] ?? 0) + (int) ($odooOrder['x_studio_kids'] ?? 0);
        $travelDate = !empty($odooOrder['rental_start_date'])
            ? Carbon::parse($odooOrder['rental_start_date'], 'UTC')->setTimezone('Asia/Makassar')->format('Y-m-d')
            : null;

        // Re-check availability at upgrade time (same logic as FullController)
        if ($travelDate) {
            $upgradeIndex = SharedAvailability::buildBoatIndex($upgradeTour, [$travelDate]);
            $avail        = SharedAvailability::calcDate($upgradeTour, $upgradeIndex, $travelDate, $members);
            if (!$avail['available']) {
                return response()->json(['success' => false, 'error' => 'Not enough seats available for upgrade'], 409);
            }
        }

        // Recalculate price for upgrade tour
        $pricelist = $upgradeTour->packages?->pricelist ?? [];
        if ($travelDate && $upgradeTour->pricesbydates->isNotEmpty()) {
            $seasonal = $upgradeTour->pricesbydates->first(
                fn($p) => $travelDate >= $p->date_start && $travelDate <= $p->date_end
            );
            if ($seasonal?->packages?->pricelist) $pricelist = $seasonal->packages->pricelist;
        }
        $newTourPrice = 0;
        if (!empty($pricelist)) {
            $sorted       = collect($pricelist)->sortBy(fn($p) => (int) $p['members_count']);
            $entry        = $sorted->last(fn($p) => (int) $p['members_count'] <= $members) ?? $sorted->first();
            $newTourPrice = (int) ($entry['price'] ?? 0);
        }

        $newRoute      = $upgradeTour->route;
        $newRestaurant = $newRoute?->restaurant;

        // Update existing Odoo order (no recreate)
        $wasSale = ($odooOrder['state'] ?? '') === 'sale';
        try {
            if ($wasSale) {
                OdooService::cancelOrder($odooId);
                OdooService::draftOrder($odooId);
            }

            // Find and remove old tour line, then create new one with upgrade product
            $allTourOdooIds = Tours::whereNotNull('odoo_id')->pluck('odoo_id')->map(fn($v) => (int) $v)->toArray();
            $tourLineId     = null;
            foreach ($odooOrder['lines'] ?? [] as $line) {
                $pid = $line['product_id'] ?? null;
                if (is_array($pid)) $pid = (int) $pid[0];
                if ($pid && in_array($pid, $allTourOdooIds)) {
                    $tourLineId = $line['id'];
                    break;
                }
            }

            if ($tourLineId) {
                OdooService::unlinkOrderLines([$tourLineId]);
            }

            if ($upgradeTour->odoo_id) {
                OdooService::addOrderLine(
                    $odooId,
                    (int) $upgradeTour->odoo_id,
                    1.0,
                    (float) $newTourPrice,
                    $upgradeTour->name
                );
            }

            // Update header: tour type, route, restaurant
            try {
                $headerFields = ['x_studio_tour_type' => $upgradeTour->odoo_type ?? ''];
                if ($newRoute)      $headerFields['x_studio_route_new'] = $newRoute->odoo_name      ?? $newRoute->title ?? '';
                if ($newRestaurant) $headerFields['x_studio_lunch']     = $newRestaurant->odoo_name ?? $newRestaurant->name ?? '';
                OdooService::updateOrderHeaderFields($odooId, $headerFields);
            } catch (\Exception $e) {
                Log::warning('CabinetController::upgrade header fields — ' . $e->getMessage());
            }

            if ($wasSale) {
                OdooService::confirmOrder($odooId);
            }
        } catch (\Exception $e) {
            Log::error('CabinetController::upgrade — ' . $e->getMessage());
            if ($wasSale) {
                try { OdooService::confirmOrder($odooId); } catch (\Exception $ignored) {}
            }
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }

        return response()->json(['success' => true]);
    }
}
