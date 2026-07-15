<?php namespace Noren\Booking\Odoo;

use Carbon\Carbon;
use Http;
use Log;
use Noren\Booking\Models\Order;
use Noren\Booking\Models\Extras;

class OdooService
{
    protected static function cfg(): array
    {
        static $cfg = null;
        if ($cfg === null) {
            $cfg = require(__DIR__ . '/services.config.php');
            if (!is_array($cfg) || !isset($cfg['url'])) {
                throw new \RuntimeException('Invalid or missing Odoo config in services.config.php');
            }
        }
        return $cfg;
    }

    protected static function url():    string { return static::cfg()['url']; }
    protected static function db():     string { return static::cfg()['db']; }
    protected static function apiKey(): string { return static::cfg()['api_key']; }


    // ─── Entry point ──────────────────────────────────────────────────────────

    protected static function paymentSource(Order $order): string
    {
        return optional($order->method)->name ?? '';
    }

    /**
     * Cancel the existing Odoo order and create a brand-new one from the current
     * local order state. Used by the admin interface so that ANY change (products,
     * extras, transfer, boat, dates…) is fully reflected in Odoo.
     *
     * Preserves the deposit: if the Odoo order already has a higher deposit
     * (web payments were registered there), that amount is copied to the new order.
     */
    public static function recreateLead(Order $order, bool $confirm = false): array
    {
        $odooOrderId = (int) $order->odoo_id;
        if (!$odooOrderId) {
            throw new \RuntimeException('Order has no odoo_id');
        }

        // 1. Read current deposit from Odoo so web-payments are not lost
        $odooDeposit = 0.0;
        $odooBoat    = '';
        try {
            $odooOrder   = static::getFullOrder($odooOrderId);
            $odooDeposit = (float) ($odooOrder['x_studio_deposit'] ?? 0);
            $odooBoat    = $odooOrder['x_studio_boat_name'] ?? '';
        } catch (\Exception $e) {
            Log::warning('OdooService::recreateLead — could not read old order', [
                'odoo_id' => $odooOrderId,
                'error'   => $e->getMessage(),
            ]);
        }

        // 2. Cancel old order
        static::cancelOrder($odooOrderId);

        // 3. Create new order
        $order->loadMissing(['tours', 'boat.company', 'transfer', 'cover', 'route', 'program', 'restaurant', 'method']);

        $data = static::buildOrderData($order);
        $data['lead']['payment_source'] = static::paymentSource($order);

        $partnerId = static::createOrFindPartner($order);
        $newOdooId = static::createSaleOrder($data, $partnerId);
        static::addOrderLines($order, $newOdooId);

        // 4. Restore deposit if Odoo had more (accumulated web payments)
        $localDeposit = (float) ($order->deposite_summ ?? 0);
        if ($odooDeposit > $localDeposit) {
            static::post('/json/2/sale.order/write', [
                'ids'  => [$newOdooId],
                'vals' => ['x_studio_deposit' => $odooDeposit],
            ]);
        }

        if ($confirm) {
            static::confirmOrder($newOdooId);
        }

        static::addLogNote($newOdooId, static::buildOrderNote($order));

        Log::info('OdooService::recreateLead — done', [
            'old_odoo_id' => $odooOrderId,
            'new_odoo_id' => $newOdooId,
            'order_id'    => $order->id,
            'boat_before' => $odooBoat,
            'boat_after'  => optional($order->boat)->name ?? '',
            'deposit_preserved' => $odooDeposit > $localDeposit ? $odooDeposit : null,
        ]);

        return [
            'cancelled_odoo_id' => $odooOrderId,
            'partner_id'        => $partnerId,
            'order_id'          => $newOdooId,
        ];
    }

    public static function createLead(Order $order, bool $confirm = false): array
    {
        $order->loadMissing(['tours', 'boat.company', 'transfer', 'cover', 'route', 'program', 'restaurant', 'method']);

        $data = static::buildOrderData($order);
        $data['lead']['payment_source'] = static::paymentSource($order);

        $partnerId   = static::createOrFindPartner($order);
        $odooOrderId = static::createSaleOrder($data, $partnerId);
        static::addOrderLines($order, $odooOrderId);

        if ($confirm) {
            static::confirmOrder($odooOrderId);
        }

        static::addLogNote($odooOrderId, static::buildOrderNote($order));

        return [
            'partner_id' => $partnerId,
            'order_id'   => $odooOrderId,
        ];
    }

    public static function confirmOrder(int $odooOrderId): void
    {
        static::post('/json/2/sale.order/action_confirm', [
            'ids'     => [$odooOrderId],
            'context' => ['no_price_recompute' => true],
        ]);
    }

    public static function draftOrder(int $odooOrderId): void
    {
        static::post('/json/2/sale.order/action_draft', ['ids' => [$odooOrderId]]);
    }

    // ─── Update Odoo order header fields only (no order lines touched) ──────────
    // ─── Order line helpers (cabinet) ────────────────────────────────────────

    public static function writeOrderLine(int $lineId, array $vals): void
    {
        static::post('/json/2/sale.order.line/write', ['ids' => [$lineId], 'vals' => $vals]);
    }

    public static function unlinkOrderLines(array $lineIds): void
    {
        if (empty($lineIds)) return;
        static::post('/json/2/sale.order.line/unlink', ['ids' => array_values($lineIds)]);
    }

    public static function addOrderLine(int $orderId, int $productId, float $qty, float $price, string $name): void
    {
        static::post('/json/2/sale.order.line/create', [
            'vals_list' => [[
                'order_id'        => $orderId,
                'product_id'      => $productId,
                'product_uom_qty' => $qty,
                'price_unit'      => $price,
                'name'            => $name,
            ]],
            'context' => ['no_price_recompute' => true],
        ]);
    }

