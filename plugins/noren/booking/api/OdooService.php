<?php namespace Noren\Booking\Api;

use Http;
use Log;
use Noren\Booking\Models\Order;
use Noren\Booking\Models\Extras;

class OdooService
{
    protected static string $url    = 'https://pt-day-trip-bali.odoo.com';
    protected static string $db     = 'pt-day-trip-bali';
    protected static string $apiKey = '30f271163aac8949eeeabdd8b1810fd1928a8304';


    // ─── Entry point ──────────────────────────────────────────────────────────

    public static function createLead(Order $order): array
    {
        $order->loadMissing(['tours', 'boat.company', 'transfer', 'cover', 'route', 'program', 'restaurant']);

        $data = static::buildOrderData($order);

        $partnerId   = static::createOrFindPartner($order);
        $odooOrderId = static::createSaleOrder($data, $partnerId);
        static::addOrderLines($order, $odooOrderId);

        return [
            'partner_id' => $partnerId,
            'order_id'   => $odooOrderId,
        ];
    }

    // ─── Build data array ─────────────────────────────────────────────────────

    public static function buildOrderData(Order $order): array
    {
        $order->loadMissing(['tours', 'boat.company', 'transfer', 'cover', 'route', 'program', 'restaurant']);

        $tour    = $order->tours;
        $boat    = $order->boat;
        $company = optional($boat)->company;

        $date = is_string($order->travel_date)
            ? $order->travel_date
            : $order->travel_date->format('Y-m-d');

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

        $vals = [
            'name'  => $order->name,
            'email' => $order->email,
            'phone' => $order->whatsapp ?? '',
        ];

        if (!empty($found[0]['id'])) {
            $partnerId = (int) $found[0]['id'];
            static::post('/json/2/res.partner/write', [
                'ids'  => [$partnerId],
                'vals' => $vals,
            ]);
            return $partnerId;
        }

        $id = static::post('/json/2/res.partner/create', [
            'vals_list' => [$vals],
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
            'rental_start_date'  => $lead['travel_date'] . ' ' . $lead['route_start'],
            'rental_return_date' => $lead['travel_date'] . ' ' . $lead['route_end'],

            'x_studio_deposit'          => $lead['deposite_summ'],
            'x_studio_pickup_address'   => $lead['pickup_address'],
            'x_studio_boat_name'        => $lead['boat_name'],
            'x_studio_pickup_cars'      => $lead['cars'],
            'x_studio_drop_off_cars'    => $lead['transfer_type'] === 'pickup' ? 0 : $lead['cars'],
            'x_studio_drop_off_address' => $lead['dropoff_address'],
            'x_studio_adults'           => $lead['adults'],
            'x_studio_kids'             => $lead['kids'],
            'x_studio_count_of_people'  => $lead['members'],
            'x_studio_route'            => $lead['route_name'],
            'x_studio_collect'          => $lead['total_price'] - $lead['deposite_summ'],
        ];

        if (!empty($lead['company_odoo_id'])) {
            $vals['company_id'] = $lead['company_odoo_id'];
        }

$id = static::post('/json/2/sale.order/create', ['vals_list' => [$vals]]);

        return (int) (is_array($id) ? $id[0] : $id);
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

    // ─── HTTP helper ──────────────────────────────────────────────────────────

    protected static function post(string $endpoint, array $body)
    {
        $response = Http::withHeaders([
                'Authorization'   => 'bearer ' . static::$apiKey,
                'X-Odoo-Database' => static::$db,
            ])
            ->timeout(30)
            ->post(static::$url . $endpoint, $body);

        if (!$response->successful()) {
            Log::error('OdooService error', [
                'endpoint' => $endpoint,
                'status'   => $response->status(),
                'body'     => $response->body(),
            ]);
            throw new \RuntimeException('Odoo API error ' . $response->status() . ': ' . $response->body());
        }

        return $response->json();
    }
}
