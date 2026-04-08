<?php namespace Noren\Booking\Admin;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Log;
use Noren\Booking\Models\Order;
use Noren\Booking\Odoo\OdooService;

class AdminController extends Controller
{
    // ─── Auth ─────────────────────────────────────────────────────────────────

    protected function auth(Request $request)
    {
        $cfg   = require __DIR__ . '/../odoo/services.config.php';
        $token = $cfg['admin_token'] ?? null;

        if (!$token) return false;

        $header = $request->header('Authorization', '');
        return $header === 'Bearer ' . $token;
    }

    protected function unauthorized()
    {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    // =========================================================================
    // ODOO-CENTRIC ENDPOINTS (primary)
    // =========================================================================

    // ─── GET /api/admin/odoo/orders ──────────────────────────────────────────
    // List sale.orders directly from Odoo with search + pagination

    public function odooOrders(Request $request)
    {
        if (!$this->auth($request)) return $this->unauthorized();

        $search = (string) $request->get('search', '');
        $page   = max(1, (int) $request->get('page', 1));
        $limit  = 20;
        $offset = ($page - 1) * $limit;

        try {
            $orders = OdooService::searchOrders($search, $limit, $offset);
            $total  = OdooService::countOrders($search);

            return response()->json([
                'data'         => $orders,
                'total'        => $total,
                'current_page' => $page,
                'last_page'    => (int) ceil($total / max(1, $limit)),
                'per_page'     => $limit,
            ]);
        } catch (\Exception $e) {
            Log::error('Admin odooOrders: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // ─── GET /api/admin/odoo/order/{odooId} ──────────────────────────────────
    // Full Odoo order + lines + linked local order (matched by odoo_id)

    public function odooOrder(Request $request, int $odooId)
    {
        if (!$this->auth($request)) return $this->unauthorized();

        try {
            $odoo  = OdooService::getFullOrder($odooId);
            $local = Order::with([
                'tours', 'boat', 'transfer', 'cover', 'restaurant', 'status',
            ])->where('odoo_id', $odooId)->first();

            return response()->json([
                'odoo'  => $odoo,
                'order' => $local ? $local->toArray() : null,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // ─── PATCH /api/admin/odoo/order/{odooId} ────────────────────────────────
    // Write fields directly to existing Odoo sale.order

    public function odooUpdate(Request $request, int $odooId)
    {
        if (!$this->auth($request)) return $this->unauthorized();

        $allowed = [
            'rental_start_date', 'rental_return_date',
            'x_studio_boat_name',
            'x_studio_pickup_address', 'x_studio_drop_off_address',
            'x_studio_pickup_cars',    'x_studio_drop_off_cars',
            'x_studio_adults',         'x_studio_kids', 'x_studio_count_of_people',
            'x_studio_route',
            'x_studio_deposit',        'x_studio_collect',
            'x_studio_free_shuttle_bus',
        ];

        $fields = $request->only($allowed);
        if (empty($fields)) {
            return response()->json(['error' => 'No valid fields provided'], 422);
        }

        try {
            OdooService::updateOrderFields($odooId, $fields);
            $updated = OdooService::getFullOrder($odooId);

            return response()->json(['success' => true, 'odoo' => $updated]);
        } catch (\Exception $e) {
            Log::error("Admin odooUpdate #{$odooId}: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // ─── POST /api/admin/odoo/order/{odooId}/recreate ────────────────────────
    // Cancel the Odoo order and recreate it from the linked local order.
    // Used when products (boat, extras, transfer…) need to change.

    public function odooRecreate(Request $request, int $odooId)
    {
        if (!$this->auth($request)) return $this->unauthorized();

        $local = Order::where('odoo_id', $odooId)->first();
        if (!$local) {
            return response()->json(['error' => 'No local order linked to this Odoo ID'], 404);
        }

        try {
            $result = OdooService::recreateLead($local);
            Order::where('id', $local->id)->update(['odoo_id' => $result['order_id']]);

            return response()->json([
                'success' => true,
                'result'  => [
                    'action'            => 'recreated',
                    'cancelled_odoo_id' => $result['cancelled_odoo_id'],
                    'new_odoo_id'       => $result['order_id'],
                    'partner_id'        => $result['partner_id'],
                ],
            ]);
        } catch (\Exception $e) {
            Log::error("Admin odooRecreate #{$odooId}: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // =========================================================================
    // LOCAL DB ENDPOINTS (secondary)
    // =========================================================================

    protected const ALLOWED_FIELDS = [
        'name', 'email', 'whatsapp',
        'travel_date',
        'adults', 'kids', 'members',
        'pickup_address', 'dropoff_address',
        'cars',
        'transfer_id', 'boat_id', 'tours_id',
        'cover_id', 'restaurant_id',
        'tour_price', 'boat_price', 'transfer_price', 'cover_price',
        'total_price', 'deposite_summ',
        'source_id',
    ];

    public function index(Request $request)
    {
        if (!$this->auth($request)) return $this->unauthorized();

        $perPage = min((int) $request->get('per_page', 20), 100);
        $search  = $request->get('search');
        $from    = $request->get('from');
        $to      = $request->get('to');

        $query = Order::with(['tours', 'boat', 'status', 'source'])->orderByDesc('id');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name',        'like', "%{$search}%")
                  ->orWhere('email',       'like', "%{$search}%")
                  ->orWhere('external_id', 'like', "%{$search}%");
            });
        }

        if ($from) $query->where('travel_date', '>=', Carbon::parse($from)->toDateString());
        if ($to)   $query->where('travel_date', '<=', Carbon::parse($to)->toDateString());

        return response()->json($query->paginate($perPage));
    }

    public function show(Request $request, int $id)
    {
        if (!$this->auth($request)) return $this->unauthorized();

        $order = Order::with([
            'tours', 'boat.company', 'transfer', 'cover',
            'route', 'program', 'restaurant', 'status', 'payment_status', 'source',
        ])->find($id);

        if (!$order) return response()->json(['error' => 'Order not found'], 404);

        $odooData = null;
        if ($order->odoo_id) {
            try {
                $odooData = OdooService::getFullOrder((int) $order->odoo_id);
            } catch (\Exception $e) {
                $odooData = ['error' => $e->getMessage()];
            }
        }

        return response()->json(['order' => $order->toArray(), 'odoo' => $odooData]);
    }

    public function update(Request $request, int $id)
    {
        if (!$this->auth($request)) return $this->unauthorized();

        $order = Order::find($id);
        if (!$order) return response()->json(['error' => 'Order not found'], 404);

        $data = $request->only(self::ALLOWED_FIELDS);
        if (empty($data)) return response()->json(['error' => 'No valid fields provided'], 422);

        foreach ($data as $key => $value) {
            $order->{$key} = $value;
        }

        $order->saveQuietly();

        return response()->json([
            'success' => true,
            'order'   => $order->fresh(['tours', 'boat', 'transfer', 'cover'])->toArray(),
        ]);
    }

    public function pushToOdoo(Request $request, int $id)
    {
        if (!$this->auth($request)) return $this->unauthorized();

        $order = Order::find($id);
        if (!$order) return response()->json(['error' => 'Order not found'], 404);

        try {
            if (!$order->odoo_id) {
                $created = OdooService::createLead($order);
                Order::where('id', $order->id)->update(['odoo_id' => $created['order_id']]);

                return response()->json([
                    'success' => true,
                    'result'  => ['action' => 'created', 'odoo_id' => $created['order_id'], 'partner_id' => $created['partner_id']],
                ]);
            }

            $result = OdooService::recreateLead($order);
            Order::where('id', $order->id)->update(['odoo_id' => $result['order_id']]);

            return response()->json([
                'success' => true,
                'result'  => [
                    'action'            => 'recreated',
                    'cancelled_odoo_id' => $result['cancelled_odoo_id'],
                    'new_odoo_id'       => $result['order_id'],
                    'partner_id'        => $result['partner_id'],
                ],
            ]);
        } catch (\Exception $e) {
            Log::error("Admin pushToOdoo error order #{$id}: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
