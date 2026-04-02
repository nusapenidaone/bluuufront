<?php

namespace Noren\Booking\Viator;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Carbon\Carbon;
use Cache;
use Log;
use Noren\Booking\Models\Tours;
use Noren\Booking\Models\Order;

/**
 * Viator Supplier API — Operator-Hosted Endpoints (v2.0)
 *
 * Authentication: X-API-Key header
 *   Key:  857de21c4d0a349485fd2702f3ea5e681315fa9688d12c3032af8b2336d7588b
 *   Env:  VIATOR_API_KEY  (fallback — ключ выше)
 *         VIATOR_SUPPLIER_ID  (ID поставщика из Viator Supplier Portal)
 *
 * Availability logic:
 *   Private (classes_id=8) — тур доступен если НЕ все лодки заняты
 *   Shared  (classes_id=9) — возвращает макс. свободных мест среди лодок
 *     type null/''  or in [2,3,4] → лодка полностью заблокирована
 *     type 1                      → частичное бронирование (qtty мест занято)
 *
 * Endpoints:
 *   POST /viator/tourlist                   — список туров (inventory)
 *   POST /viator/v2/availability/check      — доступность на конкретную дату
 *   POST /viator/v2/availability/calendar   — доступность на диапазон дат (макс. 92 дня)
 *   POST /viator/v2/reserve                 — резерв мест (TTL 20 мин, через Cache)
 *   POST /viator/v2/booking                 — создание подтверждённого заказа
 *   POST /viator/v2/booking-amendment       — изменение заказа
 *   POST /viator/v2/booking-cancellation    — отмена заказа (status_id=3)
 *   POST /viator/v2/redemption              — проверка статуса использования билета
 */
class ViatorController extends Controller
{
    // ─── Auth ────────────────────────────────────────────────────────────────

    private function authenticate(Request $request): bool
    {
        $apiKey = env('VIATOR_API_KEY', '857de21c4d0a349485fd2702f3ea5e681315fa9688d12c3032af8b2336d7588b');
        return !empty($apiKey) && $request->header('X-API-Key') === $apiKey;
    }