    public static function bulkAddOrderLines(int $orderId, array $lines): void
    {
        if (empty($lines)) return;
        $vals = array_map(fn($l) => array_merge(['order_id' => $orderId], $l), $lines);
        static::post('/json/2/sale.order.line/create', [
            'vals_list' => $vals,
            'context'   => ['no_price_recompute' => true],
        ]);
    }

    // Used by the cabinet for orders without a local record.
    // Fields: rental dates, guests, addresses, car counts. Order lines stay unchanged.

    public static function updateOrderHeaderFields(int $odooOrderId, array $fields): void
    {
        // Selection fields must be written one-by-one because Odoo rejects invalid values per-field.
        // Rental date fields are separated so a write failure there doesn't block x_studio_* updates.
        $selections  = ['x_studio_boat_name', 'x_studio_route_new', 'x_studio_lunch',
                        'x_studio_tour_type', 'x_studio_car_type', 'x_studio_payment_source'];
        $rentalDates = ['rental_start_date', 'rental_return_date'];

        $regular = [];
        $dates   = [];

        foreach ($fields as $k => $value) {
            if (in_array($k, $rentalDates)) {
                $dates[$k] = $value;
            } elseif (in_array($k, $selections)) {
                if ($value !== false && $value !== '') {
                    try {
                        static::post('/json/2/sale.order/write', ['ids' => [$odooOrderId], 'vals' => [$k => $value]]);
                    } catch (\Exception $e) {
                        Log::warning("OdooService::updateOrderHeaderFields — {$k} skipped", ['error' => $e->getMessage()]);
                    }
                }
            } else {
                $regular[$k] = $value;
            }
        }

        if (!empty($regular)) {
            static::post('/json/2/sale.order/write', ['ids' => [$odooOrderId], 'vals' => $regular]);
        }

        if (!empty($dates)) {
            try {
                static::post('/json/2/sale.order/write', ['ids' => [$odooOrderId], 'vals' => $dates]);
            } catch (\Exception $e) {
                Log::warning('OdooService::updateOrderHeaderFields — rental dates not written', ['error' => $e->getMessage()]);
            }
        }
    }

    // ─── Update existing Odoo order in-place (no cancel/recreate) ────────────
    // Used by the cabinet when a client edits their booking.
    // Flow: if confirmed → cancel → draft → delete lines → write fields + add lines → confirm.

    public static function updateInPlace(Order $order, int $odooOrderId): void
    {
        $order->loadMissing(['tours', 'boat.company', 'transfer', 'cover', 'route', 'program', 'restaurant', 'method']);

        // 1. Read current state and deposit from Odoo
        $current = static::post('/json/2/sale.order/search_read', [
            'domain'  => [['id', '=', $odooOrderId]],
            'context' => ['active_test' => false],
            'fields'  => ['state', 'x_studio_deposit', 'order_line'],
            'limit'   => 1,
        ]);

        if (empty($current[0])) {
            throw new \RuntimeException("Odoo order #{$odooOrderId} not found");
        }

        $state        = $current[0]['state'] ?? 'draft';
        $odooDeposit  = (float) ($current[0]['x_studio_deposit'] ?? 0);
        $lineIds      = array_filter((array) ($current[0]['order_line'] ?? []));
        $wasConfirmed = $state === 'sale';

        // 2. To edit lines the order must be in draft state
        if ($wasConfirmed) {
            static::post('/json/2/sale.order/action_cancel', ['ids' => [$odooOrderId]]);
            static::post('/json/2/sale.order/action_draft',  ['ids' => [$odooOrderId]]);
        }

        // 3. Delete existing order lines
        if (!empty($lineIds)) {
            static::post('/json/2/sale.order.line/unlink', ['ids' => array_values($lineIds)]);
        }

        // 4. Update header fields
        $data       = static::buildOrderData($order);
        $lead       = $data['lead'];
        $transferId = (int) $lead['transfer_id'];
        $members    = (int) $lead['members'];

        $rentalStart = Carbon::parse($lead['travel_date'] . ' ' . $lead['route_start'], 'Asia/Makassar')->utc()->format('Y-m-d H:i:s');
        $rentalEnd   = Carbon::parse($lead['travel_date'] . ' ' . $lead['route_end'],   'Asia/Makassar')->utc()->format('Y-m-d H:i:s');

        $localDeposit = (float) ($order->deposite_summ ?? 0);

        $vals = [
            'rental_start_date'         => $rentalStart,
            'rental_return_date'        => $rentalEnd,
            'x_studio_adults'           => $lead['adults'],
            'x_studio_kids'             => $lead['kids'],
            'x_studio_count_of_people'  => $members,
            'x_studio_pickup_address'   => $lead['pickup_address'],
            'x_studio_drop_off_address' => $lead['dropoff_address'],
            'x_studio_special_requests' => $lead['special_requests'],
            'x_studio_deposit'          => max($odooDeposit, $localDeposit),
            'x_studio_donation_to_orphanage' => $lead['donation_amount'],
            'x_studio_pickup_cars'      => in_array($transferId, [1, 2]) ? (int) $lead['cars'] : 0,
            'x_studio_drop_off_cars'    => $transferId === 2 ? (int) $lead['cars'] : 0,
        ];

        static::post('/json/2/sale.order/write', [
            'ids'  => [$odooOrderId],
            'vals' => $vals,
        ]);

        // Selection fields — each in its own write so a bad value doesn't block the rest
        $selectionFields = [
            'x_studio_boat_name' => $lead['boat_name']       ?? '',
            'x_studio_route_new' => $lead['route_name']      ?? '',
            'x_studio_lunch'     => $lead['restaurant_name'] ?? '',
            'x_studio_tour_type' => $lead['tour_type']       ?? '',
            'x_studio_car_type'  => static::resolveCarType($transferId, $members),
        ];

        foreach ($selectionFields as $field => $value) {
            if ($value === false || $value === '') continue;
            try {
                static::post('/json/2/sale.order/write', [
                    'ids'  => [$odooOrderId],
                    'vals' => [$field => $value],
                ]);
            } catch (\Exception $e) {
                Log::warning("OdooService::updateInPlace — {$field} not set", [
                    'odoo_id' => $odooOrderId,
                    'value'   => $value,
                    'error'   => $e->getMessage(),
                ]);
            }
        }

        // 5. Add fresh order lines
        static::addOrderLines($order, $odooOrderId);

        // 6. Restore confirmed state
        if ($wasConfirmed) {
            static::confirmOrder($odooOrderId);
        }

        static::addLogNote($odooOrderId, static::buildOrderNote($order));

        Log::info('OdooService::updateInPlace — done', [
            'odoo_id'  => $odooOrderId,
            'order_id' => $order->id,
            'state'    => $wasConfirmed ? 'restored to sale' : 'left in draft',
        ]);
    }

