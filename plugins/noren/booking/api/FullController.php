<?php

namespace Noren\Booking\Api;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Noren\Booking\Models\Category;
use Noren\Booking\Models\Rates;
use Noren\Booking\Models\Tours;
use Noren\Booking\Models\Extras;
use Noren\Booking\Models\Ecategories;
use Noren\Booking\Models\Transfer;
use Noren\Booking\Models\Route;
use Noren\Booking\Models\Cover;
use Noren\Booking\Models\Restaurant;
use System\Models\File as SystemFile;
use Noren\Booking\Models\Order;
use Noren\Booking\Models\Boat;
use Noren\Bluuu\Models\Settings;

class FullController extends Controller
{
    public function getRestaurants()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        $restaurants = Restaurant::with('images')->get();

        return $restaurants->map(fn($r) => [
            'id' => $r->id,
            'name' => $r->name,
            'description' => $r->description,
            'menu' => $r->menu,
            'image' => $r->image,
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
            'id' => $restaurant->id,
            'name' => $restaurant->name,
            'description' => $restaurant->description,
            'menu' => $restaurant->menu,
            'image' => $restaurant->image,
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

    public function getPrivateTours()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        $tours = Tours::with(['packages', 'pricesbydates.packages', 'category', 'boat'])
            ->whereIn('classes_id', [8])
            ->orderBy('sort_order')
            ->get();

        return $tours->map(function ($tour) {
            return [
                'id' => $tour->id,
                'name' => $tour->name,
                'description' => $tour->description,
                'slug' => $tour->slug,
                'capacity' => $tour->capacity,
                'size' => $tour->size,
                'partner' => (bool) $tour->partner,
                'list' => $tour->list,
                'images_with_thumbs' => $tour->images_with_thumbs,
                'packages' => $tour->packages,
                'boat_price' => $tour->boat_price,
                'pricesbydates' => $tour->pricesbydates,
                'status' => $tour->status ?: 'ready',
                'fleet_size' => $tour->boat->count(),
                'categories' => $tour->category->filter(fn($c) => $c->status == 1)->map(fn($c) => ['id' => $c->id, 'name' => $c->name])->values(),
                'boatFeatures' => $tour->props,
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

        // If it's a shared tour (filtering by slug or checking class 9)
        if ($tour && (str_contains($tour->slug, 'shared') || $tour->classes_id == 9)) {
            $tour->boat_price = 0;
            if ($tour->pricesbydates) {
                foreach ($tour->pricesbydates as $pbd) {
                    $pbd->boat_price = 0;
                }
            }
        }

        return $tour;
    }

    public function getPrivateAvailability(Request $request, $id)
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
        // Dates blocked by a "closed" boat (boat.closed = true)
        $closedBoatDates = [];
        // Dates blocked by blocker boats (87/88) with real records (type != 4)
        $blockerDates = [];

        foreach ($tour->boat as $boat) {
            $isClosedBoat = !empty($boat->closed);
            $isBlockerBoat = !empty($boat->closed);
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

                // Blocker boat (87/88) with real record (not cron) blocks the whole tour
                if ($isBlockerBoat && (int) $closed->type !== 4) {
                    $blockerDates[$dateStr] = true;
                    continue;
                }

                // Closed boat with any record blocks the whole tour for that date
                if ($isClosedBoat) {
                    $closedBoatDates[$dateStr] = true;
                    continue;
                }

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
                if (isset($blockerDates[$dateStr]) || isset($closedBoatDates[$dateStr])) {
                    $dates[$dateStr] = 0;
                    continue;
                }
                $occupiedCount = isset($dateOccupiedBoats[$dateStr])
                    ? count($dateOccupiedBoats[$dateStr])
                    : 0;
                // Available if NOT all boats are occupied
                $dates[$dateStr] = ($occupiedCount >= $boatCount) ? 0 : 1;
            }
        } else {
            // No params — return only closed dates (backward compat)
            foreach ($blockerDates as $dateStr => $_) {
                $dates[$dateStr] = 0;
            }
            foreach ($closedBoatDates as $dateStr => $_) {
                $dates[$dateStr] = 0;
            }
            foreach ($dateOccupiedBoats as $dateStr => $occupiedBoats) {
                if (!isset($dates[$dateStr])) {
                    $dates[$dateStr] = (\count($occupiedBoats) >= $boatCount) ? 0 : 1;
                }
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

        $tours = Tours::with(['packages', 'pricesbydates.packages', 'route', 'route.restaurant', 'route.restaurant.images', 'boat', 'badge'])
            ->whereIn('classes_id', [9])
            ->orderBy('sort_order')
            ->get();

        return $tours->map(function ($tour) {
            $route = $tour->route;
            $restaurant = $route?->restaurant;
            $badge = $tour->badge;
            return [
                'id' => $tour->id,
                'name' => $tour->name,
                'description' => $tour->description,
                'slug' => $tour->slug,
                'capacity' => $tour->capacity,
                'size' => $tour->size,
                'show_price' => $tour->show_price,
                'gross_price' => $tour->gross_price,
                'price' => $tour->price,
                'list' => $tour->list,
                'json' => $tour->json,
                'route_id' => $tour->route_id,
                'images_with_thumbs' => $tour->images_with_thumbs,
                'packages' => $tour->packages,
                'boat_price' => 0,
                'pricesbydates' => $tour->pricesbydates,
                'status' => $tour->status ?: 'ready',
                'fleet_size' => $tour->boat->count(),
                'badge_name' => $badge?->name ?: null,
                'badge_color' => $badge?->color ?: null,
                'props' => $tour->props ?: null,
                'route' => $route ? [
                    'id' => $route->id,
                    'title' => $route->title,
                    'popup_title' => $route->popup_title,
                    'popup_afternoon' => $route->popup_afternoon,
                    'schedule_before_lunch' => $route->schedule_before_lunch,
                    'schedule_after_lunch' => $route->schedule_after_lunch,
                    'restaurant' => $restaurant ? [
                        'id' => $restaurant->id,
                        'name' => $restaurant->name,
                        'description' => $restaurant->description,
                        'menu' => $restaurant->menu,
                        'image' => $restaurant->image,
                        'images_with_thumbs' => $restaurant->images_with_thumbs,
                    ] : null,
                ] : null,
            ];
        });
    }

    public function getSharedAvailability(Request $request, $id)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        // ── Build list of requested dates ──────────────────────────────
        $dateParam = $request->query('date');
        $startParam = $request->query('start');
        $endParam = $request->query('end', $startParam);
        $today = Carbon::today('Asia/Makassar')->format('Y-m-d');
        $explicitRange = false; // true when caller specified a date range

        $dates = [];
        if ($dateParam) {
            $dates[] = $dateParam;
            $explicitRange = true;
        } elseif ($startParam) {
            $cursor = new \DateTime($startParam);
            $endDt = new \DateTime($endParam);
            while ($cursor <= $endDt && count($dates) < 180) {
                $dates[] = $cursor->format('Y-m-d');
                $cursor->modify('+1 day');
            }
            $explicitRange = true;
        } else {
            // No params → default to current month
            $cursor = Carbon::today('Asia/Makassar')->startOfMonth();
            $end = Carbon::today('Asia/Makassar')->endOfMonth();
            while ($cursor->lte($end)) {
                $dates[] = $cursor->format('Y-m-d');
                $cursor->addDay();
            }
        }

        // ── Load shared tour with boats and closeddates ────────────────
        $tours = Tours::with(['boat.closeddates'])
            ->where('classes_id', 9)
            ->where('id', $id)
            ->get();

        // ── Build per-boat closeddates index ───────────────────────────
        // boatIndex[boat_id] = ['capacity' => int, 'dates' => [date => ['blocked' => bool, 'qtty' => int]]]
        // Mirrors ToursController::calculateTourAvailability per-boat logic:
        //   - boat.closed + any record → blocked
        //   - type null/empty/2/3/4 → blocked
        //   - type 1 → reduce by qtty
        //   - no records → full capacity available
        $boatIndex = [];
        foreach ($tours as $tour) {
            foreach ($tour->boat as $boat) {
                $boatIndex[$boat->id] = [
                    'capacity' => (int) ($boat->capacity ?? 0),
                    'dates' => [],
                ];
                $isClosedBoat = !empty($boat->closed);

                foreach ($boat->closeddates as $cd) {
                    if ($cd->deleted_at !== null) {
                        continue;
                    }
                    $dateStr = substr($cd->date, 0, 10);
                    if ($dateStr < $today) {
                        continue;
                    }
                    if (!isset($boatIndex[$boat->id]['dates'][$dateStr])) {
                        $boatIndex[$boat->id]['dates'][$dateStr] = ['blocked' => false, 'qtty' => 0];
                    }
                    if ($isClosedBoat) {
                        $boatIndex[$boat->id]['dates'][$dateStr]['blocked'] = true;
                        if ((int) $cd->type !== 4) {
                            $boatIndex[$boat->id]['dates'][$dateStr]['real_record'] = true;
                        }
                        continue;
                    }
                    $type = $cd->type;
                    if ($type === null || $type === '' || in_array((int) $type, [2, 3])) {
                        $boatIndex[$boat->id]['dates'][$dateStr]['blocked'] = true;
                        $boatIndex[$boat->id]['dates'][$dateStr]['real_record'] = true;
                    } elseif ((int) $type === 4) {
                        $boatIndex[$boat->id]['dates'][$dateStr]['blocked'] = true;
                    } elseif ((int) $type === 1) {
                        $boatIndex[$boat->id]['dates'][$dateStr]['qtty'] += (int) ($cd->qtty ?? 0);
                        $boatIndex[$boat->id]['dates'][$dateStr]['real_record'] = true;
                    }
                }
            }
        }

        // ── Helper: availability for one date — picks the best boat ──────
        // Returns available_seats and boat_id of the boat with most free seats.
        $calcDate = function (array $boats, string $date) use ($boatIndex): array {
            $totalAvailable = 0;
            $firstBoatId    = null;

            foreach ($boats as $boat) {
                $boatId   = $boat->id;
                if ($firstBoatId === null) {
                    $firstBoatId = $boatId;
                }

                $capacity = $boatIndex[$boatId]['capacity'] ?? 0;
                $rec      = $boatIndex[$boatId]['dates'][$date] ?? null;

                if ($rec === null) {
                    $avail = $capacity;
                } elseif ($rec['blocked']) {
                    $avail = 0;
                } else {
                    $booked = (int) ($rec['qtty'] ?? 0);
                    $avail  = max(0, $capacity - $booked);
                }

                $totalAvailable += $avail;
            }

            return [
                'available_seats' => $totalAvailable,
                'available'       => $totalAvailable > 0 ? 1 : 0,
                'boat_id'         => $firstBoatId,
            ];
        };

        // ── Build response ─────────────────────────────────────────────
        $result = [];
        $datesSet = array_flip($dates);

        foreach ($tours as $tour) {
            $boats = $tour->boat->all();
            // ID лодок тура с closed=true — их не-крон записи блокируют весь тур
            $blockerBoatIds = $tour->boat->filter(fn($b) => !empty($b->closed))->pluck('id')->toArray();

            // Requested date range
            foreach ($dates as $date) {
                // Если у closed=true лодки тура есть не-крон запись на эту дату — тур закрыт
                $isBlocked = false;
                foreach ($blockerBoatIds as $bId) {
                    if (!empty($boatIndex[$bId]['dates'][$date]['real_record'])) {
                        $isBlocked = true;
                        break;
                    }
                }
                if ($isBlocked) {
                    $result[] = ['tour_id' => $tour->id, 'date' => $date, 'available_seats' => 0, 'available' => 0, 'boat_id' => null];
                    continue;
                }
                $avail = $calcDate($boats, $date);
                $result[] = array_merge(['tour_id' => $tour->id, 'date' => $date], $avail);
            }

            // Extra blocked/booked dates outside the range (only when no explicit range)
            if (!$explicitRange) {
                $extraDates = [];
                foreach ($tour->boat as $boat) {
                    foreach (array_keys($boatIndex[$boat->id]['dates']) as $dateStr) {
                        if (!isset($datesSet[$dateStr])) {
                            $extraDates[$dateStr] = true;
                        }
                    }
                }
                foreach (array_keys($extraDates) as $dateStr) {
                    $avail = $calcDate($boats, $dateStr);
                    // Skip fully open dates outside the range
                    if ($avail['booked'] === 0 && $avail['available_seats'] === $avail['capacity']) {
                        continue;
                    }
                    $result[] = array_merge(['tour_id' => $tour->id, 'date' => $dateStr], $avail);
                }
            }
        }

        // Sort by date
        usort($result, fn($a, $b) => strcmp($a['date'], $b['date']));

        return response()->json($result);
    }

    public function getPrivateRoutes(Request $request)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        return $this->getRoutesForClass(8);
    }

    public function getSharedRoutes(Request $request)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        return $this->getRoutesForClass(9);
    }

    private function getRoutesForClass(int $classesId)
    {
        $routes = Route::with([
            'ecategories.extras' => function ($q) {
                $q->whereNull('parent_id');
            },
            'ecategories.extras.children.images',
            'ecategories.extras.images',
            'photos',
            'restaurant.images',
        ])->where('classes_id', $classesId)->orderBy('sort_order')->get();

        $routeIds = $routes->pluck('id')->toArray();
        $maps = SystemFile::where('attachment_type', 'Noren\Booking\Models\Route')
            ->whereIn('attachment_id', $routeIds)
            ->where('field', 'map')
            ->get()
            ->keyBy('attachment_id');

        return $routes->map(function ($route) use ($maps) {
            $payload = $route->toArray();

            $mapFile = $maps->get($route->id);
            $payload['map'] = $mapFile ? $mapFile->getPath() : null;

            $payload['photos'] = $route->photos->map(fn($p) => [
                'path'        => $p->getPath(),
                'thumb'       => $p->getThumb(800, 600, ['mode' => 'crop', 'extension' => 'webp', 'quality' => 80]),
                'thumb_small' => $p->getThumb(400, 300, ['mode' => 'crop', 'extension' => 'webp', 'quality' => 75]),
            ])->toArray();

            $payload['tour_images'] = [];

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

    public function getRouteById($id)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        $route = Route::with(['restaurant', 'restaurant.images'])->find($id);

        if (!$route) {
            return response()->json(null, 404);
        }

        $mapFile = SystemFile::where('attachment_type', 'Noren\Booking\Models\Route')
            ->where('attachment_id', $id)
            ->where('field', 'map')
            ->first();

        $restaurant = $route->restaurant;

        return response()->json([
            'id' => $route->id,
            'title' => $route->title,
            'popup_title' => $route->popup_title,
            'popup_afternoon' => $route->popup_afternoon,
            'schedule_before_lunch' => $route->schedule_before_lunch,
            'schedule_after_lunch' => $route->schedule_after_lunch,
            'map' => $mapFile ? $mapFile->getPath() : null,
            'restaurant' => $restaurant ? [
                'id' => $restaurant->id,
                'name' => $restaurant->name,
                'description' => $restaurant->description,
                'menu' => $restaurant->menu,
                'image' => $restaurant->image,
                'images_with_thumbs' => $restaurant->images_with_thumbs,
            ] : null,
        ]);
    }

    public function getPrivateTransfers(Request $request)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        return Transfer::with('image')
            ->where(function ($q) {
                $q->whereNull('classes_id')->orWhere('classes_id', 8);
            })
            ->get()->map(fn($t) => $this->formatTransfer($t));
    }

    public function getSharedTransfers(Request $request)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        return Transfer::with('image')
            ->where(function ($q) {
                $q->whereNull('classes_id')->orWhere('classes_id', 9);
            })
            ->get()->map(fn($t) => $this->formatTransfer($t));
    }

    public function getTransfers(Request $request)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        $classesId = $request->query('classes_id');

        $query = Transfer::with('image');
        if ($classesId !== null) {
            $query->where(function ($q) use ($classesId) {
                $q->whereNull('classes_id')->orWhere('classes_id', (int) $classesId);
            });
        }

        return $query->get()->map(fn($t) => $this->formatTransfer($t));
    }

