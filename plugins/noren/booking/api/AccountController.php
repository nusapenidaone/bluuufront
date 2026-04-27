<?php

namespace Noren\Booking\Api;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Log;
use Noren\Booking\Classes\PayPalService;
use Noren\Booking\Classes\XenditService;
use Noren\Booking\Models\Cover;
use Noren\Booking\Models\Order;
use Noren\Booking\Models\Rates;
use Noren\Booking\Models\Transfer;
use Noren\Booking\Odoo\OdooService;

class AccountController extends Controller
{
    private function cors(): void
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
        header('Access-Control-Allow-Headers: *');
    }

    private function findOrder(string $key): ?Order
    {
        $order = Order::where('key', $key)->first();
        if (!$order || !$order->odoo_id) {
            return null;
        }
        return $order;
    }

    // ─── GET /api/new/account/{key} ──────────────────────────────────────────

    public function show(Request $request, string $key)
    {
        $this->cors();

        $order = $this->findOrder($key);
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        try {
            $odooOrder = OdooService::getFullOrder((int) $order->odoo_id);
        } catch (\Exception $e) {
            Log::error('AccountController::show — Odoo error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch order'], 502);
        }

        $order->loadMissing(['tours', 'transfer', 'cover', 'route']);
        $isPrivate = in_array((int) $order->tours?->classes_id, [8]);
        $classesId = $isPrivate ? 8 : 9;

        $transfers = Transfer::orderBy('id')->get()
            ->filter(fn($t) => !$t->classes_id || (int) $t->classes_id === $classesId)
            ->map(fn($t) => [
                'id'        => $t->id,
                'name'      => $t->name,
                'price'     => (int) $t->price,
                'bus_price' => $t->bus_price ? (int) $t->bus_price : null,
            ])->values();

        $covers = Cover::orderBy('id')->get()
            ->filter(fn($c) => !$c->classes_id || (int) $c->classes_id === $classesId)
            ->map(fn($c) => [
                'id'       => $c->id,
                'name'     => $c->name,
                'price'    => (int) $c->price,
                'per_boat' => (bool) $c->per_boat,
            ])->values();

        return response()->json([
            'local' => [
                'id'              => $order->id,
                'external_id'     => $order->external_id,
                'odoo_id'         => (int) $order->odoo_id,
                'tour_name'       => $order->tours?->name,
                'is_private'      => $isPrivate,
                'travel_date'     => $order->travel_date,
                'adults'          => (int) $order->adults,
                'kids'            => (int) $order->kids,
                'members'         => (int) $order->members,
                'transfer_id'     => $order->transfer_id ? (int) $order->transfer_id : null,
                'transfer_name'   => $order->transfer?->name,
                'cover_id'        => $order->cover_id ? (int) $order->cover_id : null,
                'cover_name'      => $order->cover?->name,
                'extras'          => $order->extras ?: [],
                'pickup_address'  => $order->pickup_address ?? '',
                'dropoff_address' => $order->dropoff_address ?? '',
                'name'            => $order->name,
                'email'           => $order->email,
                'whatsapp'        => $order->whatsapp,
            ],
            'odoo' => [
                'order_number'       => $odooOrder['name'] ?? '',
                'state'              => $odooOrder['state'] ?? '',
                'boat_name'          => $odooOrder['x_studio_boat_name'] ?? '',
                'route'              => $odooOrder['x_studio_route'] ?? '',
                'rental_start_date'  => $odooOrder['rental_start_date'] ?? null,
                'rental_return_date' => $odooOrder['rental_return_date'] ?? null,
                'deposit_paid'       => (float) ($odooOrder['x_studio_deposit'] ?? 0),
                'collect'            => (float) ($odooOrder['x_studio_collect'] ?? 0),
                'partner_name'       => is_array($odooOrder['partner_id'] ?? null)
                    ? ($odooOrder['partner_id'][1] ?? '')
                    : '',
                'lines'              => $odooOrder['lines'] ?? [],
            ],
            'options' => [
                'transfers' => $transfers,
                'covers'    => $covers,
            ],
        ]);
    }

    // ─── PATCH /api/new/account/{key}/simple ─────────────────────────────────
    // Update: date, pickup_address, dropoff_address (no price change)

    public function updateSimple(Request $request, string $key)
    {
        $this->cors();

        $order = $this->findOrder($key);
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $date           = $request->input('date');
        $pickupAddress  = $request->input('pickup_address');
        $dropoffAddress = $request->input('dropoff_address');

        $odooFields = [];

        if ($date && $date !== $order->travel_date) {
            $order->loadMissing('route');
            $routeStart = $order->route?->start ?? '08:00:00';
            $routeEnd   = $order->route?->end   ?? '18:00:00';
            $odooFields['rental_start_date']  = Carbon::parse($date . ' ' . $routeStart, 'Asia/Makassar')->utc()->format('Y-m-d H:i:s');
            $odooFields['rental_return_date'] = Carbon::parse($date . ' ' . $routeEnd,   'Asia/Makassar')->utc()->format('Y-m-d H:i:s');
            $order->travel_date = $date;
        }

        if ($pickupAddress !== null) {
            $odooFields['x_studio_pickup_address'] = $pickupAddress;
            $order->pickup_address = $pickupAddress;
        }

        if ($dropoffAddress !== null) {
            $odooFields['x_studio_drop_off_address'] = $dropoffAddress;
            $order->dropoff_address = $dropoffAddress;
        }

        if (!empty($odooFields)) {
            OdooService::updateOrderFields((int) $order->odoo_id, $odooFields);
        }

        $order->saveQuietly();

        return response()->json(['success' => true]);
    }

    // ─── PATCH /api/new/account/{key}/products ───────────────────────────────
    // Update: adults, kids, transfer_id, cover_id, extras → recreate Odoo order

    public function updateProducts(Request $request, string $key)
    {
        $this->cors();

        $order = $this->findOrder($key);
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $order->loadMissing(['tours', 'boat.company', 'route', 'program', 'restaurant']);

        $adults     = $request->has('adults')      ? (int) $request->input('adults')     : (int) $order->adults;
        $kids       = $request->has('kids')        ? (int) $request->input('kids')       : (int) $order->kids;
        $transferId = $request->has('transfer_id') ? $request->input('transfer_id')      : $order->transfer_id;
        $coverId    = $request->has('cover_id')    ? $request->input('cover_id')         : $order->cover_id;
        $extras     = $request->has('extras')      ? $request->input('extras', [])       : ($order->extras ?: []);

        $members   = $adults + $kids;
        $isPrivate = in_array((int) $order->tours?->classes_id, [8]);

        // ── Recalculate tour price ────────────────────────────────────────────
        $tour = $order->tours;
        $tour->loadMissing(['packages', 'pricesbydates.packages']);
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

        $boatPrice = $isPrivate ? (int) ($tour->boat_price ?? 0) : 0;

        // ── Transfer ──────────────────────────────────────────────────────────
        $transfer      = null;
        $transferPrice = 0;
        $cars          = 0;
        if ($transferId) {
            $transfer = Transfer::find($transferId);
            if ($transfer) {
                $transferPrice = ($members > 5 && $transfer->bus_price)
                    ? (int) $transfer->bus_price
                    : (int) $transfer->price;
                $cars = in_array((int) $transfer->id, [1, 2]) ? (int) ceil($members / 5) : 0;
            }
        }

        // ── Cover ─────────────────────────────────────────────────────────────
        $cover      = null;
        $coverPrice = 0;
        if ($coverId) {
            $cover = Cover::find($coverId);
            if ($cover) {
                $coverPrice = (int) ($cover->price ?? 0);
            }
        }

        // ── Extras total ──────────────────────────────────────────────────────
        $extrasTotal = 0;
        foreach ((array) $extras as $item) {
            $extrasTotal += (int) ($item['price'] ?? 0) * max(1, (int) ($item['qty'] ?? $item['quantity'] ?? 1));
        }

        $fullPrice = $tierPrice + $boatPrice + $transferPrice + $coverPrice + $extrasTotal;

        // ── Update local order ────────────────────────────────────────────────
        $order->adults         = $adults;
        $order->kids           = $kids;
        $order->members        = $members;
        $order->transfer_id    = $transferId ?: null;
        $order->cover_id       = $coverId ?: null;
        $order->extras         = $extras;
        $order->cars           = $cars;
        $order->tour_price     = $tierPrice;
        $order->boat_price     = $boatPrice;
        $order->transfer_price = $transferPrice;
        $order->cover_price    = $coverPrice;
        $order->extras_total   = $extrasTotal;
        $order->total_price    = $fullPrice;
        $order->full_price     = $fullPrice;
        $order->saveQuietly();

        // ── Recreate Odoo order ───────────────────────────────────────────────
        try {
            $result         = OdooService::recreateLead($order);
            $order->odoo_id = $result['order_id'];
            $order->saveQuietly();
        } catch (\Exception $e) {
            Log::error('AccountController::updateProducts — ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }

        return response()->json([
            'success'     => true,
            'new_odoo_id' => (int) $order->odoo_id,
            'prices'      => [
                'tour_price'     => $tierPrice,
                'boat_price'     => $boatPrice,
                'transfer_price' => $transferPrice,
                'cover_price'    => $coverPrice,
                'extras_total'   => $extrasTotal,
                'full_price'     => $fullPrice,
            ],
        ]);
    }

    // ─── POST /api/new/account/{key}/pay ─────────────────────────────────────
    // Create payment link for remaining collect amount

    public function createPayment(Request $request, string $key)
    {
        $this->cors();

        $order = $this->findOrder($key);
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $method = (int) $request->input('method', $order->method_id ?? 1);

        try {
            $collectAmount = OdooService::getOrderCollect((int) $order->odoo_id);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to get collect amount'], 502);
        }

        if ($collectAmount <= 0) {
            return response()->json(['error' => 'No remaining amount to pay'], 400);
        }

        $order->loadMissing('tours');
        $description = $order->tours?->name ?? 'Bluuu Tour';

        // Use 'odoo_{odoo_id}' prefix: VerifyController handles it via OdooService::registerPayment / clearCollect
        $collectExtId = 'odoo_' . $order->odoo_id;
        $cancelUrl    = url('/account') . '?key=' . $key;
        $successUrl   = url('/account') . '?key=' . $key . '&paid=1';

        if ($method === 2) {
            $rate     = Rates::where('code', 'USD')->orderBy('id', 'desc')->first();
            $usdAmt   = $rate ? round((float) $rate->rate * $collectAmount, 2) : 0;
            $payUrl   = PayPalService::createPaymentLink(
                $collectExtId, $usdAmt, $order->email, $successUrl, $cancelUrl, $description
            );
        } else {
            $payUrl = XenditService::createPaymentLink(
                $collectExtId, $collectAmount, $order->email, $successUrl, $cancelUrl, $description
            );
        }

        return response()->json(['payment_url' => $payUrl]);
    }
}