    // ─── Get order collect amount ─────────────────────────────────────────────

    // ─── Search orders in Odoo ───────────────────────────────────────────────

    public static function searchOrders(string $search = '', int $limit = 20, int $offset = 0): array
    {
        $domain = [];

        if ($search) {
            $domain = [
                '|', '|', '|',
                ['client_order_ref',   'ilike', $search],
                ['partner_id.name',    'ilike', $search],
                ['partner_id.email',   'ilike', $search],
                ['x_studio_boat_name', 'ilike', $search],
            ];
        }

        return static::post('/json/2/sale.order/search_read', [
            'domain' => $domain,
            'fields' => [
                'id', 'name', 'state', 'client_order_ref',
                'partner_id',
                'rental_start_date',
                'x_studio_boat_name',
                'x_studio_adults', 'x_studio_kids', 'x_studio_count_of_people',
                'x_studio_deposit', 'x_studio_collect',
            ],
            'limit'  => $limit,
            'offset' => $offset,
            'order'  => 'id desc',
        ]) ?: [];
    }

    public static function countOrders(string $search = ''): int
    {
        $domain = [];

        if ($search) {
            $domain = [
                '|', '|', '|',
                ['client_order_ref',   'ilike', $search],
                ['partner_id.name',    'ilike', $search],
                ['partner_id.email',   'ilike', $search],
                ['x_studio_boat_name', 'ilike', $search],
            ];
        }

        // Use search_read with only 'id' to count — more portable than search_count
        $result = static::post('/json/2/sale.order/search_read', [
            'domain' => $domain,
            'fields' => ['id'],
            'limit'  => 0, // 0 = no limit → returns all IDs for counting
        ]);

        return is_array($result) ? count($result) : 0;
    }

    // ─── Get all order lines for a list of order IDs (one Odoo call) ────────────

    public static function getLinesForOrders(array $orderIds): array
    {
        if (empty($orderIds)) return [];

        $lines = static::post('/json/2/sale.order.line/search_read', [
            'domain' => [['order_id', 'in', array_values($orderIds)]],
            'fields' => ['id', 'order_id', 'name', 'product_uom_qty', 'price_unit'],
            'limit'  => count($orderIds) * 20,
        ]) ?: [];

        $grouped = [];
        foreach ($lines as $line) {
            $oid = is_array($line['order_id']) ? $line['order_id'][0] : (int)$line['order_id'];
            $grouped[$oid][] = $line;
        }

        return $grouped;
    }

    // ─── Get orders for a date range (UTC) — daily leads/briefing view ─────────

    public static function getLeadsForDate(string $startUtc, string $endUtc, int $limit = 0, int $offset = 0): array
    {
        $params = [
            'domain' => [
                ['rental_start_date', '>=', $startUtc],
                ['rental_start_date', '<=', $endUtc],
                ['state', '=', 'sale'],
            ],
            'fields' => [
                'id', 'name', 'state', 'partner_id',
                'rental_start_date',
                'x_studio_source',
                'x_studio_boat_name',
                'x_studio_route_new',
                'x_studio_tour_type',
                'x_studio_lunch',
                'x_studio_car_type',
                'x_studio_pickup_cars', 'x_studio_drop_off_cars',
                'x_studio_pickup_address', 'x_studio_drop_off_address',
                'x_studio_passenger_list',
                'x_studio_kids', 'x_studio_adults', 'x_studio_count_of_people',
                'x_studio_payment_source',
                'x_studio_collect', 'x_studio_deposit',
                'amount_total',
                'x_studio_guide_1_1', 'x_studio_guide_2_1',
                'x_studio_special_requests',
                'x_studio_dietary_requirements',
                'x_studio_first_class_menu_selection',
                'x_studio_customer_checked_in_and_cleared',
                'x_studio_checked_in_by',
                'x_studio_no_show_1',
                'x_studio_collected_by_cash',
                'x_studio_collected_by_edcbank',
                'x_studio_group_lanyard_color',
                'x_studio_boat_status',
            ],
            'order' => 'rental_start_date asc',
        ];

        if ($limit > 0) {
            $params['limit']  = $limit;
            $params['offset'] = $offset;
        }

        return static::post('/json/2/sale.order/search_read', $params) ?: [];
    }