    private function unauthorized()
    {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    private function getSupplierId(): int
    {
        return (int) env('VIATOR_SUPPLIER_ID', 0);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Calculate available seats for a tour on a given date.
     * Mirrors FullController::getPrivateAvailability / getSharedAvailability logic.
     * Uses already-eager-loaded boat.closeddates — no extra queries.
     */
    private function calculateAvailability(Tours $tour, string $date): int
    {
        if (!$tour->boat || $tour->boat->isEmpty()) {
            return 0;
        }

        $isShared = $tour->classes_id == 9;

        // "Closed" boats: any closeddate record for this date blocks the whole tour
        foreach ($tour->boat as $boat) {
            if (!empty($boat->closed)) {
                foreach ($boat->closeddates as $cd) {
                    if ($cd->deleted_at !== null) continue;
                    if (substr($cd->date, 0, 10) === $date) {
                        return 0;
                    }
                }
            }
        }

        if ($isShared) {
            // Shared: pick the boat with the most free seats (mirrors getSharedAvailability)
            $best = 0;
            foreach ($tour->boat as $boat) {
                $capacity = (int) ($boat->capacity ?? 0);
                $records  = $boat->closeddates->filter(fn($cd) =>
                    $cd->deleted_at === null && substr($cd->date, 0, 10) === $date
                );

                if ($records->isEmpty()) {
                    $best = max($best, $capacity);
                    continue;
                }

                $blocked = $records->first(function ($cd) {
                    $type = $cd->type;
                    return $type === null || $type === '' || in_array((int) $type, [2, 3, 4]);
                });

                if ($blocked) continue; // boat fully blocked

                $used  = (int) $records->where('type', 1)->sum('qtty');
                $avail = max(0, $capacity - $used);
                $best  = max($best, $avail);
            }
            return $best;
        } else {
            // Private: available if NOT all boats are occupied (mirrors getPrivateAvailability)
            $totalBoats    = $tour->boat->count();
            $occupiedCount = 0;

            foreach ($tour->boat as $boat) {
                $hasRecord = $boat->closeddates->first(fn($cd) =>
                    $cd->deleted_at === null && substr($cd->date, 0, 10) === $date
                );
                if ($hasRecord) {
                    $occupiedCount++;
                }
            }

            if ($occupiedCount >= $totalBoats) {
                return 0;
            }

            return (int) ($tour->capacity ?? 0);
        }
    }

    /**
     * Get total price for a given date and guest count.
     *
     * Private (classes_id=8): pricelist tier (by members) + boat_price  — цена за лодку
     * Shared  (classes_id=9): pricelist tier (by members)               — цена за гостя
     *
     * Mirrors ChatbotController::getQuote() pricing logic.
     */
    private function getPrice(Tours $tour, Carbon $date, int $members): int
    {
        $isPrivate     = $tour->classes_id == 8;
        $boatPriceAdd  = $isPrivate ? (int) ($tour->boat_price ?? 0) : 0;
        $dateStr       = $date->format('Y-m-d');

        // Seasonal override: find matching pricesbydates entry
        $pricelist = $tour->packages ? ($tour->packages->pricelist ?? []) : [];

        if ($tour->pricesbydates->isNotEmpty()) {
            $seasonal = $tour->pricesbydates->first(fn($pbd) =>
                $dateStr >= substr($pbd->date_start, 0, 10) &&
                $dateStr <= substr($pbd->date_end, 0, 10)
            );
            if ($seasonal && $seasonal->packages?->pricelist) {
                $pricelist = $seasonal->packages->pricelist;
            }
        }

        if (empty($pricelist)) {
            return $boatPriceAdd;
        }

        // Exact match by members_count
        $entry     = collect($pricelist)->firstWhere('members_count', $members);
        $tierPrice = (int) ($entry['price'] ?? 0);

        return $tierPrice + $boatPriceAdd;
    }

    /**
     * Resolve a tour by productOptionId (slug or numeric id).
     */
    private function findTour(string $optionId)
    {
        return Tours::with(['boat.closeddates', 'packages', 'pricesbydates.packages'])
            ->where('slug', $optionId)
            ->orWhere('id', is_numeric($optionId) ? (int) $optionId : -1)
            ->first();
    }

    // ─── Endpoints ───────────────────────────────────────────────────────────

    /**
     * POST /viator/tourlist
     */
    public function tourList(Request $request)
    {
        if (!$this->authenticate($request)) {
            return $this->unauthorized();
        }

        $tours = Tours::with(['boat', 'packages', 'pricesbydates.packages'], 'route')
            ->whereIn('classes_id', [8, 9])
            ->orderBy('sort_order')
            ->get();

        $products = $tours->map(fn($tour) => [
            'supplierProductCode' => (string) $tour->id,
            'supplierOptionCode'  => $tour->slug,
            'productOptionId'     => $tour->slug,
            'name'                => $tour->name,
            'type'                => $tour->classes_id == 9 ? 'SHARED' : 'PRIVATE',
            'capacity'            => $tour->capacity,
            'duration'            => $tour->classes_id == 8 ? 8 : $tour->duration,
            'active'              => true,
        ]);

        return response()->json([
            'supplierId' => $this->getSupplierId(),
            'products'   => $products,
        ]);
    }

    /**
     * POST /viator/v2/availability/check
     */
    public function availabilityCheck(Request $request)
    {
        if (!$this->authenticate($request)) {
            return $this->unauthorized();
        }

        $data           = $request->all();
        $travelDate     = $data['travelDate'] ?? null;
        $totalTravelers = (int) ($data['totalTravelers'] ?? 1);
        $productOptions = $data['productOptions'] ?? [];

        if (!$travelDate || empty($productOptions)) {
            return response()->json(['error' => 'Missing required fields: travelDate, productOptions'], 400);
        }

        $dateStr    = Carbon::parse($travelDate)->format('Y-m-d');
        $carbonDate = Carbon::parse($travelDate)->startOfDay();
        $results    = [];

        foreach ($productOptions as $option) {
            $optionId = $option['productOptionId'] ?? null;
            if (!$optionId) continue;

            $tour = $this->findTour($optionId);

            if (!$tour) {
                $results[] = [
                    'productOptionId'   => $optionId,
                    'status'            => 'UNAVAILABLE',
                    'unavailableReason' => 'PRODUCT_NOT_FOUND',
                ];
                continue;
            }

            $available   = $this->calculateAvailability($tour, $dateStr);
            $isAvailable = $available >= $totalTravelers;
            $price       = $this->getPrice($tour, $carbonDate, $totalTravelers);

            $result = [
                'productOptionId' => $optionId,
                'status'          => $isAvailable ? 'AVAILABLE' : 'UNAVAILABLE',
                'capacity'        => [
                    'type'      => 'LIMITED',
                    'remaining' => $available,
                ],
                'bookingCutoff'   => Carbon::parse($travelDate)
                    ->subDay()->setTime(23, 59, 59)
                    ->toIso8601String(),
            ];

            if ($isAvailable) {
                $isPrivate = $tour->classes_id == 8;
                $result['price'] = $isPrivate
                    ? [
                        'type'        => 'TOTAL_PRICE',
                        'retailPrice' => $price,
                        'netPrice'    => $price,
                        'currency'    => 'IDR',
                    ]
                    : [
                        'type'     => 'PER_PERSON_PRICE',
                        'types'    => [
                            ['type' => 'ADULT',  'retailPrice' => $price, 'netPrice' => $price],
                            ['type' => 'CHILD',  'retailPrice' => $price, 'netPrice' => $price],
                            ['type' => 'INFANT', 'retailPrice' => 0,      'netPrice' => 0],
                        ],
                        'currency' => 'IDR',
                    ];
                $result['startTimes'] = $option['startTimes'] ?? ['08:00'];
            }

            $results[] = $result;
        }

        return response()->json([
            'supplierId'     => $this->getSupplierId(),
            'travelDate'     => $travelDate,
            'productOptions' => $results,
        ]);
    }

    /**
     * POST /viator/v2/availability/calendar
     */
    public function availabilityCalendar(Request $request)
    {
        if (!$this->authenticate($request)) {
            return $this->unauthorized();
        }

        $data             = $request->all();
        $productOptionIds = $data['productOptionIds'] ?? [];
        $startDate        = $data['startDate'] ?? null;
        $endDate          = $data['endDate'] ?? null;

        if (empty($productOptionIds) || !$startDate || !$endDate) {
            return response()->json(['error' => 'Missing required fields: productOptionIds, startDate, endDate'], 400);
        }

        $start = Carbon::parse($startDate)->startOfDay();
        $end   = Carbon::parse($endDate)->startOfDay();

        if ($end->diffInDays($start) > 92) {
            return response()->json(['error' => 'Date range must not exceed 92 days'], 400);
        }

        $results = [];

        foreach ($productOptionIds as $optionId) {
            $tour = $this->findTour($optionId);
            if (!$tour) continue;

            $calendar = [];
            $current  = $start->copy();

            while ($current->lte($end)) {
                $dateStr   = $current->format('Y-m-d');
                $available = $this->calculateAvailability($tour, $dateStr);
                $price     = $this->getPrice($tour, $current->copy(), 1);

                $isPrivate  = $tour->classes_id == 8;
                $calendar[] = [
                    'date'      => $dateStr,
                    'available' => $available > 0,
                    'vacancies' => $available,
                    'price'     => $isPrivate
                        ? ['type' => 'TOTAL_PRICE',      'amount' => $price, 'currency' => 'IDR']
                        : ['type' => 'PER_PERSON_PRICE', 'amount' => $price, 'currency' => 'IDR'],
                ];

                $current->addDay();
            }

            $results[] = [
                'productOptionId' => $optionId,
                'calendar'        => $calendar,
            ];
        }

        return response()->json([
            'supplierId' => $this->getSupplierId(),
            'startDate'  => $startDate,
            'endDate'    => $endDate,
            'products'   => $results,
        ]);
    }

    /**
     * POST /viator/v2/reserve
     */
    public function reserve(Request $request)
    {
        if (!$this->authenticate($request)) {
            return $this->unauthorized();
        }

        $data           = $request->all();
        $optionId       = $data['productOptionId'] ?? null;
        $travelDate     = $data['travelDate'] ?? null;
        $totalTravelers = (int) ($data['totalTravelers'] ?? 1);
        $tickets        = $data['tickets'] ?? [];

        if (!$optionId || !$travelDate) {
            return response()->json(['error' => 'Missing required fields: productOptionId, travelDate'], 400);
        }

        $dateStr = Carbon::parse($travelDate)->format('Y-m-d');

        $tour = $this->findTour($optionId);
        if (!$tour) {
            return response()->json(['status' => 'NOT_RESERVED', 'reason' => 'PRODUCT_NOT_FOUND'], 404);
        }

        $available = $this->calculateAvailability($tour, $dateStr);
        if ($available < $totalTravelers) {
            return response()->json([
                'status'    => 'NOT_RESERVED',
                'reason'    => 'INSUFFICIENT_AVAILABILITY',
                'available' => $available,
            ]);
        }

        $adults   = 0;
        $kids     = 0;
        $children = 0;

        foreach ($tickets as $ticket) {
            $qty  = (int) ($ticket['quantity'] ?? 1);
            $type = strtoupper($ticket['type'] ?? 'ADULT');
            if (in_array($type, ['ADULT', 'SENIOR'])) {
                $adults += $qty;
            } elseif ($type === 'INFANT') {
                $children += $qty;
            } else {
                $kids += $qty;
            }
        }

        if (!$adults && !$kids) {
            $adults = $totalTravelers;
        }

        $carbonDate     = Carbon::parse($travelDate)->startOfDay();
        $pricePerPerson = $this->getPrice($tour, $carbonDate, $totalTravelers);
        $totalPrice     = $pricePerPerson * $totalTravelers;

        $reference  = 'viator_hold_' . uniqid('', true);
        $expiration = Carbon::now()->addMinutes(20);

        Cache::put($reference, [
            'tour_id'          => $tour->id,
            'option_id'        => $optionId,
            'travel_date'      => $dateStr,
            'total_travelers'  => $totalTravelers,
            'adults'           => $adults,
            'kids'             => $kids,
            'children'         => $children,
            'price_per_person' => $pricePerPerson,
            'total_price'      => $totalPrice,
            'start_time'       => $data['startTime'] ?? '08:00',
            'expires_at'       => $expiration->toIso8601String(),
        ], 20);

        return response()->json([
            'status'     => 'RESERVED',
            'reference'  => $reference,
            'expiration' => $expiration->toIso8601String(),
            'price'      => [
                'type'           => 'PER_PERSON_PRICE',
                'pricePerPerson' => $pricePerPerson,
                'total'          => $totalPrice,
                'currency'       => 'IDR',
            ],
        ]);
    }

    /**
     * POST /viator/v2/booking
     */
    public function booking(Request $request)
    {
        if (!$this->authenticate($request)) {
            return $this->unauthorized();
        }

        $data      = $request->all();
        $holdRef   = $data['availabilityHoldReference'] ?? null;
        $viatorRef = $data['viatorConfirmationNumber'] ?? null;
        $optionId  = $data['productOptionId'] ?? null;

        if (!$optionId) {
            return response()->json(['error' => 'Missing productOptionId'], 400);
        }

        $holdData   = $holdRef ? Cache::get($holdRef) : null;
        $travelDate = $data['travelDate'] ?? ($holdData['travel_date'] ?? null);

        if (!$travelDate) {
            return response()->json(['error' => 'Missing travelDate'], 400);
        }

        $tour = Tours::with(['boat.closeddates'])
            ->where('slug', $optionId)
            ->orWhere('id', is_numeric($optionId) ? (int) $optionId : -1)
            ->first();

        if (!$tour) {
            return response()->json(['status' => 'FAILED', 'error' => 'Tour not found'], 404);
        }

        $travelers = $data['travelerMix'] ?? [];
        $adults    = 0;
        $kids      = 0;
        $children  = 0;

        foreach ($travelers as $traveler) {
            $type = strtoupper($traveler['type'] ?? 'ADULT');
            if (in_array($type, ['ADULT', 'SENIOR'])) {
                $adults++;
            } elseif ($type === 'INFANT') {
                $children++;
            } else {
                $kids++;
            }
        }

        if (!$adults && !$kids) {
            $adults   = $holdData['adults'] ?? 1;
            $kids     = $holdData['kids'] ?? 0;
            $children = $holdData['children'] ?? 0;
        }

        $members      = $adults + $kids ?: (int) ($holdData['total_travelers'] ?? 1);
        $leadTraveler = $travelers[0] ?? [];
        $name         = trim(($leadTraveler['firstName'] ?? '') . ' ' . ($leadTraveler['lastName'] ?? ''));
        $email        = $leadTraveler['email'] ?? 'viator@booking.com';
        $phone        = $leadTraveler['phone'] ?? '';
        $totalPrice   = (int) ($data['totalPrice'] ?? $holdData['total_price'] ?? 0);

        try {
            $order              = new Order;
            $order->tours_id    = $tour->id;
            $order->travel_date = $travelDate;
            $order->adults      = $adults;
            $order->kids        = $kids;
            $order->children    = $children;
            $order->members     = $members;
            $order->cars        = 0;
            $order->tour_price  = $totalPrice;
            $order->total_price = $totalPrice;
            $order->name        = $name ?: 'Viator Guest';
            $order->email       = $email;
            $order->whatsapp    = $phone;
            $order->requests    = json_encode([
                'source'                   => 'viator',
                'viatorConfirmationNumber' => $viatorRef,
                'holdReference'            => $holdRef,
                'startTime'                => $data['startTime'] ?? ($holdData['start_time'] ?? '08:00'),
                'currency'                 => $data['currency'] ?? 'IDR',
                'travelers'                => $travelers,
            ]);
            $order->status_id   = 2; // confirmed/paid

            $order->save();

            if ($holdRef) {
                Cache::forget($holdRef);
            }

            return response()->json([
                'status'                     => 'CONFIRMED',
                'supplierConfirmationNumber' => $order->external_id,
                'viatorConfirmationNumber'   => $viatorRef,
                'bookingId'                  => $order->id,
            ]);

        } catch (\Exception $e) {
            Log::error('Viator booking error: ' . $e->getMessage());

            return response()->json([
                'status' => 'FAILED',
                'error'  => 'Booking creation failed',
            ], 500);
        }
    }

    /**
     * POST /viator/v2/booking-amendment
     */
    public function bookingAmendment(Request $request)
    {
        if (!$this->authenticate($request)) {
            return $this->unauthorized();
        }

        $data        = $request->all();
        $supplierRef = $data['supplierConfirmationNumber'] ?? null;

        if (!$supplierRef) {
            return response()->json(['error' => 'Missing supplierConfirmationNumber'], 400);
        }

        $order = Order::where('external_id', $supplierRef)->first();
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $amendment = $data['amendment'] ?? [];

        if (!empty($amendment['travelDate'])) {
            $order->travel_date = $amendment['travelDate'];
        }
        if (!empty($amendment['leadTravelerName'])) {
            $order->name = $amendment['leadTravelerName'];
        }
        if (!empty($amendment['totalTravelers'])) {
            $order->members = (int) $amendment['totalTravelers'];
        }

        $existing               = json_decode($order->requests ?? '{}', true) ?: [];
        $existing['amendment']  = $amendment;
        $existing['amended_at'] = Carbon::now()->toIso8601String();
        $order->requests        = json_encode($existing);

        $order->save();

        return response()->json([
            'status'                     => 'AMENDED',
            'supplierConfirmationNumber' => $supplierRef,
        ]);
    }

    /**
     * POST /viator/v2/booking-cancellation
     */
    public function bookingCancellation(Request $request)
    {
        if (!$this->authenticate($request)) {
            return $this->unauthorized();
        }

        $data        = $request->all();
        $supplierRef = $data['supplierConfirmationNumber'] ?? null;

        if (!$supplierRef) {
            return response()->json(['error' => 'Missing supplierConfirmationNumber'], 400);
        }

        $order = Order::where('external_id', $supplierRef)->first();
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $order->status_id = 3; // cancelled

        $existing                        = json_decode($order->requests ?? '{}', true) ?: [];
        $existing['cancellation_reason'] = $data['reason'] ?? '';
        $existing['cancelled_at']        = Carbon::now()->toIso8601String();
        $order->requests                 = json_encode($existing);

        $order->save();

        return response()->json([
            'status'                     => 'CANCELLED',
            'supplierConfirmationNumber' => $supplierRef,
        ]);
    }

    /**
     * POST /viator/v2/redemption
     */
    public function redemption(Request $request)
    {
        if (!$this->authenticate($request)) {
            return $this->unauthorized();
        }

        $data        = $request->all();
        $supplierRef = $data['supplierConfirmationNumber'] ?? null;

        if (!$supplierRef) {
            return response()->json(['error' => 'Missing supplierConfirmationNumber'], 400);
        }

        $order = Order::where('external_id', $supplierRef)->first();
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        // status_id 2 = confirmed/paid, 5 = completed
        $redeemed = in_array($order->status_id, [2, 5]);

        return response()->json([
            'supplierConfirmationNumber' => $supplierRef,
            'status'                     => $redeemed ? 'REDEEMED' : 'NOT_REDEEMED',
            'travelDate'                 => $order->travel_date,
            'tourId'                     => $order->tours_id,
        ]);
    }
}
