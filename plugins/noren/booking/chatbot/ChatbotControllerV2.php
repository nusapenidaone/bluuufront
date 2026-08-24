<?php

namespace Noren\Booking\Chatbot;

use Illuminate\Routing\Controller;
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

class ChatbotControllerV2 extends Controller
{
    protected function corsHeaders()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: *');
    }

    protected static function cfg(): array
    {
        static $cfg = null;
        if ($cfg === null) {
            $cfg = require(__DIR__ . '/services.config.php');
            if (!is_array($cfg) || !isset($cfg['api_key'])) {
                throw new \RuntimeException('Invalid or missing Chatbot config in services.config.php');
            }
        }
        return $cfg;
    }

    protected function authenticate(Request $request): bool
    {
        $apiKey   = $request->header('X-Api-Key') ?? $request->query('api_key');
        $validKey = static::cfg()['api_key'];

        return $apiKey && $apiKey === $validKey;
    }

    protected function unauthorized()
    {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    // Merges Route::schedule_before_lunch + schedule_after_lunch (repeater
    // fields already shown in the on-site route popup) into a flat timeline.
    // 'or-chip' rows are UI separators ("or") between alternative activities,
    // not real time slots, so they're excluded.
    protected function buildItinerary($route): array
    {
        if (!$route) return [];

        $steps = collect($route->schedule_before_lunch ?? [])
            ->merge($route->schedule_after_lunch ?? []);

        return $steps
            ->filter(fn($step) => ($step['type'] ?? 'item') === 'item')
            ->map(fn($step) => [
                'time'  => $step['time']  ?? '',
                'title' => $step['title'] ?? '',
            ])
            ->filter(fn($step) => $step['title'] !== '')
            ->values()
            ->toArray();
    }

    // Route::highlights is the same repeater shown as highlight chips on the
    // route card/popup — used here as the inclusions list.
    protected function buildInclusions($route): array
    {
        if (!$route) return [];

        return collect($route->highlights ?? [])
            ->pluck('label')
            ->filter(fn($label) => $label !== null && $label !== '')
            ->values()
            ->toArray();
    }

    protected function formatChatbotExtra($e): array
    {
        return [
            'id'          => $e->id,
            'odoo_id'     => $e->odoo_id ? (int) $e->odoo_id : null,
            'name'        => $e->name,
            'description' => $e->description,
            'price'       => $e->price,
            'currency'    => 'IDR',
            'qty_type'    => $e->qty_type ?: 'manual',
            'has_options' => $e->children->isNotEmpty(),
            'options'     => $e->children->map(fn($c) => [
                'id'      => $c->id,
                'odoo_id' => $c->odoo_id ? (int) $c->odoo_id : null,
                'name'    => $c->name,
                'price'   => $c->price,
            ])->values(),
        ];
    }

    protected function formatBoatFeatures(array $bf): array
    {
        $on = fn($v) => $v === true || $v === 1 || $v === '1';

        return [
            'shade'  => $on($bf['shade']  ?? null) ? 'Full shade + flybridge' : 'Partial shade',
            'cabin'  => $on($bf['cabin']  ?? null),
            'ac'     => $on($bf['ac']     ?? null),
            'sound'  => $on($bf['sound']  ?? null) ? 'Bose sound' : null,
            'toilet' => $on($bf['toilet'] ?? null),
        ];
    }

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

        $routes = Route::with([
            'ecategories' => fn($q) => $q->orderBy('sort_order'),
            'ecategories.extras' => fn($q) => $q->whereNull('parent_id')->with('children'),
            'restaurant',
        ])
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
                'itinerary'   => $this->buildItinerary($route),
                'inclusions'  => $this->buildInclusions($route),
                'notes'       => $route->add_on_note ?: null,
                'extra_categories' => $route->ecategories->map(fn($cat) => [
                    'id'     => $cat->id,
                    'name'   => $cat->name,
                    'extras' => $cat->extras->map(fn($e) => $this->formatChatbotExtra($e))->values(),
                ])->values(),
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
                'qty_type'    => $e->qty_type ?: 'manual',
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
                'itinerary'   => $this->buildItinerary($route),
                'inclusions'  => $this->buildInclusions($route),
                'notes'       => $route?->add_on_note ?: null,
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
        $boatId         = $request->input('boat_id');
        $pickupAddress  = $request->input('pickup_address', '');
        $dropoffAddress = $request->input('dropoff_address', '');
        $cars           = (int) $request->input('cars', 0);
        $customerName   = $request->input('name', '');
        $customerEmail  = $request->input('email', '');
        $customerPhone  = $request->input('whatsapp', '');
        $externalId     = $request->input('external_id', '');

        // ── Load tour ────────────────────────────────────────────────────
        // pricesbydates filtered to date_end >= tomorrow — mirrors
        // FullController::getTourDetail() so the chatbot picks the same
        // seasonal price tier the website shows (expired/overlapping rows
        // excluded, same as the site).
        $tomorrow = Carbon::tomorrow();
        $tour = Tours::with([
            'packages',
            'pricesbydates' => function ($query) use ($tomorrow) {
                $query->where('date_end', '>=', $tomorrow);
            },
            'pricesbydates.packages',
        ])->find($tourId);
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
            $route = Route::with('restaurant')->find($routeId);
        } elseif ($isShared) {
            $tour->loadMissing(['route' => fn($q) => $q->with('restaurant')]);
            $route = $tour->route;
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

        // ── USD rate ─────────────────────────────────────────────────────
        $rate    = Rates::where('code', 'USD')->orderBy('id', 'desc')->first();
        $usdRate = $rate ? (float) $rate->rate : null;

        $finalTotalIDR = $boatBasePrice + $transferPrice + $coverPrice;
        $finalTotalUSD = $usdRate ? round($finalTotalIDR * $usdRate) : null;
        $perPaxIDR     = $guests > 0 ? round($finalTotalIDR / $guests) : $finalTotalIDR;
        $perPaxUSD     = $usdRate ? round($perPaxIDR * $usdRate) : null;

        // ── Booking URL ──────────────────────────────────────────────────
        $baseUrl   = rtrim(env('APP_URL', 'https://bluuu.tours'), '/');
        $page      = $isShared ? 'shared-tour-to-nusa-penida' : 'private-tour-to-nusa-penida';
        $urlParams = array_filter([
            'date'     => $date,
            'adults'   => $adults ?: $guests,
            'kids'     => $kids > 0 ? $kids : null,
            'tour'     => $tour->id,
            'route'    => (!$isShared && $routeId) ? $routeId : null,
            'transfer' => $transferId ?: null,
            'cover'    => $coverId ?: null,
        ], fn($v) => $v !== null && $v !== '');
        $bookingUrl = "{$baseUrl}/{$page}?" . http_build_query($urlParams);

        return response()->json([
            'success'      => true,
            'booking_url'  => $bookingUrl,
            'odoo_data'    => $this->buildOdooData(
                $tour, $boat, $route, $transfer, $cover,
                $adults, $kids, $guests, $date,
                $pickupAddress, $dropoffAddress, $cars,
                $customerName, $customerEmail, $customerPhone, $externalId,
                $boatBasePrice, $transferPrice, $coverPrice
            ),
            'currency_idr' => [
                'total_price'   => $finalTotalIDR,
                'price_per_pax' => $perPaxIDR,
                'breakdown'     => [
                    'boat_base_price' => $boatBasePrice,
                    'transfer'        => $transferPrice,
                    'insurance'       => $coverPrice,
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

    // ─── GET /api/v2/chatbot/availability ────────────────────────────────────
    // Tour-level free/booked snapshot for a date, read from Closeddates (kept
    // in sync with Odoo via OdooWebhookController), so it never reports a tour
    // as available when its boats are actually booked in Odoo.

    public function getAvailability(Request $request)
    {
        $this->corsHeaders();
        if (!$this->authenticate($request)) return $this->unauthorized();

        $date = $request->input('date');
        if (!$date || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            return response()->json(['success' => false, 'error' => 'date (YYYY-MM-DD) is required'], 422);
        }

        $tourId = $request->input('tour_id');
        $guests = $request->input('guests') !== null ? (int) $request->input('guests') : null;

        $available   = [];
        $unavailable = [];

        foreach ([
            ...$this->privateTourAvailability($date, $tourId, $guests),
            ...$this->sharedTourAvailability($date, $tourId, $guests),
        ] as $row) {
            if ($row['available']) {
                $available[] = $row['data'];
            } else {
                $unavailable[] = $row['data'];
            }
        }

        return response()->json([
            'success'     => true,
            'date'        => $date,
            'available'   => $available,
            'unavailable' => $unavailable,
            'updated_at'  => Carbon::now()->toISOString(),
        ]);
    }

    // Private: "slots" = free physical boats (a private booking takes over a
    // whole boat). type=3/4 (manual/cron) closures → blackout; a boat taken by
    // an actual private booking (type=2, or legacy/untyped) → fully_booked.
    private function privateTourAvailability(string $date, $tourId, ?int $guests): array
    {
        $tours = Tours::with(['boat' => fn($q) => $q->with('company')
                ->orderBy('noren_booking_tours_boat.sort_order')
                ->orderBy('noren_booking_boat.sort_order')
                ->orderBy('noren_booking_boat.id')])
            ->whereIn('classes_id', [8])
            ->where('status', '!=', 'disabled')
            ->when($tourId, fn($q) => $q->where('id', $tourId))
            ->orderBy('sort_order')
            ->get();

        $rows = [];

        foreach ($tours as $tour) {
            $boats   = $tour->boat->filter(fn($b) => empty($b->closed))->values();
            $boatIds = $boats->pluck('id');

            $closedRows = Closeddates::whereIn('boat_id', $boatIds)
                ->where('date', $date)
                ->whereNull('deleted_at')
                ->get()
                ->groupBy('boat_id');

            $freeBoats     = 0;
            $blackoutSeen  = false;
            $totalCapacity = 0;

            foreach ($boats as $boat) {
                $totalCapacity += (int) ($boat->capacity ?? 0);
                $records = $closedRows->get($boat->id, collect());

                if ($records->isEmpty()) {
                    if ($guests === null || (int) $boat->capacity >= $guests) {
                        $freeBoats++;
                    }
                    continue;
                }

                if ($records->contains(fn($r) => in_array((int) $r->type, [3, 4], true))) {
                    $blackoutSeen = true;
                }
            }

            $tourData = [
                'tour_id' => $tour->id,
                'odoo_id' => $tour->odoo_id ? (int) $tour->odoo_id : null,
                'name'    => $tour->name,
                'type'    => 'private',
            ];

            // Cap at the tour's official registered capacity — the summed boat
            // capacity is informational and shouldn't advertise more than what
            // the tour is actually configured to carry.
            $capacity = $tour->capacity ? min($totalCapacity, (int) $tour->capacity) : $totalCapacity;

            $rows[] = $freeBoats > 0
                ? ['available' => true, 'data' => $tourData + [
                    'capacity'   => $capacity,
                    'slots_left' => $freeBoats,
                ]]
                : ['available' => false, 'data' => $tourData + [
                    'reason' => $blackoutSeen ? 'blackout' : 'fully_booked',
                ]];
        }

        return $rows;
    }

    // Shared: a group always books a single boat (never split across boats),
    // so "slots_left" is the largest single-boat opening, not a sum. A boat
    // hard-blocked by a private booking / manual / cron closure, or filled by
    // ANOTHER shared tour, counts toward "blackout"; capacity purely consumed
    // by this same tour's own passengers counts toward "fully_booked".
    private function sharedTourAvailability(string $date, $tourId, ?int $guests): array
    {
        $tours = Tours::with(['boat' => fn($q) => $q->with('company')
                ->orderBy('noren_booking_tours_boat.sort_order')
                ->orderBy('noren_booking_boat.sort_order')
                ->orderBy('noren_booking_boat.id')])
            ->whereIn('classes_id', [9])
            ->where('status', '!=', 'disabled')
            ->when($tourId, fn($q) => $q->where('id', $tourId))
            ->orderBy('sort_order')
            ->get();

        $rows = [];

        foreach ($tours as $tour) {
            $tourType = $tour->odoo_type ?? null;

            $allBoatIds = $tour->boat->pluck('id');
            $closedRows = Closeddates::whereIn('boat_id', $allBoatIds)
                ->where('date', $date)
                ->whereNull('deleted_at')
                ->get()
                ->groupBy('boat_id');

            $blockedByBlocker = $tour->boat->filter(fn($b) => !empty($b->closed))->contains(
                fn($b) => $closedRows->get($b->id, collect())->contains(fn($cd) => (int) $cd->type !== 4)
            );

            $bestSingleBoat = 0;
            $blackoutSeen   = false;
            $totalCapacity  = 0;

            foreach ($tour->boat as $boat) {
                if (!empty($boat->closed)) continue;

                $capacity = (int) ($boat->capacity ?? 0);
                $totalCapacity += $capacity;
                $records  = $closedRows->get($boat->id, collect());

                $hardBlocked = $blockedByBlocker || $records->contains(function ($r) use ($tourType) {
                    $t = $r->type;
                    if ($t === null || $t === '' || in_array((int) $t, [2, 3, 4])) return true;
                    if ((int) $t === 1 && $r->tour_type && $r->tour_type !== $tourType) return true;
                    return false;
                });

                if ($hardBlocked) {
                    $blackoutSeen = true;
                    continue;
                }

                $booked    = (int) $records->where('type', 1)
                    ->filter(fn($r) => !$r->tour_type || $r->tour_type === $tourType)
                    ->sum('qtty');
                $available = max(0, $capacity - $booked);
                $bestSingleBoat = max($bestSingleBoat, $available);
            }

            // Cap at the tour's official registered capacity — the summed boat
            // capacity is informational and shouldn't advertise more than what
            // the tour is actually configured to carry.
            $displayCapacity = $tour->capacity ? min($totalCapacity, (int) $tour->capacity) : $totalCapacity;

            // Defensive clamp — slots_left must never read higher than capacity.
            $bestSingleBoat = min($bestSingleBoat, $displayCapacity);

            $tourData = [
                'tour_id' => $tour->id,
                'odoo_id' => $tour->odoo_id ? (int) $tour->odoo_id : null,
                'name'    => $tour->name,
                'type'    => 'shared',
            ];

            $fits = $guests === null ? $bestSingleBoat > 0 : $bestSingleBoat >= $guests;

            $rows[] = $fits
                ? ['available' => true, 'data' => $tourData + [
                    'capacity'   => $displayCapacity,
                    'slots_left' => $bestSingleBoat,
                ]]
                : ['available' => false, 'data' => $tourData + [
                    'reason' => $blackoutSeen ? 'blackout' : 'fully_booked',
                ]];
        }

        return $rows;
    }

    // ─── Available boats (same logic as PrivateOrderController / SharedOrderController) ──

    private function getAvailableBoats($tour, ?string $date, int $guests, bool $isShared): \Illuminate\Support\Collection
    {
        $tour->loadMissing(['boat' => fn($q) => $q->with('company')->orderBy('noren_booking_tours_boat.sort_order')->orderBy('noren_booking_boat.sort_order')->orderBy('noren_booking_boat.id')]);

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
                $tourType = $tour->odoo_type ?? null;
                $blocked = $records->contains(function ($r) use ($tourType) {
                    $t = $r->type;
                    if ($t === null || $t === '' || in_array((int) $t, [2, 3, 4])) return true;
                    // Another shared tour is using this boat
                    if ((int) $t === 1 && $r->tour_type && $r->tour_type !== $tourType) return true;
                    return false;
                });
                if ($blocked) continue;

                $booked = (int) $records->where('type', 1)->filter(function ($r) use ($tourType) {
                    return !$r->tour_type || $r->tour_type === $tourType;
                })->sum('qtty');
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
        int $adults, int $kids, int $guests, ?string $date,
        string $pickupAddress, string $dropoffAddress, int $cars,
        string $customerName, string $customerEmail, string $customerPhone, string $externalId,
        float $boatBasePrice, float $transferPrice, float $coverPrice
    ): array {
        $company      = $boat?->company;
        $isShared     = in_array((int) $tour->classes_id, [9, 10]);
        // x_studio_route_new / x_studio_lunch are Odoo "selection" fields — the value
        // must match the option exactly, hence odoo_name (not name/title) as in
        // OdooService::buildOrderData().
        $restaurant   = $route?->restaurant;
        $routeName    = $route?->odoo_name ?? '';
        $lunchName    = $restaurant?->odoo_name ?? '';
        $routeStart   = $route?->start ?? '08:00:00';
        $routeEnd     = $route?->end   ?? '18:00:00';
        $transferType = $transfer?->type ?? '';

        $rentalStart = $date
            ? Carbon::parse($date . ' ' . $routeStart, 'Asia/Makassar')->utc()->addHours(4)->format('Y-m-d H:i:s')
            : null;
        $rentalEnd = $date
            ? Carbon::parse($date . ' ' . $routeEnd, 'Asia/Makassar')->utc()->addHours(4)->format('Y-m-d H:i:s')
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
            'x_studio_route_new'        => $routeName,
            'x_studio_lunch'            => $lunchName,
            'x_studio_pickup_address'   => $pickupAddress,
            'x_studio_drop_off_address' => $dropoffAddress,
            'x_studio_pickup_cars'      => in_array($transfer?->id, [1, 2]) ? 1 : 0,
            'x_studio_drop_off_cars'    => $transfer?->id === 2 ? 1 : 0,
            'x_studio_car_type'         => $this->resolveCarTypeFromTransfer($transfer, $guests),
            'x_studio_tour_type'        => $tour->odoo_type ?? '',
            'x_studio_deposit'          => 0.0,
            // x_studio_collect is readonly/computed in Odoo (amount_total - deposit -
            // collected_by_*) — sending it on create is rejected, so it's intentionally
            // omitted here. Use currency_idr.total_price for the amount to collect.
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

        // 5. Restaurant
        if ($restaurant?->odoo_id) {
            $lines[] = [
                'label'      => 'restaurant',
                'product_id' => (int) $restaurant->odoo_id,
                'qty'        => $guests,
                'price'      => 0.0,
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
