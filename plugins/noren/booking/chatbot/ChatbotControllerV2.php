<?php

namespace Noren\Booking\Chatbot;

use Illuminate\Http\Request;
use Carbon\Carbon;
use Noren\Booking\Models\Tours;
use Noren\Booking\Models\Route;
use Noren\Booking\Models\Extras;
use Noren\Booking\Models\Rates;
use Noren\Booking\Models\Transfer;
use Noren\Booking\Models\Cover;
use Noren\Booking\Models\Closeddates;
use System\Models\File as SystemFile;

class ChatbotControllerV2 extends ChatbotController
{
    // ─── GET /api/v2/chatbot/boats/private ───────────────────────────────────

    public function getPrivateBoats(Request $request)
    {
        $this->corsHeaders();
        if (!$this->authenticate($request)) return $this->unauthorized();

        $tours = Tours::with(['packages', 'pricesbydates.packages', 'category', 'images', 'boat.company'])
            ->whereIn('classes_id', [8])
            ->where('status', '!=', 'disabled')
            ->orderBy('sort_order')
            ->get();

        $today = Carbon::today();

        $boats = $tours->map(function ($tour) use ($today) {
            $bf        = $tour->props ?? [];
            $boatPrice = (int) $tour->boat_price;

            $seasonalPrices = $tour->pricesbydates
                ->filter(fn($pbd) => $pbd->date_end && Carbon::parse($pbd->date_end)->gte($today))
                ->map(fn($pbd) => [
                    'date_start' => $pbd->date_start,
                    'date_end'   => $pbd->date_end,
                    'low_price'  => (bool) $pbd->low_price,
                    'flash_sale' => (bool) $pbd->flash_sale,
                    'packages'   => $pbd->packages ? [
                        'name'      => $pbd->packages->name,
                        'pricelist' => $pbd->packages->pricelist ?? [],
                    ] : null,
                ])->values();

            return [
                'id'          => $tour->id,
                'odoo_id'     => $tour->odoo_id ? (int) $tour->odoo_id : null,
                'name'        => $tour->name,
                'slug'        => $tour->slug,
                'description' => $tour->description,
                'size'        => $tour->size,
                'capacity'    => $tour->capacity,
                'currency'    => 'IDR',
                'status'      => $tour->status ?: 'ready',
                'categories'  => $tour->category->map(fn($c) => $c->name)->values(),
                'features'    => $this->formatBoatFeatures($bf),
                'best_for'    => $bf['best_for']  ?? null,
                'boat_type'   => $bf['boat_type'] ?? null,
                'pricing'     => [
                    'type'            => 'per_boat',
                    'boat_price'      => $boatPrice,
                    'packages'        => $tour->packages ? [[
                        'name'      => $tour->packages->name,
                        'pricelist' => $tour->packages->pricelist ?? [],
                    ]] : [],
                    'seasonal_prices' => $seasonalPrices,
                ],
                'boats'       => $tour->boat->map(fn($b) => [
                    'id'         => $b->id,
                    'odoo_id'    => $b->odoo_id ? (int) $b->odoo_id : null,
                    'name'       => $b->name,
                    'company'    => $b->company ? [
                        'id'      => $b->company->id,
                        'odoo_id' => $b->company->odoo_id ? (int) $b->company->odoo_id : null,
                        'name'    => $b->company->name,
                    ] : null,
                ])->values(),
                'images'      => collect($tour->images_with_thumbs ?? [])
                    ->take(3)
                    ->map(fn($img) => $img['thumb1'] ?? $img['original'] ?? $img['path'] ?? $img['thumb'] ?? null)
                    ->filter()->values(),
            ];
        });

        $routes = Route::with(['ecategories', 'restaurant'])
            ->where('classes_id', 8)
            ->orderBy('sort_order')
            ->get();

        $routeIds = $routes->pluck('id')->toArray();
        $maps = SystemFile::where('attachment_type', 'Noren\Booking\Models\Route')
            ->whereIn('attachment_id', $routeIds)
            ->where('field', 'map')
            ->get()
            ->keyBy('attachment_id');

        $formattedRoutes = $routes->map(function ($route) use ($maps) {
            return [
                'id'          => $route->id,
                'odoo_id'     => $route->odoo_id ? (int) $route->odoo_id : null,
                'title'       => $route->title,
                'slug'        => $route->slug,
                'description' => $route->description,
                'map'         => optional($maps->get($route->id))->getPath(),
                'restaurant'  => $route->restaurant ? [
                    'id'      => $route->restaurant->id,
                    'odoo_id' => $route->restaurant->odoo_id ? (int) $route->restaurant->odoo_id : null,
                    'name'    => $route->restaurant->name,
                    'menu'    => $route->restaurant->menu,
                ] : null,
            ];
        });

        $extras = Extras::with(['ecategories', 'images', 'children'])
            ->whereNull('parent_id')
            ->get()
            ->map(fn($e) => [
                'id'          => $e->id,
                'odoo_id'     => $e->odoo_id ? (int) $e->odoo_id : null,
                'name'        => $e->name,
                'description' => $e->description,
                'price'       => $e->price,
                'currency'    => 'IDR',
                'category'    => optional($e->ecategories->first())->name,
                'has_options' => $e->children->isNotEmpty(),
                'options'     => $e->children->map(fn($c) => [
                    'id'      => $c->id,
                    'odoo_id' => $c->odoo_id ? (int) $c->odoo_id : null,
                    'name'    => $c->name,
                    'price'   => $c->price,
                ])->values(),
            ]);

        $transfers = Transfer::orderBy('id')->get()
            ->filter(fn($t) => !$t->classes_id || (int) $t->classes_id === 8)
            ->map(fn($t) => [
                'id'          => $t->id,
                'odoo_id'     => $t->odoo_id ? (int) $t->odoo_id : null,
                'name'        => $t->name,
                'price'       => (int) $t->price,
                'bus_price'   => $t->bus_price ? (int) $t->bus_price : null,
                'currency'    => 'IDR',
                'description' => $t->short_description ?: $t->description,
            ])->values();

        $covers = Cover::orderBy('id')->get()
            ->filter(fn($c) => (bool) $c->per_boat && (!$c->classes_id || (int) $c->classes_id === 8))
            ->map(fn($c) => [
                'id'          => $c->id,
                'odoo_id'     => $c->odoo_id ? (int) $c->odoo_id : null,
                'name'        => $c->name,
                'price'       => (int) $c->price,
                'currency'    => 'IDR',
                'description' => $c->short_description ?: $c->description,
            ])->values();

        return response()->json([
            'boats'      => $boats,
            'routes'     => $formattedRoutes,
            'extras'     => $extras,
            'transfers'  => $transfers,
            'covers'     => $covers,
            'updated_at' => Carbon::now()->toISOString(),
        ]);
    }

