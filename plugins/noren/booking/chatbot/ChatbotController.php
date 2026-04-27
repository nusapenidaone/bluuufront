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
use System\Models\File as SystemFile;

class ChatbotController extends Controller
{
    protected function corsHeaders()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: *');
    }

    protected function authenticate(Request $request): bool
    {
        $apiKey  = $request->header('X-Api-Key') ?? $request->query('api_key');
        $validKey = env('CHATBOT_API_KEY', 'bluuu-chatbot-2026');

        return $apiKey && $apiKey === $validKey;
    }

    protected function unauthorized()
    {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

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

    // ─── GET /api/chatbot/boats/private ──────────────────────────────────────

    public function getPrivateBoats(Request $request)
    {
        $this->corsHeaders();
        if (!$this->authenticate($request)) return $this->unauthorized();

        // Boats
        $tours = Tours::with(['packages', 'pricesbydates.packages', 'category', 'images'])
            ->whereIn('classes_id', [8])
            ->where('status', '!=', 'disabled')
            ->orderBy('sort_order')
            ->get();

        $today = Carbon::today();

        $boats = $tours->map(function ($tour) use ($today) {
            $bf         = $tour->props ?? [];
            $boatPrice  = (int) $tour->boat_price;

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
                'name'        => $tour->name,
                'slug'        => $tour->slug,
                'description' => $tour->description,
                'size'        => $tour->size,
                'capacity'    => $tour->capacity,
                'currency'    => 'IDR',
                'status'      => $tour->status ?: 'ready',
                'categories'  => $tour->category->map(fn($c) => $c->name)->values(),
                'features'    => $this->formatBoatFeatures($bf),
                'best_for'    => $bf['best_for']   ?? null,
                'boat_type'   => $bf['boat_type']  ?? null,
                'pricing'     => [
                    'type'            => 'per_boat',
                    'boat_price'      => $boatPrice,
                    'packages'        => $tour->packages ? [[
                        'name'      => $tour->packages->name,
                        'pricelist' => $tour->packages->pricelist ?? [],
                    ]] : [],
                    'seasonal_prices' => $seasonalPrices,
                ],
                'images'      => collect($tour->images_with_thumbs ?? [])
                    ->take(3)
                    ->map(fn($img) => $img['thumb1'] ?? $img['original'] ?? $img['path'] ?? $img['thumb'] ?? null)
                    ->filter()->values(),
            ];
        });

        // Routes (itineraries) for private tours
        $routes = Route::with([
            'ecategories',
            'restaurant',
        ])->where('classes_id', 8)->orderBy('sort_order')->get();

        $routeIds = $routes->pluck('id')->toArray();
        $maps = SystemFile::where('attachment_type', 'Noren\Booking\Models\Route')
            ->whereIn('attachment_id', $routeIds)
            ->where('field', 'map')
            ->get()
            ->keyBy('attachment_id');

        $formattedRoutes = $routes->map(function ($route) use ($maps) {
            return [
                'id'          => $route->id,
                'title'       => $route->title,
                'slug'        => $route->slug,
                'description' => $route->description,
                'map'         => optional($maps->get($route->id))->getPath(),
                'restaurant'  => $route->restaurant ? [
                    'id'   => $route->restaurant->id,
                    'name' => $route->restaurant->name,
                    'menu' => $route->restaurant->menu,
                ] : null,
            ];
        });

        // Extras
        $extras = Extras::with(['ecategories', 'images', 'children'])
            ->whereNull('parent_id')
            ->get()
            ->map(fn($e) => [
                'id'          => $e->id,
                'name'        => $e->name,
                'description' => $e->description,
                'price'       => $e->price,
                'currency'    => 'IDR',
                'category'    => optional($e->ecategories->first())->name,
                'has_options' => $e->children->isNotEmpty(),
                'options'     => $e->children->map(fn($c) => [
                    'id'    => $c->id,
                    'name'  => $c->name,
                    'price' => $c->price,
                ])->values(),
            ]);

        // Transfers (classes_id = 8 or null → private)
        $transfers = Transfer::orderBy('id')->get()
            ->filter(fn($t) => !$t->classes_id || (int) $t->classes_id === 8)
            ->map(fn($t) => [
                'id'          => $t->id,
                'name'        => $t->name,
                'price'       => (int) $t->price,
                'bus_price'   => $t->bus_price ? (int) $t->bus_price : null,
                'currency'    => 'IDR',
                'description' => $t->short_description ?: $t->description,
            ])->values();

        // Covers (per_boat = true, classes_id = 8 or null → private)
        $covers = Cover::orderBy('id')->get()
            ->filter(fn($c) => (bool) $c->per_boat && (!$c->classes_id || (int) $c->classes_id === 8))
            ->map(fn($c) => [
                'id'          => $c->id,
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

    // ─── GET /api/chatbot/boats/shared ───────────────────────────────────────

    public function getSharedBoats(Request $request)
    {
        $this->corsHeaders();
        if (!$this->authenticate($request)) return $this->unauthorized();

        $tours = Tours::with(['packages', 'pricesbydates.packages', 'category', 'images', 'route', 'route.restaurant', 'boat.closeddates'])
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

            // Рассчитываем доступность на "сегодня"
            $dateStr   = $today->format('Y-m-d');
            $realtimeCapacity = 0;

            // Если у тура есть лодка с closed=true и на неё есть не-крон запись на сегодня — тур закрыт
            $blockedByBlocker = $tour->boat->filter(fn($b) => !empty($b->closed))->contains(fn($b) =>
                $b->closeddates->contains(fn($cd) =>
                    $cd->deleted_at === null &&
                    substr($cd->date, 0, 10) === $dateStr &&
                    (int) $cd->type !== 4
                )
            );

            if (!$blockedByBlocker) foreach ($tour->boat as $boat) {
                if (!empty($boat->closed)) {
                    $hasClosedBoatRecord = $boat->closeddates->filter(fn($cd) =>
                        $cd->deleted_at === null && substr($cd->date, 0, 10) === $dateStr
                    )->isNotEmpty();
                    if ($hasClosedBoatRecord) continue;
                }

                $records = $boat->closeddates->filter(fn($cd) =>
                    $cd->deleted_at === null && substr($cd->date, 0, 10) === $dateStr
                );

                if ($records->isEmpty()) {
                    $realtimeCapacity += (int) ($boat->capacity ?? 0);
                    continue;
                }

                $blocked = $records->first(fn($cd) =>
                    $cd->type === null || $cd->type === '' || in_array((int) $cd->type, [2, 3, 4])
                );

                if ($blocked) continue;

                $used = (int) $records->where('type', 1)->sum('qtty');
                $realtimeCapacity += max(0, (int) ($boat->capacity ?? 0) - $used);
            }

            return [
                'id'          => $tour->id,
                'name'        => $tour->name,
                'slug'        => $tour->slug,
                'description' => $tour->description,
                'size'        => $tour->size,
                'capacity'    => $realtimeCapacity,
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
                    'id'    => $route->id,
                    'title' => $route->title,
                    'slug'  => $route->slug,
                ] : null,
                'restaurant'  => $route?->restaurant ? [
                    'id'   => $route->restaurant->id,
                    'name' => $route->restaurant->name,
                    'menu' => $route->restaurant->menu,
                ] : null,
                'images'      => collect($tour->images_with_thumbs ?? [])
                    ->take(3)
                    ->map(fn($img) => $img['thumb1'] ?? $img['original'] ?? $img['path'] ?? $img['thumb'] ?? null)
                    ->filter()->values(),
            ];
        });

        // Transfers (classes_id = 9 or null → shared)
        $transfers = Transfer::orderBy('id')->get()
            ->filter(fn($t) => !$t->classes_id || (int) $t->classes_id === 9)
            ->map(fn($t) => [
                'id'          => $t->id,
                'name'        => $t->name,
                'price'       => (int) $t->price,
                'bus_price'   => $t->bus_price ? (int) $t->bus_price : null,
                'currency'    => 'IDR',
                'description' => $t->short_description ?: $t->description,
            ])->values();

        // Covers (per_boat = false, classes_id = 9 or null → shared)
        $covers = Cover::orderBy('id')->get()
            ->filter(fn($c) => !(bool) $c->per_boat && (!$c->classes_id || (int) $c->classes_id === 9))
            ->map(fn($c) => [
                'id'          => $c->id,
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

    // ─── POST /api/chatbot/quote ──────────────────────────────────────────────

    public function getQuote(Request $request)
    {
        $this->corsHeaders();
        if (!$this->authenticate($request)) return $this->unauthorized();

        $tourId      = $request->input('tour_id');
        $date        = $request->input('date');        // YYYY-MM-DD
        $guests      = (int) $request->input('guests', 1);
        $routeId     = $request->input('route_id');    // nullable, for private tours
        $transferId  = $request->input('transfer');    // nullable
        $coverId     = $request->input('insurance');   // nullable
        $extrasInput = $request->input('extras', []);  // [{extra_id, quantity}]

        // ── Load tour ────────────────────────────────────────────────────
        $tour = Tours::with(['packages', 'pricesbydates.packages'])->find($tourId);
        if (!$tour) {
            return response()->json(['success' => false, 'error' => 'Tour not found'], 404);
        }

        $isShared = in_array((int) $tour->classes_id, [9, 10]);

        // ── Boat price ───────────────────────────────────────────────────
        $pricelist      = $tour->packages?->pricelist ?? [];
        $boatPriceToAdd = (int) $tour->boat_price;

        // Seasonal override
        if ($date && $tour->pricesbydates->isNotEmpty()) {
            $seasonal = $tour->pricesbydates->first(function ($pbd) use ($date) {
                return $date >= $pbd->date_start && $date <= $pbd->date_end;
            });
            if ($seasonal && $seasonal->packages?->pricelist) {
                $pricelist = $seasonal->packages->pricelist;
            }
        }

        // Find tier for guest count
        $boatBasePrice = 0;
        if (!empty($pricelist)) {
            $sorted = collect($pricelist)->sortBy(fn($p) => (int) $p['members_count']);
            $entry  = $sorted->last(fn($p) => (int) $p['members_count'] <= $guests)
                   ?? $sorted->first();
            $tierPrice     = (int) ($entry['price'] ?? 0);
            $boatBasePrice = $isShared ? $tierPrice : $tierPrice + $boatPriceToAdd;
        }

        // ── Transfer ─────────────────────────────────────────────────────
        $transferPrice = 0;
        if ($transferId) {
            $transfer = Transfer::find($transferId);
            if ($transfer) {
                $transferPrice = ($guests > 5 && $transfer->bus_price)
                    ? (int) $transfer->bus_price
                    : (int) $transfer->price;
            }
        }

        // ── Cover / insurance ────────────────────────────────────────────
        $coverPrice = 0;
        if ($coverId) {
            $cover = Cover::find($coverId);
            if ($cover) {
                $coverPrice = (int) ($cover->price ?? 0);
            }
        }

        // ── Extras ───────────────────────────────────────────────────────
        $extrasTotal = 0;
        $extrasBreakdown = [];
        if (!empty($extrasInput)) {
            $extraIds  = collect($extrasInput)->pluck('extra_id')->toArray();
            $extrasMap = Extras::whereIn('id', $extraIds)->get()->keyBy('id');

            foreach ($extrasInput as $item) {
                $extra = $extrasMap->get($item['extra_id']);
                if (!$extra) continue;
                $qty        = max(1, (int) ($item['quantity'] ?? 1));
                $unitPrice  = (int) ($extra->price ?? 0);
                $subtotal   = $unitPrice * $qty;
                $extrasTotal += $subtotal;
                $extrasBreakdown[] = [
                    'extra_id' => $extra->id,
                    'name'     => $extra->name,
                    'qty'      => $qty,
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
        $baseUrl  = rtrim(env('APP_URL', 'https://bluuu.tours'), '/');
        $page     = $isShared ? 'shared-tour-to-nusa-penida' : 'private-tour-to-nusa-penida';
        $urlParams = array_filter([
            'date'     => $date,
            'adults'   => $guests,
            'tour'     => $tour->id,
            'route'    => (!$isShared && $routeId) ? $routeId : null,
            'transfer' => $transferId ?: null,
            'cover'    => $coverId ?: null,
        ], fn($v) => $v !== null && $v !== '');
        $bookingUrl = $baseUrl . '/' . $page . '?' . http_build_query($urlParams);

        return response()->json([
            'success'       => true,
            'booking_url'   => $bookingUrl,
            'currency_idr'  => [
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
            'currency_usd'  => $usdRate ? [
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
                'tour_id'    => $tour->id,
                'tour_name'  => $tour->name,
                'tour_type'  => $isShared ? 'shared' : 'private',
                'date'       => $date,
                'guests'     => $guests,
            ],
        ]);
    }
}
