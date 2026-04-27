<?php

namespace Noren\Booking\Viator;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Carbon\Carbon;
use Cache;
use Log;
use Noren\Booking\Models\Tours;
use Noren\Booking\Models\Classes;
use Noren\Booking\Models\Order;

/**
 * Viator Supplier API — Operator-Hosted Endpoints
 *
 * Authentication: X-API-Key header
 *   Key:  TPE_6ksS7xfc47PCvbaq-8NVZtrgJGW6hwavp12dG8M  (Supplier ID: 4000500)
 *   Env:  VIATOR_API_KEY  (fallback — ключ выше)
 *         VIATOR_SUPPLIER_ID  (fallback: 4000500)
 *
 * Availability logic:
 *   Private (classes_id=8) — тур доступен если НЕ все лодки заняты  → PER_UNIT_PRICE
 *   Shared  (classes_id=9) — возвращает макс. свободных мест         → PER_PERSON_PRICE
 *     type null/''  or in [2,3,4] → лодка полностью заблокирована
 *     type 1                      → частичное бронирование (qtty мест занято)
 *
 * Endpoints (v1.0 — wrapped in { requestType, data: {...} }):
 *   POST /viator/tourlist              — список туров
 *   POST /viator/booking               — создание заказа
 *   POST /viator/booking-amendment     — изменение заказа
 *   POST /viator/booking-cancellation  — отмена заказа
 *   POST /viator/redemption            — статус использования
 *
 * Endpoints (v2.0 — plain JSON):
 *   POST /viator/v2/availability/check    — доступность на дату
 *   POST /viator/v2/availability/calendar — доступность на диапазон
 *   POST /viator/v2/reserve               — резерв мест (TTL 20 мин)
 */
class ViatorController extends Controller
{
    // ─── Auth ────────────────────────────────────────────────────────────────

    private function authenticate(Request $request): bool
    {
        $apiKey = env('VIATOR_API_KEY', 'TPE_6ksS7xfc47PCvbaq-8NVZtrgJGW6hwavp12dG8M');
        return !empty($apiKey) && $request->header('X-API-Key') === $apiKey;
    }