    public static function countLeadsForDate(string $startUtc, string $endUtc): int
    {
        $result = static::post('/json/2/sale.order/search_count', [
            'domain' => [
                ['rental_start_date', '>=', $startUtc],
                ['rental_start_date', '<=', $endUtc],
                ['state', '=', 'sale'],
            ],
        ]);
        return is_int($result) ? $result : 0;
    }

    // ─── Read res.partner contacts by IDs ────────────────────────────────────

    public static function readPartners(array $ids): array
    {
        if (empty($ids)) return [];
        $result = static::post('/json/2/res.partner/read', [
            'ids'    => array_values($ids),
            'fields' => ['id', 'name', 'email', 'phone'],
        ]);
        if (!is_array($result)) return [];
        return array_column($result, null, 'id');
    }

    // ─── Update fields directly on existing Odoo order ───────────────────────

    public static function updateOrderFields(int $odooOrderId, array $fields): void
    {
        static::post('/json/2/sale.order/write', [
            'ids'  => [$odooOrderId],
            'vals' => $fields,
        ]);

    }

    /**
     * Keep order line quantities in sync after a passenger-count-only field
     * update (admin editing x_studio_adults/x_studio_kids directly, without
     * a full recreateLead()). Only the lines that actually scale with
     * headcount need touching:
     *  - shared tour line: qty = members, price_unit recomputed from the
     *    tier pricelist so qty × price_unit still equals the group total
     *  - transfer line (types 1/2 only): qty = cars = ceil(members / 5)
     * Private tours and transfers that don't need cars (free shuttle, none)
     * are left untouched since their line qty doesn't depend on headcount.
     */
    public static function syncOrderLineQuantities(Order $order, int $odooOrderId, int $members): void
    {
        $order->loadMissing(['tours.packages', 'tours.pricesbydates.packages', 'transfer']);

        $tour = $order->tours;
        if (!$tour) {
            return;
        }

        $isShared = (int) $tour->classes_id === 9;

        $lines = static::post('/json/2/sale.order.line/search_read', [
            'domain' => [['order_id', '=', $odooOrderId]],
            'fields' => ['id', 'product_id'],
        ]);

        if (empty($lines)) {
            return;
        }

        $tourOdooId     = $tour->odoo_id;
        $transferOdooId = optional($order->transfer)->odoo_id;

        foreach ($lines as $line) {
            $productId = is_array($line['product_id'] ?? null) ? $line['product_id'][0] : ($line['product_id'] ?? null);
            if (!$productId) {
                continue;
            }

            if ($isShared && $tourOdooId && (int) $productId === (int) $tourOdooId) {
                $pricelist = $tour->packages?->pricelist ?? [];
                if ($order->travel_date && $tour->pricesbydates->isNotEmpty()) {
                    $seasonal = $tour->pricesbydates->first(
                        fn($pbd) => $order->travel_date >= $pbd->date_start && $order->travel_date <= $pbd->date_end
                    );
                    if ($seasonal?->packages?->pricelist) {
                        $pricelist = $seasonal->packages->pricelist;
                    }
                }

                $tierPrice = 0;
                if (!empty($pricelist)) {
                    $sorted    = collect($pricelist)->sortBy(fn($p) => (int) $p['members_count']);
                    $entry     = $sorted->last(fn($p) => (int) $p['members_count'] <= $members) ?? $sorted->first();
                    $tierPrice = (int) ($entry['price'] ?? 0);
                }

                static::post('/json/2/sale.order.line/write', [
                    'ids'  => [$line['id']],
                    'vals' => [
                        'product_uom_qty' => $members,
                        'price_unit'      => $members > 0 ? $tierPrice / $members : 0.0,
                    ],
                ]);
                continue;
            }

            if ($transferOdooId && in_array((int) $order->transfer_id, [1, 2]) && (int) $productId === (int) $transferOdooId) {
                static::post('/json/2/sale.order.line/write', [
                    'ids'  => [$line['id']],
                    'vals' => ['product_uom_qty' => max(1, (int) ceil($members / 5))],
                ]);
            }
        }
    }

    // ─── Get full order data from Odoo ───────────────────────────────────────

    public static function getFullOrder(int $odooOrderId): array
    {
        $orders = static::post('/json/2/sale.order/search_read', [
            'domain'  => [['id', '=', $odooOrderId]],
            // Cancelled/archived rental orders have active=false in Odoo —
            // without this they're invisible to search_read even though the
            // record exists and opens fine directly by URL in the Odoo UI.
            'context' => ['active_test' => false],
            'fields' => [
                'id', 'name', 'state', 'partner_id',
                'rental_start_date',
                'x_studio_source',
                'x_studio_boat_name',
                'x_studio_route_new',
                'x_studio_tour_type',
                'x_studio_lunch',
                'x_studio_car_type',
                'x_studio_pickup_cars', 'x_studio_drop_off_cars',
                'x_studio_pickup_address', 'x_studio_drop_off_address',
                'x_studio_passenger_list',
                'x_studio_kids', 'x_studio_adults', 'x_studio_count_of_people',
                'x_studio_payment_source',
                'x_studio_collect', 'x_studio_deposit',
                'amount_total',
                'x_studio_guide_1_1', 'x_studio_guide_2_1',
                'x_studio_special_requests',
                'x_studio_online_check_in_complete',
                'x_studio_customer_checked_in_and_cleared',
                'x_studio_checked_in_by',
                'x_studio_no_show_1',
                'x_studio_collected_by_cash',
                'x_studio_collected_by_edcbank',
                'x_studio_group_lanyard_color',
                'x_studio_unique_key',
                'order_line',
            ],
            'limit'  => 1,
        ]);

        if (empty($orders[0])) {
            throw new \RuntimeException("Odoo order #{$odooOrderId} not found");
        }

        $order     = $orders[0];
        $lineIds   = array_filter((array) ($order['order_line'] ?? []));
        $lines     = [];

        if ($lineIds) {
            $lines = static::post('/json/2/sale.order.line/search_read', [
                'domain' => [['id', 'in', array_values($lineIds)]],
                'fields' => ['id', 'name', 'product_id', 'product_uom_qty', 'price_unit'],
                'limit'  => 50,
            ]);
        }

        $order['lines'] = $lines;
        return $order;
    }

