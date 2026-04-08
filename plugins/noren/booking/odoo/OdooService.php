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
        return match ((int) $order->method_id) {
            1 => 'Xendit',
            2 => 'PayPal',
            default => '',
        };
    }

    /**
     * Cancel the existing Odoo order and create a brand-new one from the current
     * local order state. Used by the admin interface so that ANY change (products,
     * extras, transfer, boat, dates…) is fully reflected in Odoo.
     *
     * Preserves the deposit: if the Odoo order already has a higher deposit
     * (web payments were registered there), that amount is copied to the new order.
     */
    public static function recreateLead(Order $order): array
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
        $order->loadMissing(['tours', 'boat.company', 'transfer', 'cover', 'route', 'program', 'restaurant']);

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
                'vals' => [
                    'x_studio_deposit' => $odooDeposit,
                    'x_studio_collect' => max(0.0, (float) ($order->total_price ?? 0) - $odooDeposit),
                ],
            ]);
        }

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

    public static function createLead(Order $order): array
    {
        $order->loadMissing(['tours', 'boat.company', 'transfer', 'cover', 'route', 'program', 'restaurant']);

        $data = static::buildOrderData($order);
        $data['lead']['payment_source'] = static::paymentSource($order);

        $partnerId   = static::createOrFindPartner($order);
        $odooOrderId = static::createSaleOrder($data, $partnerId);
        static::addOrderLines($order, $odooOrderId);

        return [
            'partner_id' => $partnerId,
            'order_id'   => $odooOrderId,
        ];
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
                'x_studio_route',
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

    // ─── Update fields directly on existing Odoo order ───────────────────────

    public static function updateOrderFields(int $odooOrderId, array $fields): void
    {
        static::post('/json/2/sale.order/write', [
            'ids'  => [$odooOrderId],
            'vals' => $fields,
        ]);

        Log::info('OdooService::updateOrderFields', [
            'odoo_id' => $odooOrderId,
            'fields'  => array_keys($fields),
        ]);
    }

    // ─── Get full order data from Odoo ───────────────────────────────────────

    public static function getFullOrder(int $odooOrderId): array
    {
        $orders = static::post('/json/2/sale.order/search_read', [
            'domain' => [['id', '=', $odooOrderId]],
            'fields' => [
                'id', 'name', 'state', 'client_order_ref',
                'partner_id', 'company_id',
                'rental_start_date', 'rental_return_date',
                'x_studio_boat_name',
                'x_studio_pickup_address', 'x_studio_drop_off_address',
                'x_studio_pickup_cars', 'x_studio_drop_off_cars',
                'x_studio_adults', 'x_studio_kids', 'x_studio_count_of_people',
                'x_studio_route',
                'x_studio_deposit', 'x_studio_collect',
                'x_studio_payment_source', 'x_studio_free_shuttle_bus',
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

    public static function getOrderInfo(int $odooOrderId): array
    {
        $result = static::post('/json/2/sale.order/search_read', [
            'domain' => [['id', '=', $odooOrderId]],
            'fields' => ['state', 'x_studio_collect'],
            'limit'  => 1,
        ]);

        if (empty($result[0])) {
            throw new \RuntimeException('Order not found');
        }

        return [
            'state'   => $result[0]['state'] ?? '',
            'collect' => (float) ($result[0]['x_studio_collect'] ?? 0),
        ];
    }

    /**
     * Called after a weblink (bluuu) payment is confirmed via Xendit callback.
     * Finds the Odoo sale order via $order->odoo_id, then:
     *   - increases x_studio_deposit by $amount
     *   - decreases x_studio_collect by $amount (floored at 0)
     */
    public static function registerWebPayment(Order $order, float $amount): void
    {
        $odooOrderId = (int) $order->odoo_id;

        if (!$odooOrderId) {
            Log::warning('OdooService::registerWebPayment — order has no odoo_id', ['order_id' => $order->id]);
            return;
        }

        $result = static::post('/json/2/sale.order/search_read', [
            'domain' => [['id', '=', $odooOrderId]],
            'fields' => ['x_studio_deposit', 'x_studio_collect'],
            'limit'  => 1,
        ]);

        if (empty($result[0])) {
            Log::warning('OdooService::registerWebPayment — odoo order not found', ['odoo_id' => $odooOrderId]);
            return;
        }

        $currentDeposit = (float) ($result[0]['x_studio_deposit'] ?? 0);
        $currentCollect = (float) ($result[0]['x_studio_collect'] ?? 0);

        static::post('/json/2/sale.order/write', [
            'ids'  => [$odooOrderId],
            'vals' => [
                'x_studio_deposit' => $currentDeposit + $amount,
                'x_studio_collect' => max(0.0, $currentCollect - $amount),
            ],
        ]);

        Log::info('OdooService::registerWebPayment — done', [
            'odoo_id'         => $odooOrderId,
            'amount'          => $amount,
            'deposit_before'  => $currentDeposit,
            'collect_before'  => $currentCollect,
        ]);
    }

    public static function registerPayment(int $odooOrderId, float $amount): void
    {
        $result = static::post('/json/2/sale.order/search_read', [
            'domain' => [['id', '=', $odooOrderId]],
            'fields' => ['x_studio_deposit', 'x_studio_collect'],
            'limit'  => 1,
        ]);

        if (empty($result[0])) return;

        $currentDeposit = (float) ($result[0]['x_studio_deposit'] ?? 0);

        static::post('/json/2/sale.order/write', [
            'ids'  => [$odooOrderId],
            'vals' => [
                'x_studio_deposit' => $currentDeposit + $amount,
                'x_studio_collect' => 0,
            ],
        ]);
    }

    // ─── Build data array ─────────────────────────────────────────────────────

    public static function buildOrderData(Order $order): array
    {
        $order->loadMissing(['tours', 'boat.company', 'transfer', 'cover', 'route', 'program', 'restaurant']);

        $tour    = $order->tours;
        $boat    = $order->boat;
        $company = optional($boat)->company;

        $date = Carbon::parse($order->travel_date)->format('Y-m-d');

        // ── Lead / order fields ───────────────────────────────────────────────
        $lead = [
            'boat_name'       => optional($boat)->name ?? '',
            'company_odoo_id' => $company && $company->odoo_id ? (int) $company->odoo_id : null,
            'adults'          => (int)($order->adults  ?? 0),
            'kids'            => (int)($order->kids    ?? 0),
            'members'         => (int)($order->members ?? 0),
            'travel_date'     => $date,
            'pickup_address'  => $order->pickup_address  ?? '',
            'dropoff_address' => $order->dropoff_address ?? '',
            'cars'            => (int)($order->cars ?? 0),
            'transfer_type'   => optional($order->transfer)->type ?? '',
            'route_name'      => optional($order->route)->name ?? optional($order->program)->name ?? '',
            'route_start'     => optional($order->route)->start ?? '08:00:00',
            'route_end'       => optional($order->route)->end   ?? '18:00:00',
            'deposite_summ'   => (float)($order->deposite_summ ?? 0),
            'total_price'     => (float)($order->total_price   ?? 0),
            'name'            => $order->name,
            'email'           => $order->email,
            'whatsapp'        => $order->whatsapp    ?? '',
            'external_id'     => $order->external_id ?? '',
            'order_id'        => $order->id,
            'transfer_id'      => (int) $order->transfer_id,
            'free_shuttle_bus' => (int) $order->transfer_id === 3,
            'tour_type'        => $tour->odoo_type ?? '',
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

        $vals = [
            'partner_id' => $partnerId,

            'is_rental_order'    => true,
            'rental_start_date'  => Carbon::parse($lead['travel_date'] . ' ' . $lead['route_start'], 'Asia/Makassar')->utc()->format('Y-m-d H:i:s'),
            'rental_return_date' => Carbon::parse($lead['travel_date'] . ' ' . $lead['route_end'],   'Asia/Makassar')->utc()->format('Y-m-d H:i:s'),

            'x_studio_deposit'          => $lead['deposite_summ'],
            'x_studio_pickup_address'   => $lead['pickup_address'],
            'x_studio_boat_name'        => $lead['boat_name'],
            'x_studio_pickup_cars'      => in_array((int)$lead['transfer_id'], [1, 2]) ? 1 : 0,
            'x_studio_drop_off_cars'    => (int)$lead['transfer_id'] === 2 ? 1 : 0,
            'x_studio_car_type'         => static::resolveCarType((int)$lead['transfer_id'], (int)$lead['members']),
            'x_studio_drop_off_address' => $lead['dropoff_address'],
            'x_studio_adults'           => $lead['adults'],
            'x_studio_kids'             => $lead['kids'],
            'x_studio_count_of_people'  => $lead['members'],
            'x_studio_route'            => $lead['route_name'],
            'x_studio_collect'          => $lead['total_price'] - $lead['deposite_summ'],
            'x_studio_payment_source'   => $lead['payment_source'] ?? '',
            'client_order_ref'          => $lead['external_id'],
            'x_studio_free_shuttle_bus' => $lead['free_shuttle_bus'] ?? false,
            'x_studio_tour_type'        => $lead['tour_type'] ?? '',
        ];

        if (!empty($lead['company_odoo_id'])) {
            $vals['company_id'] = $lead['company_odoo_id'];
        }

        $id = static::post('/json/2/sale.order/create', ['vals_list' => [$vals]]);

        $odooId = (int) (is_array($id) ? $id[0] : $id);

        static::post('/json/2/sale.order/action_confirm', ['ids' => [$odooId]]);

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
            $price = $members < 6
                ? (float)($order->transfer->price     ?? 0)
                : (float)($order->transfer->bus_price ?? 0);
            $vals[] = [
                'order_id'        => $odooOrderId,
                'name'            => $order->transfer->name ?? 'Transfer',
                'product_id'      => (int) $order->transfer->odoo_id,
                'product_uom_qty' => max(1, $cars),
                'price_unit'      => $price,
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

        static::post('/json/2/sale.order.line/create', ['vals_list' => $vals]);
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
                ->timeout(30)
                ->post(static::url() . $endpoint, $body);

            if ($response->successful()) {
                return $response->json();
            }

            if ($response->status() === 429 && $attempt < $maxRetries) {
                $attempt++;
                Log::warning('OdooService rate limited, retrying', [
                    'endpoint' => $endpoint,
                    'attempt'  => $attempt,
                    'delay'    => $delay,
                ]);
                sleep($delay);
                $delay *= 2;
                continue;
            }

            Log::error('OdooService error', [
                'endpoint' => $endpoint,
                'status'   => $response->status(),
                'body'     => $response->body(),
            ]);
            throw new \RuntimeException('Odoo API error ' . $response->status() . ': ' . $response->body());
        }
    }
}
