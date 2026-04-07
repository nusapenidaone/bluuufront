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
 * Viator Supplier API — Operator-Hosted Endpoints
 *
 * Authentication: X-API-Key header
 *   Key:  857de21c4d0a349485fd2702f3ea5e681315fa9688d12c3032af8b2336d7588b
 *   Env:  VIATOR_API_KEY  (fallback — ключ выше)
 *         VIATOR_SUPPLIER_ID
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
        return Tours::with(['boat.closeddates', 'packages', 'pricesbydates.packages'])
            ->where('slug', $optionId)
            ->orWhere('id', is_numeric($optionId) ? (int) $optionId : -1)
            ->first();
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

    /**
     * Ответ об ошибке в формате v1.0.
     */
    private function v1Error(string $message, array $data, string $code = 'TGDS0026', int $status = 400)
    {
        return response()->json([
            'responseType' => 'ErrorResponse',
            'data'         => [
                'ApiKey'        => $data['ApiKey'] ?? '',
                'ResellerId'    => $data['ResellerId'] ?? '',
                'SupplierId'    => $data['SupplierId'] ?? '',
                'Timestamp'     => Carbon::now()->toIso8601String(),
                'RequestStatus' => [
                    'Status' => 'ERROR',
                    'Error'  => ['ErrorCode' => $code, 'ErrorMessage' => $message],
                ],
            ],
        ], $status);
    }

    // ─── Endpoints ───────────────────────────────────────────────────────────

    /**
     * POST /viator/tourlist  (v1.0)
     */
    public function tourList(Request $request)
    {
        if (!$this->authenticate($request)) {
            return $this->unauthorized();
        }

        $data = $this->getData($request);

        $tours = Tours::with(['boat', 'packages', 'pricesbydates.packages'])
            ->whereIn('classes_id', [8, 9])
            ->orderBy('sort_order')
            ->get();

        $grouped = $tours->groupBy('classes_id');

        $tourList = $grouped->map(fn($group, $classId) => [
            'SupplierProductCode' => $classId == 8 ? 'private' : 'shared',
            'SupplierProductName' => $classId == 8 ? 'Private Tour' : 'Shared Tour',
            'CountryCode'         => 'ID',
            'DestinationCode'     => 'ID LBN',
            'DestinationName'     => 'Lombok, Indonesia',
            'TourDescription'     => $classId == 8 ? 'Private boat tour' : 'Shared boat tour',
            'TourOption'          => $group->map(fn($tour) => [
                'productOptionId'    => $tour->slug,
                'SupplierOptionCode' => $tour->slug,
                'SupplierOptionName' => $tour->name,
                'TourDepartureTime'  => '08:00:00',
            ])->values()->all(),
        ])->values();

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
            $optionId   = $option['productOptionId'] ?? null;
            $startTimes = $option['startTimes'] ?? ['08:00'];

            if (!$optionId) continue;

            $tour = $this->findTour($optionId);

            // Если тур не найден — не включаем в ответ (спек: invalid = not returned)
            if (!$tour) continue;

            $available   = $this->calculateAvailability($tour, $dateStr);
            $isAvailable = $available >= max(1, $totalTravelers);
            $price       = $this->getPrice($tour, $carbonDate, $totalTravelers);
            $events      = [];

            foreach ($startTimes as $startTime) {
                if ($isAvailable) {
                    $events[] = [
                        'status'        => 'AVAILABLE',
                        'startTime'     => $startTime,
                        'capacity'      => $this->buildCapacity($tour, $available),
                        'bookingCutoff' => $cutoff,
                        'price'         => $this->buildPrice($tour, $price),
                    ];
                } else {
                    $events[] = [
                        'status'            => 'UNAVAILABLE',
                        'unavailableReason' => $available === 0 ? 'SOLD_OUT' : 'LIMITED_AVAILABILITY',
                        'startTime'         => $startTime,
                        'capacity'          => $this->buildCapacity($tour, $available),
                        'bookingCutoff'     => $cutoff,
                    ];
                }
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

            $dates   = [];
            $current = $start->copy();

            while ($current->lte($end)) {
                $dateStr   = $current->format('Y-m-d');
                $available = $this->calculateAvailability($tour, $dateStr);
                $price     = $this->getPrice($tour, $current->copy(), 1);
                $cutoff    = $current->copy()->subDay()->setTime(23, 59, 59)->utc()->toIso8601String();

                $event = $available > 0
                    ? [
                        'status'        => 'AVAILABLE',
                        'startTime'     => '08:00',
                        'bookingCutoff' => $cutoff,
                        'capacity'      => $this->buildCapacity($tour, $available),
                        'price'         => $this->buildPrice($tour, $price),
                    ]
                    : [
                        'status'            => 'UNAVAILABLE',
                        'unavailableReason' => 'SOLD_OUT',
                        'startTime'         => '08:00',
                        'bookingCutoff'     => $cutoff,
                        'capacity'          => $this->buildCapacity($tour, 0),
                        'price'             => $this->buildPrice($tour, $price),
                    ];

                $dates[] = [
                    'travelDate' => $dateStr,
                    'events'     => [$event],
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
     * POST /viator/booking  (v1.0)
     */
    public function booking(Request $request)
    {
        if (!$this->authenticate($request)) {
            return $this->unauthorized();
        }

        $data     = $this->getData($request);
        $bookRef  = $data['BookingReference'] ?? null;
        $prodCode = $data['SupplierProductCode'] ?? null;

        $tourOptions = $data['TourOptions'] ?? [];
        $optionId    = $tourOptions['SupplierOptionCode'] ?? $prodCode;

        if (!$optionId) {
            return $this->v1Error('Missing SupplierProductCode', $data);
        }

        $holdRef  = $data['AvailabilityHoldReference'] ?? null;
        $holdData = $holdRef ? Cache::get($holdRef) : null;

        $travelDate = $data['TravelDate'] ?? ($holdData['travel_date'] ?? null);
        if (!$travelDate) {
            return $this->v1Error('Missing TravelDate', $data);
        }

        $tour = Tours::with(['boat.closeddates'])
            ->where('slug', $optionId)
            ->orWhere('id', is_numeric($prodCode) ? (int) $prodCode : -1)
            ->first();

        if (!$tour) {
            return $this->v1Error('Tour not found', $data, 'TGDS0012');
        }

        // Разбираем тип путешественников
        $travellers = $data['Traveller'] ?? [];
        $mix        = $data['TravellerMix'] ?? [];
        $adults     = (int) ($mix['Adult'] ?? 0);
        $kids       = (int) ($mix['Child'] ?? 0) + (int) ($mix['Youth'] ?? 0);
        $children   = (int) ($mix['Infant'] ?? 0);
        $members    = $adults + $kids ?: (int) ($holdData['total_travelers'] ?? 1);

        $lead  = collect($travellers)->first(fn($t) => !empty($t['LeadTraveller'])) ?? ($travellers[0] ?? []);
        $name  = trim(($lead['GivenName'] ?? '') . ' ' . ($lead['Surname'] ?? ''));
        $email = $data['ContactEmail'] ?? 'viator@booking.com';
        $phone = $data['ContactDetail']['ContactValue'] ?? '';

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
            $order->email       = $email;
            $order->whatsapp    = $phone;
            $order->requests    = json_encode([
                'source'              => 'viator',
                'BookingReference'    => $bookRef,
                'holdReference'       => $holdRef,
                'startTime'           => $tourOptions['TourDepartureTime'] ?? ($holdData['start_time'] ?? '08:00'),
                'currency'            => 'IDR',
                'specialRequirement'  => $data['SpecialRequirement'] ?? '',
                'pickupPoint'         => $data['PickupPoint'] ?? '',
            ]);
            $order->status_id   = 2;
            $order->save();

            if ($holdRef) {
                Cache::forget($holdRef);
            }

            $confirmNumber = $this->makeConfirmationNumber($order->id);

            $travelerResponse = collect($travellers)->map(fn($t) => [
                'TravellerIdentifier'               => $t['TravellerIdentifier'] ?? '1',
                'TravellerSupplierConfirmationNumber' => $confirmNumber,
            ])->values()->all();

            return response()->json([
                'responseType' => 'BookingResponse',
                'data'         => [
                    'ApiKey'                    => $data['ApiKey'] ?? '',
                    'ResellerId'                => $data['ResellerId'] ?? '',
                    'SupplierId'                => $data['SupplierId'] ?? '',
                    'ExternalReference'         => $data['ExternalReference'] ?? '',
                    'Timestamp'                 => Carbon::now()->toIso8601String(),
                    'RequestStatus'             => ['Status' => 'SUCCESS'],
                    'BookingReference'          => $bookRef,
                    'SupplierConfirmationNumber' => $confirmNumber,
                    'TransactionStatus'         => ['Status' => 'CONFIRMED'],
                    'Traveller'                 => $travelerResponse,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Viator booking error: ' . $e->getMessage());
            return $this->v1Error('Booking creation failed', $data, 'TGDS0006', 500);
        }
    }

    /**
     * POST /viator/booking-amendment  (v1.0)
     */
    public function bookingAmendment(Request $request)
    {
        if (!$this->authenticate($request)) {
            return $this->unauthorized();
        }

        $data        = $this->getData($request);
        $supplierRef = $data['SupplierConfirmationNumber'] ?? null;
        $bookRef     = $data['BookingReference'] ?? null;

        if (!$supplierRef) {
            return $this->v1Error('Missing SupplierConfirmationNumber', $data);
        }

        $order = $this->findOrder($supplierRef);
        if (!$order) {
            return $this->v1Error('Order not found', $data, 'TGDS0012');
        }

        $travellers = $data['Traveller'] ?? [];
        $mix        = $data['TravellerMix'] ?? [];
        $adults     = (int) ($mix['Adult'] ?? $order->adults);
        $kids       = (int) ($mix['Child'] ?? 0) + (int) ($mix['Youth'] ?? 0);
        $children   = (int) ($mix['Infant'] ?? $order->children);
        $members    = $adults + $kids ?: $order->members;
        $travelDate = $data['TravelDate'] ?? $order->travel_date;

        $lead = collect($travellers)->first(fn($t) => !empty($t['LeadTraveller'])) ?? ($travellers[0] ?? []);
        $name = trim(($lead['GivenName'] ?? '') . ' ' . ($lead['Surname'] ?? ''));

        $order->travel_date = $travelDate;
        $order->adults      = $adults;
        $order->kids        = $kids;
        $order->children    = $children;
        $order->members     = $members;
        if ($name) $order->name = $name;

        $existing               = json_decode($order->requests ?? '{}', true) ?: [];
        $existing['amended_at'] = Carbon::now()->toIso8601String();
        if (!empty($data['PickupPoint']))       $existing['pickupPoint']        = $data['PickupPoint'];
        if (!empty($data['SpecialRequirement'])) $existing['specialRequirement'] = $data['SpecialRequirement'];
        $order->requests = json_encode($existing);
        $order->save();

        $confirmNumber    = str_starts_with($supplierRef, 'BLU-') ? $supplierRef : $this->makeConfirmationNumber($order->id);
        $travelerResponse = collect($travellers)->map(fn($t) => [
            'TravellerIdentifier'               => $t['TravellerIdentifier'] ?? '1',
            'TravellerSupplierConfirmationNumber' => $confirmNumber,
        ])->values()->all();

        return response()->json([
            'responseType' => 'BookingAmendmentResponse',
            'data'         => [
                'ApiKey'                    => $data['ApiKey'] ?? '',
                'ResellerId'                => $data['ResellerId'] ?? '',
                'SupplierId'                => $data['SupplierId'] ?? '',
                'ExternalReference'         => $data['ExternalReference'] ?? '',
                'Timestamp'                 => Carbon::now()->toIso8601String(),
                'RequestStatus'             => ['Status' => 'SUCCESS'],
                'BookingReference'          => $bookRef,
                'SupplierConfirmationNumber' => $confirmNumber,
                'TransactionStatus'         => ['Status' => 'CONFIRMED'],
                'Traveller'                 => $travelerResponse,
            ],
        ]);
    }

    /**
     * POST /viator/booking-cancellation  (v1.0)
     */
    public function bookingCancellation(Request $request)
    {
        if (!$this->authenticate($request)) {
            return $this->unauthorized();
        }

        $data        = $this->getData($request);
        $supplierRef = $data['SupplierConfirmationNumber'] ?? null;
        $bookRef     = $data['BookingReference'] ?? null;

        if (!$supplierRef) {
            return $this->v1Error('Missing SupplierConfirmationNumber', $data);
        }

        $order = $this->findOrder($supplierRef);
        if (!$order) {
            return $this->v1Error('Order not found', $data, 'TGDS0012');
        }

        $order->status_id = 3; // cancelled
        $existing                         = json_decode($order->requests ?? '{}', true) ?: [];
        $existing['cancellation_reason']  = $data['Reason'] ?? '';
        $existing['cancellation_author']  = $data['Author'] ?? '';
        $existing['cancelled_at']         = Carbon::now()->toIso8601String();
        $order->requests = json_encode($existing);
        $order->save();

        $confirmNumber    = str_starts_with($supplierRef, 'BLU-') ? $supplierRef : $this->makeConfirmationNumber($order->id);
        $cancelNumber     = 'CANC-' . $order->id . '-' . time();

        return response()->json([
            'responseType' => 'BookingCancellationResponse',
            'data'         => [
                'ApiKey'                    => $data['ApiKey'] ?? '',
                'ResellerId'                => $data['ResellerId'] ?? '',
                'SupplierId'                => $data['SupplierId'] ?? '',
                'ExternalReference'         => $data['ExternalReference'] ?? '',
                'Timestamp'                 => Carbon::now()->toIso8601String(),
                'RequestStatus'             => ['Status' => 'SUCCESS'],
                'BookingReference'          => $bookRef,
                'SupplierConfirmationNumber' => $confirmNumber,
                'SupplierCancellationNumber' => $cancelNumber,
                'TransactionStatus'         => ['Status' => 'CONFIRMED'],
            ],
        ]);
    }

    /**
     * POST /viator/redemption  (v1.0)
     */
    public function redemption(Request $request)
    {
        if (!$this->authenticate($request)) {
            return $this->unauthorized();
        }

        $data        = $this->getData($request);
        $supplierRef = $data['SupplierConfirmationNumber'] ?? null;

        if (!$supplierRef) {
            return $this->v1Error('Missing SupplierConfirmationNumber', $data);
        }

        $order = $this->findOrder($supplierRef);
        if (!$order) {
            return $this->v1Error('Order not found', $data, 'TGDS0012');
        }

        // status_id 5 = completed/used — только это считается redemption
        $redeemed = $order->status_id === 5;

        return response()->json([
            'responseType' => 'RedemptionResponse',
            'data'         => [
                'ApiKey'            => $data['ApiKey'] ?? '',
                'ResellerId'        => $data['ResellerId'] ?? '',
                'SupplierId'        => $data['SupplierId'] ?? '',
                'ExternalReference' => $data['ExternalReference'] ?? '',
                'Timestamp'         => Carbon::now()->toIso8601String(),
                'RequestStatus'     => ['Status' => 'SUCCESS'],
                'RedemptionStatus'  => $redeemed,
            ],
        ]);
    }
}