    private function unauthorized()
    {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    private function getSupplierId(): int
    {
        return (int) env('VIATOR_SUPPLIER_ID', 4000500);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Извлечь данные из v1.0-обёртки { requestType, data: {...} } или из прямого запроса.
     */
    private function getData(Request $request): array
    {
        $all = $request->all();
        return isset($all['data']) ? $all['data'] : $all;
    }

    /**
     * Рассчитать доступные места на дату.
     * Private → количество мест в туре (если хотя бы одна лодка свободна).
     * Shared  → максимальное кол-во свободных мест среди всех лодок.
     */
    private function calculateAvailability(Tours $tour, string $date): int
    {
        if (!$tour->boat || $tour->boat->isEmpty()) {
            return 0;
        }

        if ($tour->classes_id == 9) {
            // Shared: суммируем свободные места по всем доступным лодкам
            $totalAvailable = 0;
            foreach ($tour->boat as $boat) {
                // Если лодка помечена как "закрытая" в бэк-офисе, она не идет в расчет
                if (!empty($boat->closed)) continue;

                $capacity = (int) ($boat->capacity ?? 0);
                $records  = $boat->closeddates->filter(fn($cd) =>
                    $cd->deleted_at === null && substr($cd->date, 0, 10) === $date
                );

                if ($records->isEmpty()) {
                    $totalAvailable += $capacity;
                    continue;
                }

                // Типы 2 (private), 3 (manual), 4 (evening) полностью блокируют лодку
                $blocked = $records->first(fn($cd) =>
                    $cd->type === null || $cd->type === '' || in_array((int) $cd->type, [2, 3, 4])
                );

                if ($blocked) continue;

                // Тип 1 (shared) — вычитаем занятые места
                $used  = (int) $records->where('type', 1)->sum('qtty');
                $totalAvailable += max(0, $capacity - $used);
            }
            return $totalAvailable;
        } else {
            // Private: доступен если хотя бы одна лодка не занята и не закрыта
            $totalBoats = $tour->boat->count();
            $occupiedCount = $tour->boat->filter(fn($boat) =>
                !empty($boat->closed) || $boat->closeddates->first(fn($cd) =>
                    $cd->deleted_at === null && substr($cd->date, 0, 10) === $date
                ) !== null
            )->count();

            return $occupiedCount >= $totalBoats ? 0 : (int) ($tour->capacity ?? 0);
        }
    }

    /**
     * Исходная (максимальная) вместимость тура — для поля capacity.original.
     */
    private function getOriginalCapacity(Tours $tour): int
    {
        if ($tour->classes_id == 9) {
            return (int) ($tour->boat->sum('capacity') ?? $tour->capacity ?? 0);
        }
        return (int) ($tour->capacity ?? 0);
    }

    /**
     * Цена тура: для private — цена за лодку; для shared — цена на человека.
     * Mirrors ChatbotController::getQuote() pricing logic.
     */
    private function getPrice(Tours $tour, Carbon $date, int $members): int
    {
        $isPrivate    = $tour->classes_id == 8;
        $boatPriceAdd = $isPrivate ? (int) ($tour->boat_price ?? 0) : 0;
        $dateStr      = $date->format('Y-m-d');

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

        $entry     = collect($pricelist)->firstWhere('members_count', $members);
        $tierPrice = (int) ($entry['price'] ?? 0);

        return $tierPrice + $boatPriceAdd;
    }

    /**
     * Сформировать price-объект по спецификации Viator v2.0.
     * Private → PER_UNIT_PRICE
     * Shared  → PER_PERSON_PRICE
     */
    private function buildPrice(Tours $tour, int $retailPrice): array
    {
        if ($tour->classes_id == 8) {
            return [
                'type'        => 'PER_UNIT_PRICE',
                'retailPrice' => $retailPrice,
                'maxTravelers' => (int) ($tour->capacity ?? 8),
            ];
        }

        return [
            'type'   => 'PER_PERSON_PRICE',
            'prices' => [
                [
                    'types'       => ['ADULT', 'CHILD', 'YOUTH', 'SENIOR'],
                    'retailPrice' => $retailPrice,
                ],
                [
                    'types'       => ['INFANT'],
                    'retailPrice' => 0,
                ],
            ],
        ];
    }

    /**
     * Сформировать capacity-объект по спецификации Viator v2.0.
     */
    private function buildCapacity(Tours $tour, int $remaining): array
    {
        $original    = $this->getOriginalCapacity($tour);
        $ticketTypes = $tour->classes_id == 8
            ? ['UNIT']
            : ['ADULT', 'CHILD', 'YOUTH', 'SENIOR', 'INFANT'];

        return [
            'type'      => 'LIMITED',
            'vacancies' => [
                [
                    'types'        => $ticketTypes,
                    'quantity'     => $remaining,
                    'quantityType' => 'SHARED',
                ],
            ],
            'original'  => $original,
            'remaining' => $remaining,
        ];
    }

    /**
     * Найти тур по productOptionId (slug) или числовому id.
     */
    private function findTour(string $optionId): ?Tours
    {
        return Tours::with(['boat.closeddates', 'packages', 'pricesbydates.packages', 'route'])
            ->where('slug', $optionId)
            ->orWhere('id', is_numeric($optionId) ? (int) $optionId : -1)
            ->first();
    }

    /**
     * Время отправления тура из route.start, формат "HH:MM". Null если не задано.
     */
    private function getTourStartTime(Tours $tour): ?string
    {
        $start = $tour->route?->start ?? null;
        return $start ? substr($start, 0, 5) : null;
    }

    /**
     * Уникальный номер подтверждения для заказа.
     */
    private function makeConfirmationNumber(int $orderId): string
    {
        return 'BLU-' . $orderId;
    }

    /**
     * Найти заказ по SupplierConfirmationNumber (поддерживает оба формата).
     */
    private function findOrder(string $supplierRef): ?Order
    {
        $order = Order::where('external_id', $supplierRef)->first();
        if (!$order && str_starts_with($supplierRef, 'BLU-')) {
            $id    = (int) substr($supplierRef, 4);
            $order = Order::find($id);
        }
        return $order;
    }



    // ─── Endpoints ───────────────────────────────────────────────────────────

    /**
     * POST /viator/tourlist  (v1.0)
     * Классы с types_id=5 → продукты (SupplierProductCode).
     * Туры каждого класса → опции (TourOption).
     */
    public function tourList(Request $request)
    {
        if (!$this->authenticate($request)) {
            return $this->unauthorized();
        }

        $data = $this->getData($request);

        $classes = Classes::query()->where('types_id', 5)->get()->keyBy('id');

        $tours = Tours::with(['boat', 'packages', 'pricesbydates.packages'])
            ->whereIn('classes_id', $classes->keys())
            ->orderBy('sort_order')
            ->get()
            ->groupBy('classes_id');

        $tourList = $classes->map(function ($class) use ($tours) {
            $classTours = $tours->get($class->id, collect());
            return [
                'SupplierProductCode' => $class->slug ?? "class-{$class->id}",
                'SupplierProductName' => $class->name,
                'CountryCode'         => 'ID',
                'DestinationCode'     => 'ID LBN',
                'DestinationName'     => 'Lombok, Indonesia',
                'TourDescription'     => $class->name,
                'TourOption'          => $classTours->map(fn($tour) => [
                    'productOptionId'    => $tour->slug,
                    'SupplierOptionCode' => $tour->slug,
                    'SupplierOptionName' => $tour->name,
                    'TourDepartureTime'  => '08:00:00',
                ])->values()->all(),
            ];
        })->values();

        return response()->json([
            'responseType' => 'TourListResponse',
            'data'         => [
                'ApiKey'        => $data['ApiKey'] ?? '',
                'ResellerId'    => $data['ResellerId'] ?? '',
                'SupplierId'    => (string) $this->getSupplierId(),
                'Timestamp'     => Carbon::now()->toIso8601String(),
                'RequestStatus' => ['Status' => 'SUCCESS'],
                'Tour'          => $tourList->all(),
            ],
        ]);
    }

    /**
     * POST /viator/v2/availability/check  (v2.0)
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
            return response()->json([
                'error'   => 'INVALID_SUPPLIER',
                'message' => 'Missing required fields: travelDate, productOptions',
            ], 422);
        }

        $dateStr    = Carbon::parse($travelDate)->format('Y-m-d');
        $carbonDate = Carbon::parse($travelDate)->startOfDay();
        $cutoff     = $carbonDate->copy()->subDay()->setTime(23, 59, 59)->utc()->toIso8601String();

        $resultOptions = [];

        foreach ($productOptions as $option) {
            $optionId = $option['productOptionId'] ?? null;

            if (!$optionId) continue;

            $tour = $this->findTour($optionId);

            // Если тур не найден — не включаем в ответ (спек: invalid = not returned)
            if (!$tour) continue;

            $available      = $this->calculateAvailability($tour, $dateStr);
            $isAvailable    = $available >= max(1, $totalTravelers);
            $price          = $this->getPrice($tour, $carbonDate, $totalTravelers);
            $events         = [];
            $startTimes     = $option['startTimes'] ?? [];
            $hasStartTimes  = !empty($startTimes);

            $slots = $hasStartTimes ? $startTimes : [null];

            foreach ($slots as $startTime) {
                $base = $isAvailable
                    ? [
                        'status'        => 'AVAILABLE',
                        'capacity'      => $this->buildCapacity($tour, $available),
                        'bookingCutoff' => $cutoff,
                        'price'         => $this->buildPrice($tour, $price),
                    ]
                    : [
                        'status'            => 'UNAVAILABLE',
                        'unavailableReason' => $available === 0 ? 'SOLD_OUT' : 'LIMITED_AVAILABILITY',
                        'capacity'          => $this->buildCapacity($tour, $available),
                        'bookingCutoff'     => $cutoff,
                    ];

                if ($startTime !== null) {
                    $base['startTime'] = $startTime;
                }

                $events[] = $base;
            }

            $resultOptions[] = [
                'productOptionId' => $optionId,
                'currency'        => 'IDR',
                'events'          => $events,
            ];
        }

        return response()->json(['productOptions' => $resultOptions]);
    }

    /**
     * POST /viator/v2/availability/calendar  (v2.0)
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
            return response()->json([
                'error'   => 'INVALID_SUPPLIER',
                'message' => 'Missing required fields: productOptionIds, startDate, endDate',
            ], 422);
        }

        $start = Carbon::parse($startDate)->startOfDay();
        $end   = Carbon::parse($endDate)->startOfDay();

        if ($end->diffInDays($start) > 92) {
            return response()->json([
                'error'   => 'INVALID_SUPPLIER',
                'message' => 'Date range must not exceed 92 days',
            ], 422);
        }

        $resultOptions = [];

        foreach ($productOptionIds as $optionId) {
            $tour = $this->findTour($optionId);
            if (!$tour) continue;

            $startTime = $this->getTourStartTime($tour);
            $dates     = [];
            $current   = $start->copy();

            while ($current->lte($end)) {
                $dateStr   = $current->format('Y-m-d');
                $available = $this->calculateAvailability($tour, $dateStr);
                $price     = $this->getPrice($tour, $current->copy(), 1);
                $cutoff    = $current->copy()->subDay()->setTime(23, 59, 59)->utc()->toIso8601String();

                $base = $available > 0
                    ? [
                        'status'        => 'AVAILABLE',
                        'bookingCutoff' => $cutoff,
                        'capacity'      => $this->buildCapacity($tour, $available),
                        'price'         => $this->buildPrice($tour, $price),
                    ]
                    : [
                        'status'            => 'UNAVAILABLE',
                        'unavailableReason' => 'SOLD_OUT',
                        'bookingCutoff'     => $cutoff,
                        'capacity'          => $this->buildCapacity($tour, 0),
                        'price'             => $this->buildPrice($tour, $price),
                    ];

                if ($startTime !== null) {
                    $base['startTime'] = $startTime;
                }

                $dates[] = [
                    'travelDate' => $dateStr,
                    'events'     => [$base],
                ];

                $current->addDay();
            }

            $resultOptions[] = [
                'productOptionId' => $optionId,
                'currency'        => 'IDR',
                'dates'           => $dates,
            ];
        }

        return response()->json(['productOptions' => $resultOptions]);
    }

    /**
     * POST /viator/v2/reserve  (v2.0)
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
            return response()->json([
                'error'   => 'INVALID_PRODUCT_OPTION',
                'message' => 'Missing required fields: productOptionId, travelDate',
            ], 422);
        }

        $tour = $this->findTour($optionId);
        if (!$tour) {
            return response()->json([
                'error'   => 'INVALID_PRODUCT_OPTION',
                'message' => 'Product option does not exist',
            ], 422);
        }

        $dateStr    = Carbon::parse($travelDate)->format('Y-m-d');
        $carbonDate = Carbon::parse($travelDate)->startOfDay();
        $available  = $this->calculateAvailability($tour, $dateStr);

        if ($available === 0) {
            return response()->json(['status' => 'NOT_RESERVED', 'reason' => 'SOLD_OUT']);
        }

        if ($available < $totalTravelers) {
            return response()->json(['status' => 'NOT_RESERVED', 'reason' => 'LIMITED_AVAILABILITY']);
        }

        // Разбиваем тикеты по типам
        $adults = $kids = $children = 0;
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

        $retailPrice = $this->getPrice($tour, $carbonDate, $totalTravelers);
        $reference   = 'BLU-RES-' . uniqid('', true);
        $expiration  = Carbon::now()->addMinutes(20)->utc();

        Cache::put($reference, [
            'tour_id'         => $tour->id,
            'option_id'       => $optionId,
            'travel_date'     => $dateStr,
            'total_travelers' => $totalTravelers,
            'adults'          => $adults,
            'kids'            => $kids,
            'children'        => $children,
            'retail_price'    => $retailPrice,
            'start_time'      => $data['startTime'] ?? '08:00',
        ], 20);

        return response()->json([
            'status'     => 'RESERVED',
            'expiration' => $expiration->toIso8601String(),
            'reference'  => $reference,
            'currency'   => 'IDR',
            'price'      => $this->buildPrice($tour, $retailPrice),
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

        $data     = $request->all();
        $optionId = $data['productOptionId'] ?? null;
        $holdRef  = $data['availabilityHoldReference'] ?? null;
        $holdData = $holdRef ? Cache::get($holdRef) : null;

        $travelDate = $data['travelDate'] ?? ($holdData['travel_date'] ?? null);

        if (!$optionId || !$travelDate) {
            return response()->json(['error' => 'INVALID_BOOKING', 'message' => 'Missing productOptionId or travelDate'], 422);
        }

        $tour = $this->findTour($optionId);
        if (!$tour) {
            return response()->json(['error' => 'INVALID_PRODUCT_OPTION', 'message' => 'Product option not found'], 422);
        }

        $travelers = $data['travelerMix'] ?? [];
        $adults = $kids = $children = 0;
        $name = $email = $phone = '';

        foreach ($travelers as $t) {
            $type = strtoupper($t['type'] ?? 'ADULT');
            if (in_array($type, ['ADULT', 'SENIOR'])) $adults++;
            elseif ($type === 'INFANT')                $children++;
            else                                       $kids++;

            if (empty($name) && !empty($t['firstName'])) {
                $name  = trim(($t['firstName'] ?? '') . ' ' . ($t['lastName'] ?? ''));
                $email = $t['email'] ?? '';
                $phone = $t['phone'] ?? '';
            }
        }

        $members     = $adults + $kids ?: (int) ($holdData['total_travelers'] ?? 1);
        $carbonDate  = Carbon::parse($travelDate)->startOfDay();
        $retailPrice = $this->getPrice($tour, $carbonDate, $members);
        $totalPrice  = $tour->classes_id == 8 ? $retailPrice : $retailPrice * $members;

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
            $order->email       = $email ?: 'viator@booking.com';
            $order->whatsapp    = $phone;
            $order->source_id   = 2;
            $order->requests    = json_encode([
                'source'                    => 'viator',
                'viatorConfirmationNumber'  => $data['viatorConfirmationNumber'] ?? null,
                'holdReference'             => $holdRef,
                'startTime'                 => $data['startTime'] ?? ($holdData['start_time'] ?? '08:00'),
                'currency'                  => 'IDR',
            ]);
            $order->status_id   = 2;
            $order->save();

            if ($holdRef) Cache::forget($holdRef);

            return response()->json([
                'status'                    => 'CONFIRMED',
                'supplierConfirmationNumber' => $this->makeConfirmationNumber($order->id),
                'viatorConfirmationNumber'  => $data['viatorConfirmationNumber'] ?? null,
                'bookingId'                 => $order->id,
            ]);

        } catch (\Exception $e) {
            Log::error('Viator booking error: ' . $e->getMessage());
            return response()->json(['error' => 'BOOKING_FAILED', 'message' => 'Internal error'], 500);
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
            return response()->json(['error' => 'INVALID_REQUEST', 'message' => 'Missing supplierConfirmationNumber'], 422);
        }

        $order = $this->findOrder($supplierRef);
        if (!$order) {
            return response()->json(['error' => 'BOOKING_NOT_FOUND', 'message' => 'Order not found'], 404);
        }

        $amendment = $data['amendment'] ?? [];

        if (!empty($amendment['travelDate']))      $order->travel_date = $amendment['travelDate'];
        if (!empty($amendment['totalTravelers']))   $order->members     = (int) $amendment['totalTravelers'];
        if (!empty($amendment['leadTravelerName'])) $order->name        = $amendment['leadTravelerName'];

        $existing               = json_decode($order->requests ?? '{}', true) ?: [];
        $existing['amended_at'] = Carbon::now()->toIso8601String();
        $order->requests        = json_encode($existing);
        $order->save();

        return response()->json([
            'status'                    => 'AMENDED',
            'supplierConfirmationNumber' => str_starts_with($supplierRef, 'BLU-') ? $supplierRef : $this->makeConfirmationNumber($order->id),
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
            return response()->json(['error' => 'INVALID_REQUEST', 'message' => 'Missing supplierConfirmationNumber'], 422);
        }

        $order = $this->findOrder($supplierRef);
        if (!$order) {
            return response()->json(['error' => 'BOOKING_NOT_FOUND', 'message' => 'Order not found'], 404);
        }

        $order->status_id = 3;
        $existing                        = json_decode($order->requests ?? '{}', true) ?: [];
        $existing['cancellation_reason'] = $data['reason'] ?? '';
        $existing['cancelled_at']        = Carbon::now()->toIso8601String();
        $order->requests                 = json_encode($existing);
        $order->save();

        return response()->json([
            'status'                    => 'CANCELLED',
            'supplierConfirmationNumber' => str_starts_with($supplierRef, 'BLU-') ? $supplierRef : $this->makeConfirmationNumber($order->id),
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
            return response()->json(['error' => 'INVALID_REQUEST', 'message' => 'Missing supplierConfirmationNumber'], 422);
        }

        $order = $this->findOrder($supplierRef);
        if (!$order) {
            return response()->json(['error' => 'BOOKING_NOT_FOUND', 'message' => 'Order not found'], 404);
        }

        $redeemed = $order->status_id === 5;

        return response()->json([
            'supplierConfirmationNumber' => $supplierRef,
            'status'                    => $redeemed ? 'REDEEMED' : 'NOT_REDEEMED',
            'travelDate'                => $order->travel_date,
            'tourId'                    => $order->tours_id,
        ]);
    }
}