    // ─── GET /api/v2/chatbot/boats/shared ────────────────────────────────────

    public function getSharedBoats(Request $request)
    {
        $this->corsHeaders();
        if (!$this->authenticate($request)) return $this->unauthorized();

        $tours = Tours::with(['packages', 'pricesbydates.packages', 'category', 'images', 'route', 'route.restaurant', 'boat.company'])
            ->whereIn('classes_id', [9])
            ->where('status', '!=', 'disabled')
            ->orderBy('sort_order')
            ->get();

        $today = Carbon::today();

        $boats = $tours->map(function ($tour) use ($today) {
            $bf    = $tour->props ?? [];
            $route = $tour->route;

            $seasonalPrices = $tour->pricesbydates
                ->filter(fn($pbd) => $pbd->date_end && Carbon::parse($pbd->date_end)->gte($today))
                ->map(fn($pbd) => [
                    'date_start' => $pbd->date_start,
                    'date_end'   => $pbd->date_end,
                    'low_price'  => (bool) $pbd->low_price,
                    'flash_sale' => (bool) $pbd->flash_sale,
                    'packages'   => $pbd->packages ? [
                        'name'      => $pbd->packages->name,
                        'pricelist' => $pbd->packages->pricelist ?? [],
                    ] : null,
                ])->values();

            return [
                'id'          => $tour->id,
                'odoo_id'     => $tour->odoo_id ? (int) $tour->odoo_id : null,
                'name'        => $tour->name,
                'slug'        => $tour->slug,
                'description' => $tour->description,
                'size'        => $tour->size,
                'capacity'    => $tour->capacity,
                'currency'    => 'IDR',
                'status'      => $tour->status ?: 'ready',
                'categories'  => $tour->category->map(fn($c) => $c->name)->values(),
                'features'    => $this->formatBoatFeatures($bf),
                'pricing'     => [
                    'type'            => 'per_guest',
                    'packages'        => $tour->packages ? [[
                        'name'      => $tour->packages->name,
                        'pricelist' => $tour->packages->pricelist ?? [],
                    ]] : [],
                    'seasonal_prices' => $seasonalPrices,
                ],
                'route'       => $route ? [
                    'id'      => $route->id,
                    'odoo_id' => $route->odoo_id ? (int) $route->odoo_id : null,
                    'title'   => $route->title,
                    'slug'    => $route->slug,
                ] : null,
                'restaurant'  => $route?->restaurant ? [
                    'id'      => $route->restaurant->id,
                    'odoo_id' => $route->restaurant->odoo_id ? (int) $route->restaurant->odoo_id : null,
                    'name'    => $route->restaurant->name,
                    'menu'    => $route->restaurant->menu,
                ] : null,
                'boats'       => $tour->boat->map(fn($b) => [
                    'id'         => $b->id,
                    'odoo_id'    => $b->odoo_id ? (int) $b->odoo_id : null,
                    'name'       => $b->name,
                    'company'    => $b->company ? [
                        'id'      => $b->company->id,
                        'odoo_id' => $b->company->odoo_id ? (int) $b->company->odoo_id : null,
                        'name'    => $b->company->name,
                    ] : null,
                ])->values(),
                'images'      => collect($tour->images_with_thumbs ?? [])
                    ->take(3)
                    ->map(fn($img) => $img['thumb1'] ?? $img['original'] ?? $img['path'] ?? $img['thumb'] ?? null)
                    ->filter()->values(),
            ];
        });

        $transfers = Transfer::orderBy('id')->get()
            ->filter(fn($t) => !$t->classes_id || (int) $t->classes_id === 9)
            ->map(fn($t) => [
                'id'          => $t->id,
                'odoo_id'     => $t->odoo_id ? (int) $t->odoo_id : null,
                'name'        => $t->name,
                'price'       => (int) $t->price,
                'bus_price'   => $t->bus_price ? (int) $t->bus_price : null,
                'currency'    => 'IDR',
                'description' => $t->short_description ?: $t->description,
            ])->values();

        $covers = Cover::orderBy('id')->get()
            ->filter(fn($c) => !(bool) $c->per_boat && (!$c->classes_id || (int) $c->classes_id === 9))
            ->map(fn($c) => [
                'id'          => $c->id,
                'odoo_id'     => $c->odoo_id ? (int) $c->odoo_id : null,
                'name'        => $c->name,
                'price'       => (int) $c->price,
                'currency'    => 'IDR',
                'description' => $c->short_description ?: $c->description,
            ])->values();

        return response()->json([
            'boats'      => $boats,
            'transfers'  => $transfers,
            'covers'     => $covers,
            'updated_at' => Carbon::now()->toISOString(),
        ]);
    }