    // ─── Cancel order in Odoo ────────────────────────────────────────────────

    public static function cancelOrder(int $odooOrderId): void
    {
        static::post('/json/2/sale.order/action_cancel', ['ids' => [$odooOrderId]]);

        Log::info('OdooService::cancelOrder — done', ['odoo_id' => $odooOrderId]);
    }

    // ─── Get order collect amount ─────────────────────────────────────────────

    public static function getOrderCollect(int $odooOrderId): float
    {
        $result = static::post('/json/2/sale.order/search_read', [
            'domain' => [['id', '=', $odooOrderId]],
            'fields' => ['x_studio_collect'],
            'limit'  => 1,
        ]);

        return (float) ($result[0]['x_studio_collect'] ?? 0);
    }

    public static function fetchTourType(int $odooOrderId): string
    {
        $result = static::post('/json/2/sale.order/search_read', [
            'domain' => [['id', '=', $odooOrderId]],
            'fields' => ['x_studio_tour_type'],
            'limit'  => 1,
        ]);

        return (string) ($result[0]['x_studio_tour_type'] ?? '');
    }

    public static function getOrderInfo(int $odooOrderId): array
    {
        $result = static::post('/json/2/sale.order/search_read', [
            'domain' => ['|', ['id', '=', $odooOrderId], ['name', '=', 'S' . $odooOrderId]],
            'fields' => ['id', 'name', 'state', 'x_studio_collect', 'amount_total', 'x_studio_deposit'],
            'limit'  => 1,
        ]);

        if (empty($result[0])) {
            Log::warning('OdooService::getOrderInfo — order not found in Odoo', ['odoo_id' => $odooOrderId, 'result' => $result]);
            throw new \RuntimeException('Order not found');
        }

        $row = $result[0];

        return [
            'state'   => $row['state'] ?? '',
            'collect' => (float) ($row['x_studio_collect'] ?? 0),
        ];
    }

    public static function registerPayment(int $odooOrderId, float $amount): void
    {
        $result = static::post('/json/2/sale.order/search_read', [
            'domain' => [['id', '=', $odooOrderId]],
            'fields' => ['x_studio_collected_by_xendit'],
            'limit'  => 1,
        ]);

        if (empty($result[0])) return;

        $currentCollected = (float) ($result[0]['x_studio_collected_by_xendit'] ?? 0);

        // x_studio_collect is a readonly field in Odoo computed from amount_total minus
        // all x_studio_collected_by_* fields, so updating collected_by_xendit alone is
        // enough to make it recalculate.
        static::post('/json/2/sale.order/write', [
            'ids'  => [$odooOrderId],
            'vals' => [
                'x_studio_collected_by_xendit' => $currentCollected + $amount,
            ],
        ]);

        static::addLogNote($odooOrderId,
            '<p>💳 Weblink payment received: <strong>' . number_format($amount, 0, '.', ',') . ' IDR</strong> via Xendit.</p>'
        );
    }

    protected static function buildOrderNote(Order $order): string
    {
        $fmt = fn($v) => htmlspecialchars((string)$v, ENT_QUOTES);

        $tour     = optional($order->tours);
        $boat     = optional($order->boat);
        $transfer = optional($order->transfer);
        $cover    = optional($order->cover);
        $route    = optional($order->route);
        $restaurant = optional($order->restaurant);

        $extras = [];
        $extrasRaw = $order->extras;
        if (!empty($extrasRaw)) {
            $extrasData = is_string($extrasRaw) ? json_decode($extrasRaw, true) : (array)$extrasRaw;
            foreach ($extrasData as $item) {
                $extras[] = $fmt($item['name'] ?? '—') . ' × ' . (int)($item['qty'] ?? $item['quantity'] ?? 1);
            }
        }

        $rows = [
            ['Website Order',  '#' . $fmt($order->id) . ' / ' . $fmt($order->external_id)],
            ['Customer',       $fmt($order->name)],
            ['Email',          $fmt($order->email)],
            ['WhatsApp',       $fmt($order->whatsapp ?? '—')],
            ['Tour',           $fmt($tour->name ?? '—')],
            ['Boat',           $fmt($boat->name ?? '—')],
            ['Date',           $fmt($order->travel_date)],
            ['Route',          $fmt($route->odoo_name ?? $route->name ?? '—')],
            ['Restaurant',     $fmt($restaurant->name ?? '—')],
            ['Adults',         (int)($order->adults ?? 0)],
            ['Kids',           (int)($order->kids ?? 0)],
            ['Transfer',       $fmt($transfer->name ?? 'No transfer')],
            ['Pickup address', $fmt($order->pickup_address ?? '—')],
            ['Dropoff address',$fmt($order->dropoff_address ?? '—')],
            ['Cars',           (int)($order->cars ?? 0)],
            ['Cover',          $fmt($cover->name ?? '—')],
            ['Extras',         $extras ? implode('<br/>', $extras) : '—'],
            ['Total',          number_format((float)($order->total_price ?? 0), 0, '.', ',') . ' IDR'],
            ['Deposit paid',   number_format((float)($order->deposite_summ ?? 0), 0, '.', ',') . ' IDR'],
            ['Payment method', $fmt(optional($order->method)->name ?? '—')],
            ['Special requests', $fmt($order->requests ?? '—')],
        ];

        $trs = '';
        foreach ($rows as [$label, $value]) {
            $trs .= '<tr>'
                . '<td style="padding:3px 8px;font-weight:bold;white-space:nowrap;vertical-align:top">' . $label . '</td>'
                . '<td style="padding:3px 8px;vertical-align:top">' . $value . '</td>'
                . '</tr>';
        }

        return '<p><strong>📋 Order from Bluuu website</strong></p>'
            . '<table style="border-collapse:collapse;font-size:13px">' . $trs . '</table>';
    }