    private function formatTransfer($t): array
    {
        return [
            'id'                => $t->id,
            'name'              => $t->name,
            'price'             => $t->price,
            'bus_price'         => $t->bus_price,
            'classes_id'        => $t->classes_id,
            'description'       => $t->description,
            'short_description' => $t->short_description,
            'amo_name'          => $t->amo_name,
            'image'             => $t->image_url,
            'image_small'       => $t->image_url_small,
        ];
    }

    public function getPrivateCovers(Request $request)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        return \Noren\Booking\Models\Cover::where(function ($q) {
            $q->whereNull('classes_id')->orWhere('classes_id', 8);
        })->get();
    }

    public function getSharedCovers(Request $request)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        return \Noren\Booking\Models\Cover::where(function ($q) {
            $q->whereNull('classes_id')->orWhere('classes_id', 9);
        })->get();
    }

    public function getCovers(Request $request)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        $classesId = $request->query('classes_id');

        $query = \Noren\Booking\Models\Cover::query();
        if ($classesId !== null) {
            $query->where(function ($q) use ($classesId) {
                $q->whereNull('classes_id')->orWhere('classes_id', (int) $classesId);
            });
        }

        return $query->get();
    }

    private function resolveBlogImages($post, int $thumbW = 800, int $thumbH = 450): array
    {
        $smallW = (int) round($thumbW / 2);
        $smallH = (int) round($thumbH / 2);
        try {
            return $post->images->sortBy('sort_order')->map(function ($img) use ($thumbW, $thumbH, $smallW, $smallH) {
                $url = $img->path ?? $img->getPath();
                try {
                    $thumb = $img->getThumb($thumbW, $thumbH, ['mode' => 'crop', 'extension' => 'webp', 'quality' => 80]);
                } catch (\Throwable $e) {
                    $thumb = $url;
                }
                try {
                    $thumbSmall = $img->getThumb($smallW, $smallH, ['mode' => 'crop', 'extension' => 'webp', 'quality' => 75]);
                } catch (\Throwable $e) {
                    $thumbSmall = $thumb;
                }
                return ['id' => $img->id, 'url' => $url, 'thumb' => $thumb, 'thumb_small' => $thumbSmall];
            })->values()->toArray();
        } catch (\Throwable $e) {
            return [];
        }
    }

    public function getBlog()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        $posts = \Noren\Bluuu\Models\Blog::with('images')->orderBy('created_at', 'desc')->get();

        return response()->json($posts->map(function ($p) {
            $images = $this->resolveBlogImages($p);
            $cover       = $images[0]['url']   ?? null;
            $coverThumb  = $images[0]['thumb'] ?? null;

            return [
                'id'                => $p->id,
                'title'             => $p->title,
                'description'       => $p->description,
                'slug'              => $p->slug,
                'created_at'        => $p->created_at,
                'cover'             => $cover,
                'cover_thumb'       => $coverThumb,
                'cover_thumb_small' => $images[0]['thumb_small'] ?? null,
            ];
        }));
    }

    public function getBlogPost($slug)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        $post = \Noren\Bluuu\Models\Blog::with('images')->where('slug', $slug)->first();

        if (!$post) {
            return response()->json(null, 404);
        }

        $data = $post->toArray();
        $images = $this->resolveBlogImages($post, 1200, 675);

        $data['images']      = $images;
        $data['cover']       = $images[0]['url']   ?? null;
        $data['cover_thumb'] = $images[0]['thumb'] ?? null;

        return response()->json($data);
    }

    public function getFaq()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        $faqs = \Noren\Bluuu\Models\Faq::get();

        return response()->json($faqs->map(fn($faq) => [
            'id' => $faq->id,
            'question' => $faq->question,
            'answer' => $faq->answer,
        ]));
    }

    public function getGallery()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        try {
            $items = \Noren\Bluuu\Models\Gallery::with('images')->get();

            // Flatten: each gallery record may have many images
            $flat = $items->flatMap(fn($item) =>
                $item->images->map(fn($img) => [
                    'id'          => $img->id,
                    'title'       => $item->title,
                    'url'         => $img->getPath(),
                    'thumb'       => $img->getThumb(800, 600, ['mode' => 'crop', 'extension' => 'webp', 'quality' => 80]),
                    'thumb_small' => $img->getThumb(400, 300, ['mode' => 'crop', 'extension' => 'webp', 'quality' => 75]),
                ])
            )->filter(fn($img) => !empty($img['url']))->values();

            return response()->json($flat);
        } catch (\Throwable $e) {
            return response()->json([]);
        }
    }

    private function getBluuuSettingsData(): array
    {
        $settings = Settings::instance();
        $rawValue = $settings->value;
        $value = is_array($rawValue) ? $rawValue : [];

        $rules = [];
        if (is_array($settings->rules)) {
            $rules = $settings->rules;
        } elseif (isset($value['rules']) && is_array($value['rules'])) {
            $rules = $value['rules'];
        }

        $contacts = [];
        if (is_array($settings->contacts)) {
            $contacts = $settings->contacts;
        } elseif (isset($value['contacts']) && is_array($value['contacts'])) {
            $contacts = $value['contacts'];
        }

        if (empty($value)) {
            $value = [
                'rules' => $rules,
                'contacts' => $contacts,
            ];
        }

        return [
            'rules' => $rules,
            'contacts' => $contacts,
            'id' => $settings->id,
            'item' => $settings->item,
            'value' => $value,
            'site_id' => $settings->site_id,
            'site_root_id' => $settings->site_root_id,
        ];
    }

    public function getSettings()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        return response()->json($this->getBluuuSettingsData());
    }

    public function getContacts()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        $settings = $this->getBluuuSettingsData();

        return response()->json([
            'contacts' => $settings['contacts'],
        ]);
    }

    public function getCategories()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        $categories = Category::where('status', true)->get();

        return response()->json(
            $categories->map(fn($c) => [
                'id'   => $c->id,
                'name' => $c->name,
                'slug' => $c->slug,
            ])->values()
        );
    }

    public function getRules()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        $rules = \Noren\Bluuu\Models\Rules::instance();

        return response()->json([
            'payment' => $rules->payment,
            'return' => $rules->{'return'},
            'privacy' => $rules->privacy,
            'health' => $rules->health,
            'release' => $rules->release,
        ]);
    }


}