    // ─── POST /api/v2/chatbot/quote ──────────────────────────────────────────

    public function getQuote(Request $request)
    {
        $this->corsHeaders();
        if (!$this->authenticate($request)) return $this->unauthorized();

        $tourId         = $request->input('tour_id');
        $date           = $request->input('date');
        $adults         = (int) $request->input('adults', 0);
        $kids           = (int) $request->input('kids', 0);
        $guests         = ($adults + $kids) ?: (int) $request->input('guests', 1);
        $routeId        = $request->input('route_id');
        $transferId     = $request->input('transfer');
        $coverId        = $request->input('insurance');
        $extrasInput    = $request->input('extras', []);
        $boatId         = $request->input('boat_id');
        $pickupAddress  = $request->input('pickup_address', '');
        $dropoffAddress = $request->input('dropoff_address', '');
        $cars           = (int) $request->input('cars', 0);
        $customerName   = $request->input('name', '');
        $customerEmail  = $request->input('email', '');
        $customerPhone  = $request->input('whatsapp', '');
        $externalId     = $request->input('external_id', '');

        // ── Load tour ────────────────────────────────────────────────────
        $tour = Tours::with(['packages', 'pricesbydates.packages'])->find($tourId);
        if (!$tour) {
            return response()->json(['success' => false, 'error' => 'Tour not found'], 404);
        }

        $isShared = in_array((int) $tour->classes_id, [9, 10]);

        // ── Boat price ───────────────────────────────────────────────────
        $pricelist      = $tour->packages?->pricelist ?? [];
        $boatPriceToAdd = (int) $tour->boat_price;

        if ($date && $tour->pricesbydates->isNotEmpty()) {
            $seasonal = $tour->pricesbydates->first(function ($pbd) use ($date) {
                return $date >= $pbd->date_start && $date <= $pbd->date_end;
            });
            if ($seasonal && $seasonal->packages?->pricelist) {
                $pricelist = $seasonal->packages->pricelist;
            }
        }

        $boatBasePrice = 0;
        if (!empty($pricelist)) {
            $sorted = collect($pricelist)->sortBy(fn($p) => (int) $p['members_count']);
            $entry  = $sorted->last(fn($p) => (int) $p['members_count'] <= $guests)
                   ?? $sorted->first();
            $tierPrice     = (int) ($entry['price'] ?? 0);
            $boatBasePrice = $isShared ? $tierPrice : $tierPrice + $boatPriceToAdd;
        }

        // ── Available boats + selection ──────────────────────────────────
        $availableBoats = $this->getAvailableBoats($tour, $date, $guests, $isShared);
        $boat = null;
        if ($boatId) {
            $boat = \Noren\Booking\Models\Boat::with('company')->find($boatId);
        } elseif ($availableBoats->isNotEmpty()) {
            $selectedId = $availableBoats->first()['id'];
            $boat = \Noren\Booking\Models\Boat::with('company')->find($selectedId);
        }

        // ── Route ────────────────────────────────────────────────────────
        $route = null;
        if ($routeId) {
            $route = Route::find($routeId);
        }

        // ── Transfer ─────────────────────────────────────────────────────
        $transfer      = null;
        $transferPrice = 0;
        if ($transferId) {
            $transfer = Transfer::find($transferId);
            if ($transfer) {
                $transferPrice = ($guests > 5 && $transfer->bus_price)
                    ? (int) $transfer->bus_price
                    : (int) $transfer->price;
                if ($cars === 0) $cars = 1;
            }
        }

        // ── Cover / insurance ────────────────────────────────────────────
        $cover      = null;
        $coverPrice = 0;
        if ($coverId) {
            $cover = Cover::find($coverId);
            if ($cover) {
                $coverPrice = (int) ($cover->price ?? 0);
            }
        }

        // ── Extras ───────────────────────────────────────────────────────
        $extrasTotal     = 0;
        $extrasBreakdown = [];
        $extrasMap       = collect();
        if (!empty($extrasInput)) {
            $extraIds  = collect($extrasInput)->pluck('extra_id')->toArray();
            $extrasMap = Extras::whereIn('id', $extraIds)->get()->keyBy('id');

            foreach ($extrasInput as $item) {
                $extra = $extrasMap->get($item['extra_id']);
                if (!$extra) continue;
                $qty       = max(1, (int) ($item['quantity'] ?? 1));
                $unitPrice = (int) ($extra->price ?? 0);
                $subtotal  = $unitPrice * $qty;
                $extrasTotal += $subtotal;
                $extrasBreakdown[] = [
                    'extra_id'       => $extra->id,
                    'odoo_id'        => $extra->odoo_id ? (int) $extra->odoo_id : null,
                    'name'           => $extra->name,
                    'qty'            => $qty,
                    'unit_price_idr' => $unitPrice,
                    'subtotal_idr'   => $subtotal,
                ];
            }
        }

        // ── USD rate ─────────────────────────────────────────────────────
        $rate    = Rates::where('code', 'USD')->orderBy('id', 'desc')->first();
        $usdRate = $rate ? (float) $rate->rate : null;

        $finalTotalIDR = $boatBasePrice + $transferPrice + $coverPrice + $extrasTotal;
        $finalTotalUSD = $usdRate ? round($finalTotalIDR * $usdRate) : null;
        $perPaxIDR     = $guests > 0 ? round($finalTotalIDR / $guests) : $finalTotalIDR;
        $perPaxUSD     = $usdRate ? round($perPaxIDR * $usdRate) : null;

        // ── Booking URL ──────────────────────────────────────────────────
        $baseUrl   = rtrim(env('APP_URL', 'https://bluuu.tours'), '/');
        $page      = $isShared ? 'shared' : 'private';
        $urlParams = array_filter([
            'date'     => $date,
            'adults'   => $guests,
            'tour'     => $tour->id,
            'route'    => (!$isShared && $routeId) ? $routeId : null,
            'transfer' => $transferId ?: null,
            'cover'    => $coverId ?: null,
        ], fn($v) => $v !== null && $v !== '');
        $bookingUrl = $baseUrl . '/new/' . $page . '?' . http_build_query($urlParams);

        return response()->json([
            'success'      => true,
            'booking_url'  => $bookingUrl,
            'odoo_data'    => $this->buildOdooData(
                $tour, $boat, $route, $transfer, $cover,
                $extrasMap, $extrasInput,
                $adults, $kids, $guests, $date,
                $pickupAddress, $dropoffAddress, $cars,
                $customerName, $customerEmail, $customerPhone, $externalId,
                $boatBasePrice, $transferPrice, $coverPrice, $finalTotalIDR
            ),
            'currency_idr' => [
                'total_price'   => $finalTotalIDR,
                'price_per_pax' => $perPaxIDR,
                'breakdown'     => [
                    'boat_base_price' => $boatBasePrice,
                    'transfer'        => $transferPrice,
                    'insurance'       => $coverPrice,
                    'extras_total'    => $extrasTotal,
                    'extras'          => $extrasBreakdown,
                    'final_total'     => $finalTotalIDR,
                ],
            ],
            'currency_usd' => $usdRate ? [
                'rate'          => $usdRate,
                'total_price'   => $finalTotalUSD,
                'price_per_pax' => $perPaxUSD,
                'breakdown'     => [
                    'boat_base_price' => round($boatBasePrice * $usdRate),
                    'transfer'        => round($transferPrice  * $usdRate),
                    'insurance'       => round($coverPrice     * $usdRate),
                    'extras_total'    => round($extrasTotal    * $usdRate),
                    'final_total'     => $finalTotalUSD,
                ],
            ] : null,
            'meta' => [
                'tour_id'   => $tour->id,
                'tour_name' => $tour->name,
                'tour_type' => $isShared ? 'shared' : 'private',
                'date'      => $date,
                'adults'    => $adults,
                'kids'      => $kids,
                'guests'    => $guests,
            ],
        ]);
    }

