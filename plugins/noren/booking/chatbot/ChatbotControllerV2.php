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
use Noren\Booking\Models\LowSeason;
use Noren\Booking\Classes\TourPricing;
use Noren\Bluuu\Models\Rules;
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
            'conflict_ids' => $e->conflict_ids,
            'has_options' => $e->children->isNotEmpty(),
            'options'     => $e->children->map(fn($c) => [
                'id'      => $c->id,
                'odoo_id' => $c->odoo_id ? (int) $c->odoo_id : null,
                'name'    => $c->name,
                'price'   => $c->price,
                'conflict_ids' => $c->conflict_ids,
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

    // `included`/`includes` are two separate M2M lists on Tours (mirrors
    // FullController::getPrivateTours()): `included` = detailed "what's
    // included" cards (with description + icon), `includes` = short
    // inclusion chips (name + icon only, no description).
    protected function formatIncluded($tour): array
    {
        return $tour->included->map(fn($i) => [
            'id'          => $i->id,
            'name'        => $i->name,
            'description' => $i->description,
            'icon_svg'    => $i->icon_svg,
        ])->values()->toArray();
    }

    protected function formatIncludes($tour): array
    {
        return $tour->includes->map(fn($i) => [
            'id'       => $i->id,
            'name'     => $i->name,
            'icon_svg' => $i->icon_svg,
        ])->values()->toArray();
    }

    // Tours.list is a repeater of {icon, test} (site card "perks" checklist —
    // 'test' is the actual site's field name for the text, not a typo here).
    // Some legacy tours have the same shape nested under Tours.json.list
    // instead — mirrors the fallback in src/private(new).jsx / shared(new).jsx.
    protected function formatPerks($tour): array
    {
        $json = is_array($tour->json) ? $tour->json : [];
        $raw  = is_array($tour->list) && !empty($tour->list)
            ? $tour->list
            : (is_array($json['list'] ?? null) ? $json['list'] : []);

        return collect($raw)->map(function ($item) {
            if (is_string($item)) {
                $text = trim($item);
                return $text !== '' ? ['text' => $text, 'icon' => 'check-icon-green'] : null;
            }
            if (is_array($item)) {
                $text = trim((string) ($item['text'] ?? $item['test'] ?? $item['title'] ?? ''));
                return $text !== '' ? ['text' => $text, 'icon' => $item['icon'] ?? 'check-icon-green'] : null;
            }
            return null;
        })->filter()->values()->toArray();
    }

    // Mirrors the richer restaurant shape already used by FullController
    // (getRouteById/getSharedTours/getRestaurant) — chatbot previously only
    // sent id/odoo_id/name/menu, missing description/menu_sections/menu_note
    // that the on-site restaurant card actually renders.
    protected function formatRestaurant($restaurant): ?array
    {
        if (!$restaurant) return null;

        return [
            'id'                 => $restaurant->id,
            'odoo_id'            => $restaurant->odoo_id ? (int) $restaurant->odoo_id : null,
            'name'               => $restaurant->name,
            'description'        => $restaurant->description,
            'menu'               => $restaurant->menu,
            'menu_sections'      => $restaurant->menu_sections ?: [],
            'menu_note'          => $restaurant->menu_note,
            'image'              => $restaurant->image,
            'images_with_thumbs' => $restaurant->images_with_thumbs,
        ];
    }

    // ─── GET /api/v2/chatbot/boats/private ───────────────────────────────────

    public function getPrivateBoats(Request $request)
    {
        $this->corsHeaders();
        if (!$this->authenticate($request)) return $this->unauthorized();

        $tours = Tours::with(['packages', 'pricesbydates.packages', 'category', 'images', 'boat.company', 'included', 'includes', 'lowseasons'])
            ->where('types_id', 2)
            ->where('source_id', 1)
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
                'partner'     => (bool) $tour->partner,
                'categories'  => $tour->category->map(fn($c) => $c->name)->values(),
                'features'    => $this->formatBoatFeatures($bf),
                'best_for'    => $bf['best_for']  ?? null,
                'boat_type'   => $bf['boat_type'] ?? null,
                'perks'       => $this->formatPerks($tour),
                'included'    => $this->formatIncluded($tour),
                'includes'    => $this->formatIncludes($tour),
                'pricing'     => [
                    'type'            => 'per_boat',
                    'boat_price'      => $boatPrice,
                    'packages'        => $tour->packages ? [[
                        'name'      => $tour->packages->name,
                        'pricelist' => $tour->packages->pricelist ?? [],
                    ]] : [],
                    'seasonal_prices' => $seasonalPrices,
                    'low_seasons'     => TourPricing::lowSeasonsFor($tour),
                ],
                'low_season_max_percent' => TourPricing::maxUpcomingPercent($tour),
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
            'ecategories.extras' => fn($q) => $q->whereNull('parent_id')->with(['children.conflicts', 'conflicts']),
            'restaurant.images',
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
                'restaurant'  => $this->formatRestaurant($route->restaurant),
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

        $extras = Extras::with(['ecategories', 'images', 'children.conflicts', 'conflicts'])
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
                'conflict_ids' => $e->conflict_ids,
                'has_options' => $e->children->isNotEmpty(),
                'options'     => $e->children->map(fn($c) => [
                    'id'      => $c->id,
                    'odoo_id' => $c->odoo_id ? (int) $c->odoo_id : null,
                    'name'    => $c->name,
                    'price'   => $c->price,
                    'conflict_ids' => $c->conflict_ids,
                ])->values(),
            ]);

        $transfers = Transfer::orderBy('id')->get()
            ->filter(fn($t) => !$t->types_id || (int) $t->types_id === 2)
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
            ->filter(fn($c) => (bool) $c->per_boat && (!$c->types_id || (int) $c->types_id === 2))
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

        $tours = Tours::with(['packages', 'pricesbydates.packages', 'category', 'images', 'route', 'route.restaurant.images', 'boat.company', 'included', 'includes', 'badge', 'lowseasons'])
            ->where('types_id', 1)
            ->where('source_id', 1)
            ->where('status', '!=', 'disabled')
            ->orderBy('sort_order')
            ->get();

        $today = Carbon::today();

        $boats = $tours->map(function ($tour) use ($today) {
            $bf    = $tour->props ?? [];
            $route = $tour->route;

            $defaultPrice = (int) ($tour->show_price ?: ($tour->gross_price ?: ($tour->price ?: 0)));
            $maxLowSeason = TourPricing::maxUpcomingPercent($tour);

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
                'badge_name'  => $tour->badge?->name ?: null,
                'badge_color' => $tour->badge?->color ?: null,
                'headline'    => is_array($tour->json) ? ($tour->json['subtitle'] ?? $tour->json['headline'] ?? null) : null,
                'categories'  => $tour->category->map(fn($c) => $c->name)->values(),
                'features'    => $this->formatBoatFeatures($bf),
                'perks'       => $this->formatPerks($tour),
                'included'    => $this->formatIncluded($tour),
                'includes'    => $this->formatIncludes($tour),
                'pricing'     => [
                    'type'            => 'per_guest',
                    'default_price'   => $defaultPrice,
                    'default_price_discounted' => $defaultPrice - TourPricing::discountAmount($defaultPrice, $maxLowSeason),
                    'packages'        => $tour->packages ? [[
                        'name'      => $tour->packages->name,
                        'pricelist' => $tour->packages->pricelist ?? [],
                    ]] : [],
                    'seasonal_prices' => $seasonalPrices,
                    'low_seasons'     => TourPricing::lowSeasonsFor($tour),
                ],
                'low_season_max_percent' => $maxLowSeason,
                'route'       => $route ? [
                    'id'      => $route->id,
                    'odoo_id' => $route->odoo_id ? (int) $route->odoo_id : null,
                    'title'   => $route->title,
                    'slug'    => $route->slug,
                ] : null,
                'restaurant'  => $this->formatRestaurant($route?->restaurant),
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
            ->filter(fn($t) => !$t->types_id || (int) $t->types_id === 1)
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
            ->filter(fn($c) => !(bool) $c->per_boat && (!$c->types_id || (int) $c->types_id === 1))
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
        if ($date && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            $date = null; // e.g. LLM sends "undecided" when the user hasn't picked a date yet
        }
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

        $isShared = (int) $tour->types_id === 1;

        // ── Boat price (+ low season) ────────────────────────────────────
        // $boatBasePrice — уже со скидкой; $originalBasePrice — без неё.
        $priceQuote        = TourPricing::quote($tour, $date, $guests, !$isShared);
        $originalBasePrice = $priceQuote['has_pricelist'] ? $priceQuote['original'] : 0;
        $lowSeasonPercent  = $priceQuote['has_pricelist'] ? $priceQuote['percent'] : 0;
        $lowSeasonDiscount = $priceQuote['has_pricelist'] ? $priceQuote['discount'] : 0;
        $boatBasePrice     = $originalBasePrice - $lowSeasonDiscount;

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
                $originalBasePrice, $transferPrice, $coverPrice, $lowSeasonPercent
            ),
            'currency_idr' => [
                'total_price'   => $finalTotalIDR,
                'price_per_pax' => $perPaxIDR,
                'breakdown'     => [
                    'original_boat_base_price' => $originalBasePrice,
                    'low_season_percent'       => $lowSeasonPercent,
                    'low_season_discount'      => $lowSeasonDiscount,
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
                    'original_boat_base_price' => round($originalBasePrice * $usdRate),
                    'low_season_percent'       => $lowSeasonPercent,
                    'low_season_discount'      => round($lowSeasonDiscount * $usdRate),
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
                'low_season' => $lowSeasonPercent > 0 ? $priceQuote['low_season'] : null,
            ],
        ]);
    }

    // ─── GET /api/v2/chatbot/policies ────────────────────────────────────────
    // Site-wide policy texts (not per-tour) — same source as the on-site
    // policy popups (FullController::getRules(), src/contexts/RulesContext.jsx).
    // 'return'/'release' are the raw settings field names; renamed here to
    // 'cancellation'/'liability' since the API is a fresh contract, not a
    // passthrough of legacy field names.

    public function getPolicies(Request $request)
    {
        $this->corsHeaders();
        if (!$this->authenticate($request)) return $this->unauthorized();

        $rules = Rules::instance();

        return response()->json([
            'payment'      => $rules->payment,
            'cancellation' => $rules->{'return'},
            'privacy'      => $rules->privacy,
            'health'       => $rules->health,
            'liability'    => $rules->release,
            'updated_at'   => Carbon::now()->toISOString(),
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
        $lowSeasonByTour = $this->lowSeasonPercentsOn($date);

        foreach ([
            ...$this->privateTourAvailability($date, $tourId, $guests),
            ...$this->sharedTourAvailability($date, $tourId, $guests),
        ] as $row) {
            if ($row['available']) {
                $row['data']['low_season_percent'] = $lowSeasonByTour[(int) $row['data']['tour_id']] ?? 0;
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

    // [tour_id => max low season %] для активных правил на дату
    private function lowSeasonPercentsOn(string $date): array
    {
        $map = [];
        $rules = LowSeason::with('tours')->activeOn($date)->where('percent', '>', 0)->get();
        foreach ($rules as $rule) {
            foreach ($rule->tours as $t) {
                $map[(int) $t->id] = max($map[(int) $t->id] ?? 0, min(90, (int) $rule->percent));
            }
        }
        return $map;
    }

    // ─── GET /api/v2/chatbot/low-season ──────────────────────────────────────
    // Активные и будущие low season скидки (date_end >= сегодня, Bali time) с турами
    // сайта (source_id=1, не disabled). Для ответа на "есть ли сейчас скидки?".

    public function getLowSeasons(Request $request)
    {
        $this->corsHeaders();
        if (!$this->authenticate($request)) return $this->unauthorized();

        $today = Carbon::now('Asia/Makassar')->format('Y-m-d');

        $rules = LowSeason::with('tours')
            ->upcoming($today)
            ->where('percent', '>', 0)
            ->orderBy('date_start')
            ->get();

        $items = $rules->map(fn($rule) => [
            'name'       => $rule->name,
            'date_start' => TourPricing::day($rule->date_start),
            'date_end'   => TourPricing::day($rule->date_end),
            'percent'    => min(90, (int) $rule->percent),
            'tours'      => $rule->tours
                ->filter(fn($t) => (int) $t->source_id === 1 && $t->status !== 'disabled')
                ->map(fn($t) => [
                    'tour_id' => $t->id,
                    'name'    => $t->name,
                    'type'    => (int) $t->types_id === 2 ? 'private' : 'shared',
                ])->values(),
        ])->filter(fn($i) => $i['tours']->isNotEmpty())->values();

        return response()->json([
            'success'     => true,
            'low_seasons' => $items,
            'note'        => 'Discount applies to the tour price only (tour + boat for private). Transfer, insurance and extras are full price.',
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
            ->where('types_id', 2)
            ->where('source_id', 1)
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
            ->where('types_id', 1)
            ->where('source_id', 1)
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
        float $boatBasePrice, float $transferPrice, float $coverPrice, int $lowSeasonPercent = 0
    ): array {
        // $boatBasePrice здесь — полная цена (без low season); в price строки тура уходит цена
        // УЖЕ со скидкой, discount = 0 (как в OdooService::addOrderLines)
        $tourLinePrice = $boatBasePrice - TourPricing::discountAmount((int) round($boatBasePrice), $lowSeasonPercent);
        $company      = $boat?->company;
        $isShared     = (int) $tour->types_id === 1;
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
                $price = $guests > 0 ? round($tourLinePrice / $guests, 2) : 0.0;
            } else {
                $qty   = 1;
                $price = (float) $tourLinePrice;
            }
            $lines[] = [
                'label'      => 'tour',
                'product_id' => (int) $tour->odoo_id,
                'qty'        => $qty,
                'price'      => $price,
                'discount'   => 0.0,
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