    public static function addLogNote(int $odooOrderId, string $html): void
    {
        try {
            static::post('/json/2/sale.order/message_post', [
                'ids'           => [$odooOrderId],
                'body'          => $html,
                'body_is_html'  => true,
                'message_type'  => 'comment',
                'subtype_xmlid' => 'mail.mt_note',
            ]);
        } catch (\Exception $e) {
            Log::warning('OdooService::addLogNote failed', [
                'odoo_id' => $odooOrderId,
                'error'   => $e->getMessage(),
            ]);
        }
    }

    // ─── Build data array ─────────────────────────────────────────────────────

    public static function buildOrderData(Order $order): array
    {
        $order->loadMissing(['tours', 'boat.company', 'transfer', 'cover', 'route', 'program', 'restaurant', 'source']);

        $tour    = $order->tours;
        $boat    = $order->boat;
        $company = optional($boat)->company;

        $date = Carbon::parse($order->travel_date)->format('Y-m-d');

        // ── Lead / order fields ───────────────────────────────────────────────
        $lead = [
            'boat_name'        => optional($boat)->name ?? '',
            'company_odoo_id'  => $company && $company->odoo_id ? (int) $company->odoo_id : null,
            'adults'           => (int)($order->adults  ?? 0),
            'kids'             => (int)($order->kids    ?? 0),
            'members'          => (int)($order->members ?? 0),
            'travel_date'      => $date,
            'pickup_address'   => $order->pickup_address  ?? '',
            'dropoff_address'  => $order->dropoff_address ?? '',
            'special_requests' => $order->requests ?? '',
            'cars'             => (int)($order->cars ?? 0),
            'transfer_type'    => optional($order->transfer)->type ?? '',
            'route_name'       => optional($order->route)->odoo_name ?? '',
            'route_start'      => optional($order->route)->start ?? '08:00:00',
            'route_end'        => optional($order->route)->end   ?? '18:00:00',
            'restaurant_name'  => optional($order->restaurant)->odoo_name ?? '',
            'deposite_summ'    => (float)($order->deposite_summ ?? 0),
            'donation_amount'  => (float)($order->donation_amount ?? 0),
            'total_price'      => (float)($order->total_price   ?? 0),
            'name'             => $order->name,
            'email'            => $order->email,
            'whatsapp'         => $order->whatsapp    ?? '',
            'external_id'      => $order->external_id ?? '',
            'order_id'         => $order->id,
            'transfer_id'      => (int) $order->transfer_id,
            'car_type'         => optional($order->transfer)->odoo_name ?: 'No Transfer',
            'tour_type'        => $tour->odoo_type ?? '',
            'source_name'      => optional($order->source)->name ?? '',
        ];

        // ── Products ──────────────────────────────────────────────────────────
        $lines = [];

        // 1. Boat — qty 1, price 0
        if ($boat && $boat->odoo_id) {
            $lines[] = [
                'label'      => 'boat',
                'product_id' => (int) $boat->odoo_id,
                'qty'        => 1,
                'price'      => 0,
            ];
        }

        // 2. Tour — qty 1, price = tour_price + boat_price
        if ($tour && $tour->odoo_id) {
            $lines[] = [
                'label'      => 'tour',
                'product_id' => (int) $tour->odoo_id,
                'qty'        => 1,
                'price'      => (float)(($order->tour_price ?? 0) + ($order->boat_price ?? 0)),
            ];
        }

        // 3. Transfer
        if ($order->transfer_id && $order->transfer && $order->transfer->odoo_id) {
            $lines[] = [
                'label'      => 'transfer',
                'product_id' => (int) $order->transfer->odoo_id,
                'qty'        => 1,
                'price'      => (float)($order->transfer_price ?? $order->transfer->price ?? 0),
            ];
        }

        // 4. Cover
        if ($order->cover_id && $order->cover && $order->cover->odoo_id) {
            $people = max(1, $lead['adults'] + $lead['kids']);
            $lines[] = [
                'label'      => 'cover',
                'product_id' => (int) $order->cover->odoo_id,
                'qty'        => $order->cover->per_boat ? 1 : $people,
                'price'      => (float)($order->cover_price ?? $order->cover->price ?? 0),
            ];
        }

        // 5. Restaurant
        if ($order->restaurant_id && $order->restaurant && $order->restaurant->odoo_id) {
            $lines[] = [
                'label'      => 'restaurant',
                'product_id' => (int) $order->restaurant->odoo_id,
                'qty'        => 1,
                'price'      => 0,
            ];
        }

        // 6. Extras — no relation, fetch odoo_id from Extras model by id
        $extrasRaw = $order->extras;
        if (!empty($extrasRaw)) {
            $extrasData = is_string($extrasRaw)
                ? json_decode($extrasRaw, true)
                : (array) $extrasRaw;

            $extraIds = array_filter(array_column($extrasData, 'id'));

            if ($extraIds) {
                $extraModels = Extras::whereIn('id', $extraIds)
                    ->get()
                    ->keyBy('id');

                foreach ($extrasData as $item) {
                    $extra = $extraModels->get($item['id'] ?? null);
                    if (!$extra || !$extra->odoo_id) continue;

                    $lines[] = [
                        'label'      => 'extra:' . ($item['name'] ?? $extra->name ?? $item['id']),
                        'product_id' => (int) $extra->odoo_id,
                        'qty'        => (int)($item['qty'] ?? $item['quantity'] ?? 1),
                        'price'      => (float)($item['price'] ?? $extra->price ?? 0),
                    ];
                }
            }
        }

        return [
            'lead'  => $lead,
            'lines' => $lines,
        ];
    }