    // ─── Available boats (same logic as PrivateOrderController / SharedOrderController) ──

    private function getAvailableBoats($tour, ?string $date, int $guests, bool $isShared): \Illuminate\Support\Collection
    {
        $tour->loadMissing(['boat' => fn($q) => $q->with('company')->orderBy('sort_order')->orderBy('id')]);

        if ($tour->boat->isEmpty()) return collect();

        if (!$date) {
            return $tour->boat->map(fn($b) => [
                'id'              => $b->id,
                'odoo_id'         => $b->odoo_id ? (int) $b->odoo_id : null,
                'name'            => $b->name,
                'available_seats' => null,
                'company_id'      => $b->company?->id,
                'company_odoo_id' => $b->company?->odoo_id ? (int) $b->company->odoo_id : null,
                'company_name'    => $b->company?->name,
            ])->values();
        }

        $boatIds    = $tour->boat->pluck('id');
        $closedRows = Closeddates::whereIn('boat_id', $boatIds)
            ->where('date', $date)
            ->whereNull('deleted_at')
            ->get()
            ->groupBy('boat_id');

        $result = [];

        foreach ($tour->boat as $boat) {
            if (!empty($boat->closed)) continue;

            $records = $closedRows->get($boat->id, collect());

            if ($isShared) {
                // Shared: check blocked + count available seats
                $blocked = $records->contains(function ($r) {
                    $t = $r->type;
                    return $t === null || $t === '' || in_array((int) $t, [2, 3, 4]);
                });
                if ($blocked) continue;

                $booked          = (int) $records->where('type', 1)->sum('qtty');
                $availableSeats  = max(0, (int) $boat->capacity - $booked);
                if ($availableSeats < $guests) continue;

                $result[] = [
                    'id'              => $boat->id,
                    'odoo_id'         => $boat->odoo_id ? (int) $boat->odoo_id : null,
                    'name'            => $boat->name,
                    'available_seats' => $availableSeats,
                    'company_id'      => $boat->company?->id,
                    'company_odoo_id' => $boat->company?->odoo_id ? (int) $boat->company->odoo_id : null,
                    'company_name'    => $boat->company?->name,
                ];
            } else {
                // Private: no closeddates record = available
                if ($records->isNotEmpty()) continue;

                $result[] = [
                    'id'              => $boat->id,
                    'odoo_id'         => $boat->odoo_id ? (int) $boat->odoo_id : null,
                    'name'            => $boat->name,
                    'available_seats' => null,
                    'company_id'      => $boat->company?->id,
                    'company_odoo_id' => $boat->company?->odoo_id ? (int) $boat->company->odoo_id : null,
                    'company_name'    => $boat->company?->name,
                ];
            }
        }

        // For shared: sort so exact seat match comes first
        if ($isShared) {
            usort($result, fn($a, $b) =>
                ($b['available_seats'] === $guests ? 1 : 0) - ($a['available_seats'] === $guests ? 1 : 0)
            );
        }

        return collect($result);
    }

