<?php namespace Noren\Booking\Admin;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Log;
use Noren\Booking\Models\Boat;
use Noren\Booking\Models\Cover;
use Noren\Booking\Models\Extras;
use Noren\Booking\Models\Order;
use Noren\Booking\Models\Tours;
use Noren\Booking\Models\Transfer;
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

    // ─── GET /api/admin/managers ─────────────────────────────────────────────
    // Returns list of manager names (no passwords) — public endpoint for login screen

    public function managers(Request $request)
    {
        $cfg      = require __DIR__ . '/../odoo/services.config.php';
        $managers = $cfg['managers'] ?? [];
        return response()->json(['managers' => array_keys($managers)]);
    }

    // ─── POST /api/admin/login ────────────────────────────────────────────────

    public function login(Request $request)
    {
        $cfg       = require __DIR__ . '/../odoo/services.config.php';
        $passwords = $cfg['admin_passwords'] ?? [];
        $managers  = $cfg['managers']        ?? [];
        $token     = $cfg['admin_token']     ?? null;

        if (!$token) {
            return response()->json(['error' => 'Server misconfigured'], 500);
        }

        $username = (string) $request->input('username', '');
        $password = (string) $request->input('password', '');
        $page     = (string) $request->input('page', '');

        // Per-manager login: username provided and found in managers config
        if ($username && isset($managers[$username])) {
            if ($password !== $managers[$username]) {
                return response()->json(['error' => 'Wrong password'], 401);
            }
            return response()->json(['token' => $token, 'manager_name' => $username]);
        }

        // Legacy page-based login (guides, drivers, vendors, manage without username)
        $expected = $passwords[$page] ?? null;
        if (!$expected || $password !== $expected) {
            return response()->json(['error' => 'Wrong password'], 401);
        }

        return response()->json(['token' => $token]);
    }

    // ─── Restaurant auth (per-restaurant / Management, HMAC-signed tokens) ─────
    // Password structure mirrors 'managers' (display name is the key). Unlike
    // admin_token (one shared token for everyone), each restaurant login still
    // needs its own scope so /api/admin/restaurant/leads can filter server-side
    // to that restaurant's bookings only. Tokens are stateless: base64(name)
    // + HMAC signature, verified against restaurant_token_secret.

    protected function issueRestaurantToken(string $name, string $secret): string
    {
        $payload = base64_encode($name);
        return $payload . '.' . hash_hmac('sha256', $payload, $secret);
    }

    protected function restaurantAuth(Request $request): ?array
    {
        $cfg    = require __DIR__ . '/../odoo/services.config.php';
        $secret = $cfg['restaurant_token_secret'] ?? null;
        $logins = $cfg['restaurant_logins'] ?? [];
        if (!$secret) return null;

        $header = $request->header('Authorization', '');
        if (!str_starts_with($header, 'Bearer ')) return null;

        $parts = explode('.', substr($header, 7));
        if (count($parts) !== 2) return null;

        [$payload, $sig] = $parts;
        if (!hash_equals(hash_hmac('sha256', $payload, $secret), $sig)) return null;

        $name = base64_decode($payload, true);
        if (!$name || !isset($logins[$name])) return null;

        return ['name' => $name] + $logins[$name];
    }

    // ─── GET /api/admin/restaurant/accounts ────────────────────────────────────
    // Public list of restaurant names (no passwords) — for the /manage/restaurant
    // login screen dropdown. Same shape as /api/admin/managers.

    public function restaurantAccounts(Request $request)
    {
        $cfg    = require __DIR__ . '/../odoo/services.config.php';
        $logins = $cfg['restaurant_logins'] ?? [];
        return response()->json(['accounts' => array_keys($logins)]);
    }

    // ─── POST /api/admin/restaurant/login ─────────────────────────────────────

    public function restaurantLogin(Request $request)
    {
        $cfg    = require __DIR__ . '/../odoo/services.config.php';
        $secret = $cfg['restaurant_token_secret'] ?? null;
        $logins = $cfg['restaurant_logins'] ?? [];

        if (!$secret) {
            return response()->json(['error' => 'Server misconfigured'], 500);
        }

        $name     = (string) $request->input('name', '');
        $password = (string) $request->input('password', '');

        if (!$name || !isset($logins[$name]) || $password !== $logins[$name]['password']) {
            return response()->json(['error' => 'Wrong name or password'], 401);
        }

        return response()->json([
            'token'         => $this->issueRestaurantToken($name, $secret),
            'name'          => $name,
            'is_management' => $logins[$name]['keywords'] === null,
        ]);
    }

    // =========================================================================
    // ODOO-CENTRIC ENDPOINTS (primary)
    // =========================================================================

    // ─── GET /api/admin/boats ─────────────────────────────────────────────────

    public function boats(Request $request)
    {
        if (!$this->auth($request)) return $this->unauthorized();

        $boats = Boat::select('id', 'name', 'odoo_id')->orderBy('name')->get();
        return response()->json($boats);
    }

    // ─── GET /api/admin/tours ─────────────────────────────────────────────────

    public function tours(Request $request)
    {
        if (!$this->auth($request)) return $this->unauthorized();

        $tours = Tours::select('id', 'name', 'odoo_id')->orderBy('name')->get();
        return response()->json($tours);
    }

    // ─── GET /api/admin/transfers ─────────────────────────────────────────────

    public function transfers(Request $request)
    {
        if (!$this->auth($request)) return $this->unauthorized();

        $transfers = Transfer::select('id', 'name', 'odoo_id')->orderBy('name')->get();
        return response()->json($transfers);
    }

    // ─── GET /api/admin/covers ────────────────────────────────────────────────

    public function covers(Request $request)
    {
        if (!$this->auth($request)) return $this->unauthorized();

        $covers = Cover::select('id', 'name', 'odoo_id')->orderBy('name')->get();
        return response()->json($covers);
    }

    // ─── GET /api/admin/extras ────────────────────────────────────────────────

    public function extras(Request $request)
    {
        if (!$this->auth($request)) return $this->unauthorized();

        $extras = Extras::select('id', 'name', 'price', 'odoo_id')->orderBy('name')->get();
        return response()->json($extras);
    }

    // ─── PATCH /api/admin/odoo/order/{odooId}/extras ─────────────────────────
    // Update extras JSON on the linked local order, then recreate Odoo order

    public function odooUpdateExtras(Request $request, int $odooId)
    {
        if (!$this->auth($request)) return $this->unauthorized();

        $local = Order::where('odoo_id', $odooId)->first();
        if (!$local) {
            return response()->json(['error' => 'No local order linked to this Odoo ID'], 404);
        }

        // Expected: [{id: 1, qty: 2}, ...]
        $items = $request->get('extras', []);
        if (!is_array($items)) {
            return response()->json(['error' => 'extras must be an array'], 422);
        }

        // Build full extras array with name+price from DB
        $extraRecords = Extras::whereIn('id', array_column($items, 'id'))
            ->select('id', 'name', 'price', 'odoo_id')
            ->get()
            ->keyBy('id');

        $extrasJson = [];
        foreach ($items as $item) {
            $id  = (int) ($item['id'] ?? 0);
            $qty = max(1, (int) ($item['qty'] ?? 1));
            if (!$id || !$extraRecords->has($id)) continue;
            $rec = $extraRecords[$id];
            $extrasJson[] = [
                'id'    => $rec->id,
                'name'  => $rec->name,
                'qty'   => $qty,
                'price' => (float) $rec->price,
            ];
        }

        $local->extras = $extrasJson;
        $local->saveQuietly();

        try {
            $result = OdooService::recreateLead($local, $local->status_id == 2);
            Order::where('id', $local->id)->update(['odoo_id' => $result['order_id']]);

            return response()->json([
                'success' => true,
                'result'  => [
                    'action'            => 'recreated',
                    'cancelled_odoo_id' => $result['cancelled_odoo_id'],
                    'new_odoo_id'       => $result['order_id'],
                ],
            ]);
        } catch (\Exception $e) {
            Log::error("Admin odooUpdateExtras #{$odooId}: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

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

            // Enrich with tour names from local DB
            if (!empty($orders)) {
                $odooIds = array_filter(array_column($orders, 'id'));
                $refs    = array_filter(array_column($orders, 'client_order_ref'));

                $localOrders = Order::with('tours')
                    ->whereIn('odoo_id', $odooIds)
                    ->get();

                $byOdooId = $localOrders->keyBy('odoo_id');

                foreach ($orders as &$order) {
                    $local = $byOdooId->get($order['id']);
                    $order['tour_name'] = $local ? optional($local->tours)->name : null;
                    $order['local_id']  = $local ? $local->id : null;
                }
                unset($order);
            }

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
            'x_studio_special_requests',
            'x_studio_pickup_cars',    'x_studio_drop_off_cars',
            'x_studio_adults',         'x_studio_kids', 'x_studio_count_of_people',
            'x_studio_deposit',        'x_studio_collect',
            'x_studio_free_shuttle_bus',
            'x_studio_customer_checked_in_and_cleared',
            'x_studio_checked_in_by',
            'x_studio_no_show_1',
            'x_studio_number_of_pax_checked_in',
            'x_studio_collected_by_cash',
            'x_studio_collected_by_edcbank',
            'x_studio_group_lanyard_color',
            'x_studio_boat_status',
            'x_studio_penida_land_tour_pickup_time',
            'x_studio_penida_pickup_point_land_tour',
        ];

        $fields = $request->only($allowed);
        if (empty($fields)) {
            return response()->json(['error' => 'No valid fields provided'], 422);
        }

        try {
            OdooService::updateOrderFields($odooId, $fields);
            $updated = OdooService::getFullOrder($odooId);

            // Adults/kids changed directly on Odoo (no recreate) — the order
            // lines don't auto-update, so sync the ones that scale with
            // headcount: shared tour qty/price, transfer cars qty.
            if (array_key_exists('x_studio_adults', $fields) || array_key_exists('x_studio_kids', $fields)) {
                $local = Order::where('odoo_id', $odooId)->first();
                if ($local) {
                    $members = (int) ($updated['x_studio_count_of_people']
                        ?? ((int) ($updated['x_studio_adults'] ?? 0) + (int) ($updated['x_studio_kids'] ?? 0)));
                    OdooService::syncOrderLineQuantities($local, $odooId, $members);
                    $updated = OdooService::getFullOrder($odooId);
                }
            }

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
            $result = OdooService::recreateLead($local, $local->status_id == 2);
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

    // ─── PATCH /api/admin/odoo/order/{odooId}/products ───────────────────────
    // Change boat and/or tour on the linked local order, then recreate Odoo order

    public function odooUpdateProducts(Request $request, int $odooId)
    {
        if (!$this->auth($request)) return $this->unauthorized();

        $local = Order::where('odoo_id', $odooId)->first();
        if (!$local) {
            return response()->json(['error' => 'No local order linked to this Odoo ID'], 404);
        }

        $boatId     = $request->get('boat_id');
        $toursId    = $request->get('tours_id');
        $transferId = $request->get('transfer_id');
        $coverId    = $request->get('cover_id');

        if ($boatId     !== null) $local->boat_id     = (int) $boatId;
        if ($toursId    !== null) $local->tours_id    = (int) $toursId;
        if ($transferId !== null) $local->transfer_id = (int) $transferId;
        if ($coverId    !== null) $local->cover_id    = (int) $coverId;

        $local->saveQuietly();

        try {
            $result = OdooService::recreateLead($local, $local->status_id == 2);
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
            Log::error("Admin odooUpdateProducts #{$odooId}: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // ─── GET /api/admin/leads ─────────────────────────────────────────────────
    // Odoo orders for a date range (Bali/Makassar timezone)
    // Params: date_from=YYYY-MM-DD, date_to=YYYY-MM-DD (or single date=YYYY-MM-DD)

    public function leads(Request $request)
    {
        if (!$this->auth($request)) return $this->unauthorized();

        $baliTz = 'Asia/Makassar';

        try {
            $from = Carbon::createFromFormat('Y-m-d', $request->get('date_from') ?: $request->get('date') ?: Carbon::now($baliTz)->format('Y-m-d'), $baliTz);
            $to   = Carbon::createFromFormat('Y-m-d', $request->get('date_to')   ?: $request->get('date') ?: Carbon::now($baliTz)->format('Y-m-d'), $baliTz);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid date. Use YYYY-MM-DD.'], 422);
        }

        if ($to->lt($from)) $to = $from->copy();

        $startUtc  = $from->copy()->startOfDay()->utc()->format('Y-m-d H:i:s');
        $endUtc    = $to->copy()->endOfDay()->utc()->format('Y-m-d H:i:s');
        $singleDay = $from->toDateString() === $to->toDateString();

        $perPage = 20;
        $page    = max(1, (int) $request->get('page', 1));
        $limit   = $singleDay ? 0 : $perPage;
        $offset  = $singleDay ? 0 : ($page - 1) * $perPage;

        try {
            $orders = OdooService::getLeadsForDate($startUtc, $endUtc, $limit, $offset);
            $total  = $singleDay ? count($orders) : OdooService::countLeadsForDate($startUtc, $endUtc);

            if (!empty($orders)) {
                $partnerIds = array_unique(array_filter(array_map(
                    function ($o) { return is_array($o['partner_id']) ? $o['partner_id'][0] : null; },
                    $orders
                )));
                $partners = OdooService::readPartners($partnerIds);

                $orderIds = array_column($orders, 'id');
                $linesMap = OdooService::getLinesForOrders($orderIds);

                foreach ($orders as &$order) {
                    $pid = is_array($order['partner_id']) ? $order['partner_id'][0] : null;
                    $p   = $pid ? ($partners[$pid] ?? null) : null;
                    $order['odoo_email'] = $p['email'] ?? null;
                    $order['odoo_phone'] = $p['phone'] ?? null;
                    $order['lines']      = $linesMap[$order['id']] ?? [];
                }
                unset($order);
            }

            return response()->json([
                'date_from'    => $from->toDateString(),
                'date_to'      => $to->toDateString(),
                'total'        => $total,
                'orders'       => $orders,
                'current_page' => $page,
                'last_page'    => $limit > 0 ? (int) ceil($total / max(1, $perPage)) : 1,
                'per_page'     => $limit ?: $total,
            ]);
        } catch (\Throwable $e) {
            Log::error('Admin leads: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // ─── GET /api/admin/restaurant/leads ───────────────────────────────────────
    // Odoo orders for a date range, scoped to the authenticated restaurant's
    // lunch bookings only (Management sees all). No partner enrichment —
    // restaurants only need boat grouping, pax, guides, passengers, special
    // requests. Product lines ARE included (lightweight) so the frontend can
    // flag upsells like "First Class Menu" by product id.

    public function restaurantLeads(Request $request)
    {
        $account = $this->restaurantAuth($request);
        if (!$account) return $this->unauthorized();

        $baliTz = 'Asia/Makassar';

        try {
            $from = Carbon::createFromFormat('Y-m-d', $request->get('date_from') ?: $request->get('date') ?: Carbon::now($baliTz)->format('Y-m-d'), $baliTz);
            $to   = Carbon::createFromFormat('Y-m-d', $request->get('date_to')   ?: $request->get('date') ?: Carbon::now($baliTz)->format('Y-m-d'), $baliTz);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid date. Use YYYY-MM-DD.'], 422);
        }

        if ($to->lt($from)) $to = $from->copy();

        $startUtc = $from->copy()->startOfDay()->utc()->format('Y-m-d H:i:s');
        $endUtc   = $to->copy()->endOfDay()->utc()->format('Y-m-d H:i:s');

        try {
            $orders = OdooService::getLeadsForDate($startUtc, $endUtc);

            $keywords = $account['keywords'] ?? null;
            $orders   = array_values(array_filter($orders, function ($o) use ($keywords) {
                $lunch = (string) ($o['x_studio_lunch'] ?? '');
                if ($lunch === '') return false;
                if ($keywords === null) return true; // Management sees every restaurant
                foreach ($keywords as $kw) {
                    if (stripos($lunch, $kw) !== false) return true;
                }
                return false;
            }));

            $orderIds = array_column($orders, 'id');
            $linesMap = OdooService::getLinesForOrders($orderIds);
            foreach ($orders as &$order) {
                $order['lines'] = $linesMap[$order['id']] ?? [];
            }
            unset($order);

            return response()->json([
                'date_from'     => $from->toDateString(),
                'date_to'       => $to->toDateString(),
                'restaurant'    => $account['name'],
                'is_management' => $keywords === null,
                'total'         => count($orders),
                'orders'        => $orders,
            ]);
        } catch (\Throwable $e) {
            Log::error('Admin restaurantLeads: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
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
            $confirm = $order->status_id == 2;

            if (!$order->odoo_id) {
                $created = OdooService::createLead($order, $confirm);
                Order::where('id', $order->id)->update(['odoo_id' => $created['order_id']]);

                return response()->json([
                    'success' => true,
                    'result'  => ['action' => 'created', 'odoo_id' => $created['order_id'], 'partner_id' => $created['partner_id']],
                ]);
            }

            $result = OdooService::recreateLead($order, $confirm);
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

    // =========================================================================
    // BLOG ENDPOINTS
    // =========================================================================

    private static $authorFields = [
        'name', 'slug', 'title', 'bio', 'avatar',
    ];

    private static $blogFields = [
        'title', 'slug', 'description', 'seo_title', 'seo_description',
        'status', 'author_id', 'category', 'overline', 'published_at',
        'hero_caption', 'pull_quote',
        'content', 'content1', 'content2', 'content3', 'content4',
        'content_blocks', 'meta_keywords', 'og_image', 'faq',
    ];

    public function blogList(Request $request)
    {
        if (!$this->auth($request)) return $this->unauthorized();

        $posts = \Noren\Bluuu\Models\Blog::orderBy('id', 'desc')
            ->get(['id', 'title', 'slug', 'status', 'category', 'published_at', 'created_at', 'updated_at']);

        return response()->json($posts);
    }

    public function blogGet(Request $request, $id)
    {
        if (!$this->auth($request)) return $this->unauthorized();

        $post = \Noren\Bluuu\Models\Blog::find($id);
        if (!$post) return response()->json(['error' => 'Not found'], 404);

        return response()->json($post);
    }

    public function blogCreate(Request $request)
    {
        if (!$this->auth($request)) return $this->unauthorized();

        $post = new \Noren\Bluuu\Models\Blog();
        $post->fill($request->only(self::$blogFields));
        $post->save();

        return response()->json($post, 201);
    }

    public function blogUpdate(Request $request, $id)
    {
        if (!$this->auth($request)) return $this->unauthorized();

        $post = \Noren\Bluuu\Models\Blog::find($id);
        if (!$post) return response()->json(['error' => 'Not found'], 404);

        $post->fill($request->only(self::$blogFields));
        $post->save();

        return response()->json($post);
    }

    public function blogDelete(Request $request, $id)
    {
        if (!$this->auth($request)) return $this->unauthorized();

        $post = \Noren\Bluuu\Models\Blog::find($id);
        if (!$post) return response()->json(['error' => 'Not found'], 404);

        $post->delete();
        return response()->json(['ok' => true]);
    }

    // ── Author CRUD ───────────────────────────────────────────────────────────

    public function authorList(Request $request)
    {
        if (!$this->auth($request)) return $this->unauthorized();

        $authors = \Noren\Bluuu\Models\Author::orderBy('name')->get();
        return response()->json($authors);
    }

    public function authorGet(Request $request, $id)
    {
        if (!$this->auth($request)) return $this->unauthorized();

        $author = \Noren\Bluuu\Models\Author::find($id);
        if (!$author) return response()->json(['error' => 'Not found'], 404);

        return response()->json($author);
    }

    public function authorCreate(Request $request)
    {
        if (!$this->auth($request)) return $this->unauthorized();

        $author = new \Noren\Bluuu\Models\Author();
        $author->fill($request->only(self::$authorFields));
        $author->save();

        return response()->json($author, 201);
    }

    public function authorUpdate(Request $request, $id)
    {
        if (!$this->auth($request)) return $this->unauthorized();

        $author = \Noren\Bluuu\Models\Author::find($id);
        if (!$author) return response()->json(['error' => 'Not found'], 404);

        $author->fill($request->only(self::$authorFields));
        $author->save();

        return response()->json($author);
    }

    public function authorDelete(Request $request, $id)
    {
        if (!$this->auth($request)) return $this->unauthorized();

        $author = \Noren\Bluuu\Models\Author::find($id);
        if (!$author) return response()->json(['error' => 'Not found'], 404);

        $author->delete();
        return response()->json(['ok' => true]);
    }
}