    // ─── Step 1: Customer ─────────────────────────────────────────────────────

    protected static function createOrFindPartner(Order $order): int
    {
        $found = static::post('/json/2/res.partner/search_read', [
            'domain' => [['email', '=', $order->email]],
            'fields' => ['id'],
            'limit'  => 1,
        ]);

        if (!empty($found[0]['id'])) {
            $partnerId = (int) $found[0]['id'];

            $updateVals = [];
            if (!empty($order->name))     $updateVals['name']  = $order->name;
            if (!empty($order->whatsapp)) $updateVals['phone'] = $order->whatsapp;

            if (!empty($updateVals)) {
                static::post('/json/2/res.partner/write', [
                    'ids'  => [$partnerId],
                    'vals' => $updateVals,
                ]);
            }

            return $partnerId;
        }

        $id = static::post('/json/2/res.partner/create', [
            'vals_list' => [[
                'name'  => $order->name,
                'email' => $order->email,
                'phone' => $order->whatsapp ?? '',
            ]],
        ]);

        return (int) (is_array($id) ? $id[0] : $id);
    }

    // ─── Step 2: Sale order ───────────────────────────────────────────────────

    protected static function createSaleOrder(array $data, int $partnerId): int
    {
        $lead = $data['lead'];

        // Non-selection fields only — safe to include in create
        $rentalStart = Carbon::parse($lead['travel_date'] . ' ' . $lead['route_start'], 'Asia/Makassar')->utc()->format('Y-m-d H:i:s');
        $rentalEnd   = Carbon::parse($lead['travel_date'] . ' ' . $lead['route_end'],   'Asia/Makassar')->utc()->format('Y-m-d H:i:s');


        $vals = [
            'partner_id' => $partnerId,

            'is_rental_order'    => true,
            'rental_start_date'  => $rentalStart,
            'rental_return_date' => $rentalEnd,

            'x_studio_deposit'          => $lead['deposite_summ'],
            'x_studio_donation_to_orphanage' => $lead['donation_amount'],
            'x_studio_pickup_address'   => $lead['pickup_address'],
            'x_studio_drop_off_address' => $lead['dropoff_address'],
            'x_studio_special_requests' => $lead['special_requests'],
            'x_studio_adults'           => $lead['adults'],
            'x_studio_kids'             => $lead['kids'],
            'x_studio_count_of_people'  => $lead['members'],
            'client_order_ref'          => $lead['external_id'],
        ];

        if (!empty($lead['company_odoo_id'])) {
            $vals['company_id'] = $lead['company_odoo_id'];
        }

        $transferId = (int)$lead['transfer_id'];
        if (in_array($transferId, [1, 2])) {
            $vals['x_studio_pickup_cars'] = (int)$lead['cars'];
        }
        if ($transferId === 2) {
            $vals['x_studio_drop_off_cars'] = (int)$lead['cars'];
        }

        $id = static::post('/json/2/sale.order/create', ['vals_list' => [$vals]]);

        $odooId = (int) (is_array($id) ? $id[0] : $id);

        // Selection fields — set via separate writes, each with own try-catch
        $selectionFields = [
            'x_studio_boat_name'      => $lead['boat_name']              ?? '',
            'x_studio_route_new'      => $lead['route_name']             ?? '',
            'x_studio_lunch'          => $lead['restaurant_name']        ?? '',
            'x_studio_payment_source' => $lead['payment_source']         ?? '',
            'x_studio_tour_type'      => $lead['tour_type']              ?? '',
            'x_studio_source'         => $lead['source_name']            ?? '',
            'x_studio_car_type'       => $lead['car_type']               ?? false,
        ];

        foreach ($selectionFields as $field => $value) {
            if ($value === false || $value === '') continue;
            try {
                static::post('/json/2/sale.order/write', [
                    'ids'  => [$odooId],
                    'vals' => [$field => $value],
                ]);
            } catch (\Exception $e) {
                Log::warning("OdooService: {$field} not set", [
                    'odoo_id' => $odooId,
                    'value'   => $value,
                    'error'   => $e->getMessage(),
                ]);
            }
        }

        return $odooId;
    }

    // ─── Step 4: Order lines ──────────────────────────────────────────────────

