<?php

namespace Noren\Booking\Routes;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Noren\Booking\Models\Rates;
use Noren\Booking\Models\Tours;
use Noren\Booking\Models\Extras;
use Noren\Booking\Models\Ecategories;
use Noren\Booking\Models\Transfer;
use Noren\Booking\Models\Route;
use Noren\Booking\Models\Cover;
use Noren\Booking\Models\Restaurant;
use Noren\Booking\Models\Order;

class FullController extends Controller
{
    public function getRoutes(Request $request)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        $query = Route::with([
            'ecategories.extras' => function ($q) {
                $q->whereNull('parent_id');
            },
            'ecategories.extras.children.images',
            'ecategories.extras.images',
            'photos',
            'restaurant.images',
        ]);

        if ($request->has('classes_id')) {
            $query->where('classes_id', (int) $request->get('classes_id'));
        }

        $routes = $query->get();

        return $routes->map(function ($route) {
            $payload = $route->toArray();
            $restaurant = $route->restaurant;

            if (!$restaurant) {
                $payload['restaurant'] = null;
                return $payload;
            }

            $payload['restaurant'] = [
                'id' => $restaurant->id,
                'name' => $restaurant->name,
                'description' => $restaurant->description,
                'menu' => $restaurant->menu,
                'image' => $restaurant->image,
                'images_with_thumbs' => $restaurant->images_with_thumbs,
            ];

            return $payload;
        });
    }

    public function getRestaurants()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        $restaurants = Restaurant::with('images')->get();

        return $restaurants->map(fn($r) => [
            'id'               => $r->id,
            'name'             => $r->name,
            'description'      => $r->description,
            'menu'             => $r->menu,
            'image'            => $r->image,
            'images_with_thumbs' => $r->images_with_thumbs,
        ]);
    }

    public function getRestaurant($id)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        $restaurant = Restaurant::with('images')->find($id);

        if (!$restaurant) {
            return response()->json(null, 404);
        }

        return response()->json([
            'id'               => $restaurant->id,
            'name'             => $restaurant->name,
            'description'      => $restaurant->description,
            'menu'             => $restaurant->menu,
            'image'            => $restaurant->image,
            'images_with_thumbs' => $restaurant->images_with_thumbs,
        ]);
    }

    public function getRates()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');
        return Rates::all();
    }

    public function getTours()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        return Tours::with(['packages', 'classes', 'pricesbydates.packages', 'route', 'badge'])->get();
    }

    public function getPrivateTours()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        $tours = Tours::with(['packages', 'pricesbydates.packages'])
            ->where('classes_id', 8)
            ->get();

        return $tours->map(function ($tour) {
            return [
                'id' => $tour->id,
                'name' => $tour->name,
                'description' => $tour->description,
                'slug' => $tour->slug,
                'capacity' => $tour->capacity,
                'size' => $tour->size,
                'images_with_thumbs' => $tour->images_with_thumbs,
                'packages' => $tour->packages,
                'boat_price' => $tour->boat_price,
                'pricesbydates' => $tour->pricesbydates,
            ];
        });
    }

    public function getTourDetail($slug)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        $tomorrow = Carbon::tomorrow();

        $tour = Tours::with([
            'packages',
            'pricesbydates' => function ($query) use ($tomorrow) {
                $query->where('date_end', '>=', $tomorrow);
            },
            'pricesbydates.packages',
        ])
            ->where('slug', $slug)
            ->first();

        return $tour;
    }

    public function getAvailability(Request $request, $id)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        $tour = Tours::with(['boat.closeddates'])->find($id);

        if (!$tour || !$tour->boat || count($tour->boat) === 0) {
            return [];
        }

        $boatCount = count($tour->boat);
        $today = Carbon::today('Asia/Makassar')->startOfDay();

        // Build list of dates to check from query params
        $targetDates = [];
        $dateParam = $request->get('date');
        $startParam = $request->get('start');
        $endParam = $request->get('end');

        if ($dateParam) {
            // Single date mode
            $d = Carbon::parse($dateParam)->startOfDay();
            if ($d->gte($today)) {
                $targetDates[] = $d->format('Y-m-d');
            }
        } elseif ($startParam && $endParam) {
            // Date range mode
            $cursor = Carbon::parse($startParam)->startOfDay();
            $end = Carbon::parse($endParam)->startOfDay();
            while ($cursor->lte($end) && count($targetDates) < 90) {
                if ($cursor->gte($today)) {
                    $targetDates[] = $cursor->format('Y-m-d');
                }
                $cursor->addDay();
            }
        }

        // Collect per-date occupied boat IDs
        $dateOccupiedBoats = [];

        foreach ($tour->boat as $boat) {
            foreach ($boat->closeddates as $closed) {
                // Ignore soft-deleted records
                if ($closed->deleted_at !== null) {
                    continue;
                }

                $date = Carbon::parse($closed->date)->startOfDay();
                if ($date->lt($today))
                    continue;

                $dateStr = $date->format('Y-m-d');

                // If we have target dates, skip dates we don't care about
                if (!empty($targetDates) && !in_array($dateStr, $targetDates))
                    continue;

                if (!isset($dateOccupiedBoats[$dateStr])) {
                    $dateOccupiedBoats[$dateStr] = [];
                }
                $dateOccupiedBoats[$dateStr][$boat->id] = true;
            }
        }

        $dates = [];

        if (!empty($targetDates)) {
            // Return status for every requested date
            foreach ($targetDates as $dateStr) {
                $occupiedCount = isset($dateOccupiedBoats[$dateStr])
                    ? count($dateOccupiedBoats[$dateStr])
                    : 0;
                // Available if NOT all boats are occupied
                $dates[$dateStr] = ($occupiedCount >= $boatCount) ? 0 : 1;
            }
        } else {
            // No params — return only closed dates (backward compat)
            foreach ($dateOccupiedBoats as $dateStr => $occupiedBoats) {
                $dates[$dateStr] = (count($occupiedBoats) >= $boatCount) ? 0 : 1;
            }
        }

        if ($request->has('debug')) {
            return [
                'boat_count' => $boatCount,
                'boats' => $tour->boat->map(function ($b) {
                    return [
                        'id' => $b->id,
                        'name' => $b->name,
                        'raw_closed_dates' => $b->closeddates->map(function ($cd) {
                            return ['date' => $cd->date, 'type' => $cd->type, 'lead_id' => $cd->lead_id, 'qtty' => $cd->qtty, 'deleted_at' => $cd->deleted_at];
                        })
                    ];
                }),
                'occupied_by_date' => $dateOccupiedBoats,
                'results' => collect($dates)->map(function ($val, $date) use ($dateOccupiedBoats, $boatCount) {
                    return [
                        'available' => $val,
                        'occupied_count' => isset($dateOccupiedBoats[$date]) ? count($dateOccupiedBoats[$date]) : 0,
                        'boat_count' => $boatCount
                    ];
                })
            ];
        }

        ksort($dates);
        return $dates;
    }

    public function getExtras()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        return Extras::with(['ecategories', 'images', 'children.images'])
            ->whereNull('parent_id')
            ->get();
    }

    public function getExtrasCategories()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        return Ecategories::all();
    }

    // Backward-compatible alias for older route definitions.
    public function getExtraCategories()
    {
        return $this->getExtrasCategories();
    }

    public function getSharedTours()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        $tours = Tours::with(['packages', 'pricesbydates.packages', 'route'])
            ->where('classes_id', 9)
            ->get();

        return $tours->map(function ($tour) {
            $route = $tour->route;
            return [
                'id'                 => $tour->id,
                'name'               => $tour->name,
                'description'        => $tour->description,
                'slug'               => $tour->slug,
                'capacity'           => $tour->capacity,
                'size'               => $tour->size,
                'show_price'         => $tour->show_price,
                'gross_price'        => $tour->gross_price,
                'price'              => $tour->price,
                'list'               => $tour->list,
                'json'               => $tour->json,
                'route_id'           => $tour->route_id,
                'images_with_thumbs' => $tour->images_with_thumbs,
                'packages'           => $tour->packages,
                'boat_price'         => $tour->boat_price,
                'pricesbydates'      => $tour->pricesbydates,
                'route'              => $route ? [
                    'id'                    => $route->id,
                    'title'                 => $route->title,
                    'popup_title'           => $route->popup_title,
                    'popup_afternoon'       => $route->popup_afternoon,
                    'schedule_before_lunch' => $route->schedule_before_lunch,
                    'schedule_after_lunch'  => $route->schedule_after_lunch,
                ] : null,
            ];
        });
    }

    public function getSharedAvailability(Request $request)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        $start = $request->query('start');
        $end   = $request->query('end', $start);

        $tours = Tours::with(['boat.closeddates'])
            ->where('classes_id', 'like', '9%')
            ->get(['id', 'name', 'slug', 'classes_id']);

        $result = [];

        foreach ($tours as $tour) {
            $closedDates = collect($tour->boat ?? [])
                ->flatMap(fn($boat) => $boat->closeddates ?? [])
                ->filter(fn($cd) => $cd->deleted_at === null)
                ->pluck('date')
                ->map(fn($d) => substr($d, 0, 10))
                ->flip()
                ->toArray();

            $available = [];
            if ($start) {
                $cursor = new \DateTime($start);
                $endDt  = new \DateTime($end ?? $start);
                while ($cursor <= $endDt) {
                    $iso = $cursor->format('Y-m-d');
                    $available[$iso] = isset($closedDates[$iso]) ? 0 : 1;
                    $cursor->modify('+1 day');
                }
            }

            $result[] = [
                'id'        => $tour->id,
                'slug'      => $tour->slug,
                'name'      => $tour->name,
                'available' => $available,
            ];
        }

        return response()->json($result);
    }

    /**
     * GET /api/new/shared-pricing?start=YYYY-MM-DD&end=YYYY-MM-DD
     * GET /api/new/shared-pricing?date=YYYY-MM-DD
     *
     * Returns for each shared tour and each requested date:
     *   - price_per_person  (from pricesbydates or default package)
     *   - capacity          (total seats on the boat)
     *   - booked            (passengers already reserved, excl. cancelled)
     *   - available_seats   (capacity - booked)
     *   - available         (1 if seats remain, 0 if full)
     *
     * Shared tour logic: seats are sold individually — the date becomes
     * unavailable only when ALL seats are occupied.
     * Cancelled status_id = 3 (adjust if different in your setup).
     */
    public function getSharedPricing(Request $request)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        // ── Build list of dates ────────────────────────────────────────
        $dateParam  = $request->query('date');
        $startParam = $request->query('start');
        $endParam   = $request->query('end', $startParam);

        $dates = [];
        if ($dateParam) {
            $dates[] = $dateParam;
        } elseif ($startParam) {
            $cursor = new \DateTime($startParam);
            $endDt  = new \DateTime($endParam);
            while ($cursor <= $endDt && count($dates) < 180) {
                $dates[] = $cursor->format('Y-m-d');
                $cursor->modify('+1 day');
            }
        }

        if (empty($dates)) {
            return response()->json([]);
        }

        // ── Load shared tours with pricing ─────────────────────────────
        $tours = Tours::with(['packages', 'pricesbydates.packages'])
            ->where('classes_id', 9)
            ->get();

        // ── Count booked passengers per tour per date ──────────────────
        // Exclude cancelled orders (status_id = 3)
        $bookedRaw = Order::whereIn('travel_date', $dates)
            ->whereIn('tours_id', $tours->pluck('id'))
            ->where('status_id', '!=', 3)
            ->selectRaw('tours_id, travel_date, SUM(COALESCE(adults,0) + COALESCE(kids,0) + COALESCE(children,0)) as total_pax')
            ->groupBy('tours_id', 'travel_date')
            ->get();

        // Index: [tours_id][date] = total_pax
        $bookedIndex = [];
        foreach ($bookedRaw as $row) {
            $d = substr($row->travel_date, 0, 10);
            $bookedIndex[$row->tours_id][$d] = (int) $row->total_pax;
        }

        // ── Helper: get price per person for a given tour + date ───────
        $getPriceForDate = function (Tours $tour, string $date): ?float {
            // Check date-specific pricing first
            if ($tour->pricesbydates && $tour->pricesbydates->count()) {
                foreach ($tour->pricesbydates as $pbd) {
                    $start = substr($pbd->date_start ?? '', 0, 10);
                    $end   = substr($pbd->date_end   ?? '', 0, 10);
                    if ($start && $end && $date >= $start && $date <= $end) {
                        $pricelist = $pbd->packages->pricelist ?? [];
                        if (!empty($pricelist)) {
                            $sorted = collect($pricelist)->sortBy('members_count');
                            $entry  = $sorted->firstWhere('members_count', 1) ?? $sorted->first();
                            return $entry ? (float) ($entry['price'] ?? 0) : null;
                        }
                    }
                }
            }

            // Fall back to default package price
            $pricelist = $tour->packages->pricelist ?? [];
            if (!empty($pricelist)) {
                $sorted = collect($pricelist)->sortBy('members_count');
                $entry  = $sorted->firstWhere('members_count', 1) ?? $sorted->first();
                return $entry ? (float) ($entry['price'] ?? 0) : null;
            }

            // Last resort: show_price / gross_price
            return $tour->show_price ? (float) $tour->show_price
                 : ($tour->gross_price ? (float) $tour->gross_price : null);
        };

        // ── Build response ─────────────────────────────────────────────
        $result = [];

        foreach ($tours as $tour) {
            $capacity = (int) ($tour->capacity ?? 0);

            foreach ($dates as $date) {
                $booked         = $bookedIndex[$tour->id][$date] ?? 0;
                $availableSeats = max(0, $capacity - $booked);
                $price          = $getPriceForDate($tour, $date);

                $result[] = [
                    'tour_id'         => $tour->id,
                    'slug'            => $tour->slug,
                    'date'            => $date,
                    'price_per_person'=> $price,
                    'capacity'        => $capacity,
                    'booked'          => $booked,
                    'available_seats' => $availableSeats,
                    'available'       => $availableSeats > 0 ? 1 : 0,
                ];
            }
        }

        return response()->json($result);
    }

    public function getPrivateAvailability(Request $request)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        $start = $request->query('start');
        $end   = $request->query('end', $start);

        $tours = Tours::with(['boat.closeddates'])
            ->where('classes_id', 8)
            ->get(['id', 'name', 'slug', 'classes_id']);

        $result = [];

        foreach ($tours as $tour) {
            $closedDates = collect($tour->boat ?? [])
                ->flatMap(fn($boat) => $boat->closeddates ?? [])
                ->filter(fn($cd) => $cd->deleted_at === null)
                ->pluck('date')
                ->map(fn($d) => substr($d, 0, 10))
                ->flip()
                ->toArray();

            $available = [];
            if ($start) {
                $cursor = new \DateTime($start);
                $endDt  = new \DateTime($end ?? $start);
                while ($cursor <= $endDt) {
                    $iso = $cursor->format('Y-m-d');
                    $available[$iso] = isset($closedDates[$iso]) ? 0 : 1;
                    $cursor->modify('+1 day');
                }
            }

            $result[] = [
                'id'        => $tour->id,
                'slug'      => $tour->slug,
                'name'      => $tour->name,
                'available' => $available,
            ];
        }

        return response()->json($result);
    }

    public function getPrivatePricing(Request $request)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        $dateParam  = $request->query('date');
        $startParam = $request->query('start');
        $endParam   = $request->query('end', $startParam);

        $dates = [];
        if ($dateParam) {
            $dates[] = $dateParam;
        } elseif ($startParam) {
            $cursor = new \DateTime($startParam);
            $endDt  = new \DateTime($endParam);
            while ($cursor <= $endDt && count($dates) < 180) {
                $dates[] = $cursor->format('Y-m-d');
                $cursor->modify('+1 day');
            }
        }

        if (empty($dates)) {
            return response()->json([]);
        }

        $tours = Tours::with(['packages', 'pricesbydates.packages', 'boat.closeddates'])
            ->where('classes_id', 8)
            ->get();

        $result = [];

        foreach ($tours as $tour) {
            $closedSet = collect($tour->boat ?? [])
                ->flatMap(fn($boat) => $boat->closeddates ?? [])
                ->filter(fn($cd) => $cd->deleted_at === null)
                ->pluck('date')
                ->map(fn($d) => substr($d, 0, 10))
                ->flip()
                ->toArray();

            foreach ($dates as $date) {
                $price = null;

                if ($tour->pricesbydates && $tour->pricesbydates->count()) {
                    foreach ($tour->pricesbydates as $pbd) {
                        $s = substr($pbd->date_start ?? '', 0, 10);
                        $e = substr($pbd->date_end   ?? '', 0, 10);
                        if ($s && $e && $date >= $s && $date <= $e) {
                            $pricelist = $pbd->packages->pricelist ?? [];
                            if (!empty($pricelist)) {
                                $entry = collect($pricelist)->sortBy('members_count')->first();
                                $price = $entry ? (float) ($entry['price'] ?? 0) : null;
                                break;
                            }
                        }
                    }
                }

                if ($price === null) {
                    $pricelist = $tour->packages->pricelist ?? [];
                    if (!empty($pricelist)) {
                        $entry = collect($pricelist)->sortBy('members_count')->first();
                        $price = $entry ? (float) ($entry['price'] ?? 0) : null;
                    }
                }

                if ($price === null && $tour->boat_price) {
                    $price = (float) $tour->boat_price;
                }

                $result[] = [
                    'tour_id'   => $tour->id,
                    'slug'      => $tour->slug,
                    'date'      => $date,
                    'price'     => $price,
                    'available' => isset($closedSet[$date]) ? 0 : 1,
                ];
            }
        }

        return response()->json($result);
    }

    public function getRouteById($id)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        $route = Route::find($id);

        if (!$route) {
            return response()->json(null, 404);
        }

        return response()->json([
            'id'                    => $route->id,
            'title'                 => $route->title,
            'popup_title'           => $route->popup_title,
            'popup_afternoon'       => $route->popup_afternoon,
            'schedule_before_lunch' => $route->schedule_before_lunch,
            'schedule_after_lunch'  => $route->schedule_after_lunch,
        ]);
    }

    public function getTransfers()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        return Transfer::with('image')->get()->map(fn($t) => [
            'id'               => $t->id,
            'name'             => $t->name,
            'price'            => $t->price,
            'bus_price'        => $t->bus_price,
            'description'      => $t->description,
            'short_description' => $t->short_description,
            'amo_name'         => $t->amo_name,
            'image'            => $t->image_url,
        ]);
    }

    public function getCovers()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        return \Noren\Booking\Models\Cover::all();
    }
}