    // ─── Build odoo_data block (mirrors OdooService buildOrderData format) ───

    private function buildOdooData(
        $tour, $boat, $route, $transfer, $cover,
        $extrasMap, $extrasInput,
        int $adults, int $kids, int $guests, ?string $date,
        string $pickupAddress, string $dropoffAddress, int $cars,
        string $customerName, string $customerEmail, string $customerPhone, string $externalId,
        float $boatBasePrice, float $transferPrice, float $coverPrice, float $totalPrice
    ): array {
        $company      = $boat?->company;
        $isShared     = in_array((int) $tour->classes_id, [9, 10]);
        $routeName    = $route?->name ?? $route?->title ?? '';
        $routeStart   = $route?->start ?? '08:00:00';
        $routeEnd     = $route?->end   ?? '18:00:00';
        $transferType = $transfer?->type ?? '';

        $rentalStart = $date
            ? Carbon::parse($date . ' ' . $routeStart, 'Asia/Makassar')->utc()->format('Y-m-d H:i:s')
            : null;
        $rentalEnd = $date
            ? Carbon::parse($date . ' ' . $routeEnd, 'Asia/Makassar')->utc()->format('Y-m-d H:i:s')
            : null;

        // ── Order — exact fields sent to Odoo createSaleOrder ────────────
        $order = [
            'is_rental_order'           => true,
            'rental_start_date'         => $rentalStart,
            'rental_return_date'        => $rentalEnd,
            'company_id'                => $company?->odoo_id ? (int) $company->odoo_id : null,
            'x_studio_boat_name'        => $boat?->name ?? '',
            'x_studio_adults'           => $adults,
            'x_studio_kids'             => $kids,
            'x_studio_count_of_people'  => $guests,
            'x_studio_route'            => $routeName,
            'x_studio_pickup_address'   => $pickupAddress,
            'x_studio_drop_off_address' => $dropoffAddress,
            'x_studio_pickup_cars'      => in_array($transfer?->id, [1, 2]) ? 1 : 0,
            'x_studio_drop_off_cars'    => $transfer?->id === 2 ? 1 : 0,
            'x_studio_car_type'         => $this->resolveCarTypeFromTransfer($transfer, $guests),
            'x_studio_tour_type'        => $tour->odoo_type ?? '',
            'x_studio_deposit'          => 0.0,
            'x_studio_collect'          => (float) $totalPrice,
            'client_order_ref'          => $externalId,
            // Customer (used for partner lookup/create)
            'partner_name'              => $customerName,
            'partner_email'             => $customerEmail,
            'partner_phone'             => $customerPhone,
        ];

        // ── Lines ─────────────────────────────────────────────────────────
        $lines = [];

        // 1. Boat — qty 1, price 0
        if ($boat?->odoo_id) {
            $lines[] = [
                'label'      => 'boat',
                'product_id' => (int) $boat->odoo_id,
                'qty'        => 1,
                'price'      => 0.0,
            ];
        }

        // 2. Tour
        if ($tour->odoo_id) {
            if ($isShared) {
                $qty   = $guests;
                $price = $guests > 0 ? round($boatBasePrice / $guests, 2) : 0.0;
            } else {
                $qty   = 1;
                $price = (float) $boatBasePrice;
            }
            $lines[] = [
                'label'      => 'tour',
                'product_id' => (int) $tour->odoo_id,
                'qty'        => $qty,
                'price'      => $price,
            ];
        }

        // 3. Transfer
        if ($transfer?->odoo_id) {
            $lines[] = [
                'label'      => 'transfer',
                'product_id' => (int) $transfer->odoo_id,
                'qty'        => 1,
                'price'      => (float) $transferPrice,
            ];
        }

        // 4. Cover
        if ($cover?->odoo_id) {
            $lines[] = [
                'label'      => 'cover',
                'product_id' => (int) $cover->odoo_id,
                'qty'        => $cover->per_boat ? 1 : $guests,
                'price'      => (float) $coverPrice,
            ];
        }

        // 5. Extras
        foreach ($extrasInput as $item) {
            $extra = $extrasMap->get($item['extra_id'] ?? null);
            if (!$extra?->odoo_id) continue;
            $lines[] = [
                'label'      => 'extra:' . $extra->name,
                'product_id' => (int) $extra->odoo_id,
                'qty'        => max(1, (int) ($item['quantity'] ?? 1)),
                'price'      => (float) ($extra->price ?? 0),
            ];
        }

        return [
            'order' => $order,
            'lines' => $lines,
        ];
    }

    private function resolveCarTypeFromTransfer($transfer, int $guests): mixed
    {
        if (!$transfer) return false;
        if ((int) $transfer->id === 3) return 'Free Shuttle Bus';
        if (in_array((int) $transfer->id, [1, 2])) {
            return $guests > 5 ? 'Private Hi-Ace' : 'Private Car';
        }
        return false;
    }
}