    protected static function addOrderLines(Order $order, int $odooOrderId): void
    {
        $order->loadMissing(['tours', 'boat', 'transfer', 'cover', 'restaurant']);

        $isShared = optional($order->tours)->classes_id == 9;
        $members  = (int)($order->members ?? 0);
        $cars     = (int)($order->cars    ?? 0);

        $vals = [];

        // 1. Boat — qty 1, price 0
        if ($order->boat && $order->boat->odoo_id) {
            $vals[] = [
                'order_id'        => $odooOrderId,
                'name'            => $order->boat->name ?? 'Boat',
                'product_id'      => (int) $order->boat->odoo_id,
                'product_uom_qty' => 1,
                'price_unit'      => 0.0,
            ];
        }

        // 2. Tour
        if ($order->tours && $order->tours->odoo_id) {
            if ($isShared) {
                $qty   = $members;
                $price = $members > 0 ? (float)($order->tour_price ?? 0) / $members : 0.0;
            } else {
                $qty   = 1;
                $price = (float)(($order->tour_price ?? 0) + ($order->boat_price ?? 0));
            }
            $vals[] = [
                'order_id'        => $odooOrderId,
                'name'            => $order->tours->name ?? 'Tour',
                'product_id'      => (int) $order->tours->odoo_id,
                'product_uom_qty' => $qty,
                'price_unit'      => $price,
            ];
        }

        // 3. Transfer
        if (!$order->transfer_id || !$order->transfer) {
            $vals[] = [
                'order_id'        => $odooOrderId,
                'name'            => 'Transfer',
                'product_id'      => 23,
                'product_uom_qty' => 1,
                'price_unit'      => 0.0,
            ];
        } else {
            $vals[] = [
                'order_id'        => $odooOrderId,
                'name'            => $order->transfer->name ?? 'Transfer',
                'product_id'      => (int) $order->transfer->odoo_id,
                'product_uom_qty' => max(1, $cars),
                'price_unit'      => (float)($order->transfer->price ?? 0),
            ];
        }

        // 4. Cover
        if ($order->cover_id && $order->cover && $order->cover->odoo_id) {
            $vals[] = [
                'order_id'        => $odooOrderId,
                'name'            => $order->cover->name ?? 'Cover',
                'product_id'      => (int) $order->cover->odoo_id,
                'product_uom_qty' => $isShared ? $members : 1,
                'price_unit'      => (float)($order->cover->price ?? 0),
            ];
        }

        // 5. Restaurant
        if ($order->restaurant_id && $order->restaurant && $order->restaurant->odoo_id) {
            $vals[] = [
                'order_id'        => $odooOrderId,
                'name'            => $order->restaurant->name ?? 'Restaurant',
                'product_id'      => (int) $order->restaurant->odoo_id,
                'product_uom_qty' => $members,
                'price_unit'      => 0.0,
            ];
        }

        // 6. Extras
        $extrasRaw = $order->extras;
        if (!empty($extrasRaw)) {
            $extrasData = is_string($extrasRaw)
                ? json_decode($extrasRaw, true)
                : (array) $extrasRaw;

            $extraIds = array_filter(array_column($extrasData, 'id'));

            if ($extraIds) {
                $extraModels = Extras::whereIn('id', $extraIds)->get()->keyBy('id');

                foreach ($extrasData as $item) {
                    $extra = $extraModels->get($item['id'] ?? null);
                    if (!$extra || !$extra->odoo_id) continue;

                    $vals[] = [
                        'order_id'        => $odooOrderId,
                        'name'            => $item['name'] ?? $extra->name ?? 'Extra',
                        'product_id'      => (int) $extra->odoo_id,
                        'product_uom_qty' => (int)($item['qty'] ?? $item['quantity'] ?? 1),
                        'price_unit'      => (float)($item['price'] ?? $extra->price ?? 0),
                    ];
                }
            }
        }

        if (empty($vals)) return;

        static::post('/json/2/sale.order.line/create', [
            'vals_list' => $vals,
            'context'   => ['no_price_recompute' => true],
        ]);
    }

    // ─── Resolve car type for Odoo ────────────────────────────────────────────

    protected static function resolveCarType(int $transferId, int $members): mixed
    {
        if ($transferId === 3) return 'Free Shuttle Bus';
        if (in_array($transferId, [1, 2])) {
            return $members > 5 ? 'Private Hi-Ace' : 'Private Car';
        }
        return false;
    }

    // ─── HTTP helper ──────────────────────────────────────────────────────────

    public static function post(string $endpoint, array $body, int $maxRetries = 3)
    {
        $attempt = 0;
        $delay   = 2; // seconds

        while (true) {
            $response = Http::withHeaders([
                    'Authorization'   => 'bearer ' . static::apiKey(),
                    'X-Odoo-Database' => static::db(),
                ])
                ->timeout(60)
                ->connectTimeout(15)
                ->post(static::url() . $endpoint, $body);

            if ($response->successful()) {
                $json = $response->json();

                // Odoo sometimes returns 200 with {"error": {...}} in JSON-RPC
                if (isset($json['error'])) {
                    $errorMsg = $json['error']['data']['message']
                        ?? $json['error']['message']
                        ?? json_encode($json['error']);

                    Log::error('OdooService JSON-RPC error', [
                        'endpoint' => $endpoint,
                        'request'  => $body,
                        'error'    => $errorMsg,
                        'full'     => $json['error'],
                    ]);
                    throw new \RuntimeException('Odoo JSON-RPC error: ' . $errorMsg);
                }

                return $json;
            }

            if ($response->status() === 429 && $attempt < $maxRetries) {
                $attempt++;
                Log::warning('OdooService rate limited, retrying', [
                    'endpoint' => $endpoint,
                    'attempt'  => $attempt,
                    'delay'    => $delay,
                    'response' => $response->body(),
                ]);
                sleep($delay);
                $delay *= 2;
                continue;
            }

            Log::error('OdooService HTTP error', [
                'endpoint' => $endpoint,
                'status'   => $response->status(),
                'request'  => $body,
                'response' => $response->body(),
            ]);
            throw new \RuntimeException('Odoo API error ' . $response->status() . ': ' . $response->body());
        }
    }
}
