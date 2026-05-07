<?php

namespace Noren\Booking\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Session;

use Noren\Booking\Models\Order;
use Noren\Booking\Models\Rates;
use Noren\Booking\Models\Tours;
use Noren\Booking\Models\Closeddates;
use Noren\Booking\Models\Route;

use Noren\Booking\Classes\XenditService;
use Noren\Booking\Classes\PayPalService;

class PrivateOrderController extends Controller
{
    /**
     * POST /api/new/order/private
     *
     * Saves the order to the database immediately (no payment gateway call).
     * Returns {external_id} so the frontend can call /pay next.
     */
    public function createOrder(Request $request)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        try {

        $data = $request->all();
        \Log::info('[PrivateOrder] incoming', [
            'ip'         => $request->ip(),
            'email'      => $data['email'] ?? null,
            'tourId'     => $data['tourId'] ?? null,
            'boatId'     => $data['boatId'] ?? null,
            'travelDate' => $data['travelDate'] ?? null,
            'adults'     => $data['adults'] ?? null,
            'kids'       => $data['kids'] ?? null,
            'method'     => $data['method'] ?? null,
            'deposite'   => $data['deposite'] ?? null,
            'totalPrice' => $data['totalPrice'] ?? null,
        ]);

        $order = new Order;

        // ── Order type & status ───────────────────────────────────────
        if (($data['deposite'] ?? 0) > 0) {
            $order->order_type_id     = 1;   // order
            $order->status_id         = 1;   // new
            $order->payment_status_id = 1;   // pending
        } else {
            $order->order_type_id     = 2;   // request
            $order->status_id         = 4;   // pending request
            $order->payment_status_id = 5;   // not paid
        }

        // ── UTM from request ──────────────────────────────────────────
        if (!empty($data['utm']) && is_array($data['utm'])) {
            $order->utm = $data['utm'];
        }

        // ── Analytics ─────────────────────────────────────────────────
        $order->ga_client_id = $data['ga_client_id'] ?? null;
        $order->amo_lead_id  = $data['leadId']        ?? null;

        // ── Tour & dates ──────────────────────────────────────────────
        $order->tours_id    = $data['tourId'];
        $order->boat_id     = $this->selectBoatForOrder((int) $data['tourId'], $data['travelDate']);
        $order->travel_date = $data['travelDate'];

        if ($order->boat_id === null) {
            return response()->json(['error' => 'No available boats for this date'], 422);
        }

        // ── Guests ────────────────────────────────────────────────────
        $order->adults   = $data['adults']   ?? 0;
        $order->kids     = $data['kids']     ?? 0;
        $order->children = $data['children'] ?? 0;
        $order->members  = $data['members']  ?? (($data['adults'] ?? 0) + ($data['kids'] ?? 0));

        // ── Selected options ──────────────────────────────────────────
        $order->transfer_id   = $data['selectedTransferId']   ?? null;
        $order->cover_id      = $data['selectedCoverId']      ?? null;
        $order->route_id      = $data['selectedRouteId']      ?? null;
        $route                = $order->route_id ? Route::find($order->route_id) : null;
        $order->program_id    = optional($route)->program_id    ?? null;
        $order->restaurant_id = optional($route)->restaurant_id ?? ($data['selectedRestaurantId'] ?? null);
        $order->cars          = $data['cars'] ?? ($order->transfer_id ? (int) ceil($order->members / 5) : 0);

        // ── Pricing ───────────────────────────────────────────────────
        $order->boat_price     = $data['boatPrice']     ?? 0;
        $order->tour_price     = $data['tourPrice']     ?? 0;
        $order->transfer_price = $data['transferPrice'] ?? 0;
        $order->cover_price    = $data['coverPrice']    ?? 0;
        $order->program_price  = $data['programPrice']  ?? 0;
        $order->extras_total   = $data['extrasTotal']   ?? 0;

        $order->total_price    = $data['totalPrice']    ?? 0;
        $order->full_price     = $data['fullPrice']     ?? 0;
        $order->discount_price = $data['discountPrice'] ?? 0;
        $order->discount       = $data['discount']      ?? 0;

        // ── Promo / agent ─────────────────────────────────────────────
        $order->promocode  = $data['promocode']  ?? null;
        $order->agent_fee  = $data['agent_fee']  ?? 0;
        $order->agent_name = $data['agent_name'] ?? null;

        // ── Deposit & payment method ──────────────────────────────────
        $order->deposite = $data['deposite'] ?? 0;
        if ($order->deposite > 0) {
            $order->method_id     = $data['method'];
            $order->deposite_summ = $order->full_price * $order->deposite / 100;
        }

        // ── Extras ────────────────────────────────────────────────────
        $order->extras = $data['selectedExtras'] ?? [];

        // ── Guest contact ─────────────────────────────────────────────
        $order->name            = $data['name'];
        $order->email           = $data['email'];
        $order->whatsapp        = $data['whatsapp']       ?? null;
        $order->requests        = $data['requests']       ?? null;
        $order->pickup_address  = $data['pickupAddress']  ?? null;
        $order->dropoff_address = $data['dropoffAddress'] ?? null;

        $order->source_id = 1;

        $order->save();

        Session::put('order_id', $order->id);

        \Log::info('[PrivateOrder] saved', ['order_id' => $order->id, 'external_id' => $order->external_id]);

        return response()->json(['external_id' => $order->external_id]);

        } catch (\Throwable $e) {
            \Log::error('PrivateOrderController error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/new/order/private/pay
     *
     * Accepts {external_id}, loads the saved order, calls Xendit or PayPal,
     * and returns the payment URL. Safe to retry — order already exists.
     */
    public function createPaymentLink(Request $request)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        set_time_limit(120);

        try {
            $externalId = $request->input('external_id');
            if (!$externalId) {
                return response()->json(['error' => 'external_id required'], 422);
            }

            $order = Order::with('tours')->where('external_id', $externalId)->first();
            if (!$order) {
                return response()->json(['error' => 'Order not found'], 404);
            }

            \Log::info('[PrivateOrder] createPaymentLink', [
                'external_id' => $externalId,
                'method_id'   => $order->method_id,
                'deposite'    => $order->deposite,
                'amount'      => $order->deposite_summ,
            ]);

            if ($order->deposite == 0) {
                return response()->json(url('/new/success') . '?type=request');
            }

            $successBase = url('/new/success') . '?type=private'
                . '&order_id=' . urlencode($order->external_id)
                . '&num_items=' . ($order->adults + $order->kids)
                . '&content_ids=' . $order->tours_id;

            if ($order->method_id == 1) {
                $successUrl = $successBase . '&amount=' . $order->deposite_summ . '&currency=IDR';
                $url = XenditService::createPaymentLink(
                    $order->external_id,
                    $order->deposite_summ,
                    $order->email,
                    $successUrl,
                    url('/error'),
                    $order->tours->name ?? 'Private Tour'
                );
            } else {
                $usd_rate = Rates::find(2)->rate;
                $usd_summ = $usd_rate * $order->deposite_summ;
                $successUrl = $successBase . '&amount=' . round($usd_summ, 2) . '&currency=USD';
                $url = PayPalService::createPaymentLink(
                    $order->external_id,
                    $usd_summ,
                    $order->email,
                    $successUrl,
                    url('/error'),
                    $order->tours->name ?? 'Private Tour'
                );
            }

            return response()->json($url);

        } catch (\Throwable $e) {
            \Log::error('PrivateOrderController@createPaymentLink error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Select the first available boat for a private tour by sort_order.
     * A boat is available if it has no active closeddates for the given date.
     */
    protected function selectBoatForOrder(int $tourId, string $date): ?int
    {
        $tour = Tours::with(['boat' => function ($q) {
            $q->orderBy('sort_order')->orderBy('id');
        }])->find($tourId);

        if (!$tour || $tour->boat->isEmpty()) return null;

        foreach ($tour->boat as $boat) {
            if (!empty($boat->closed)) continue;

            $hasRecord = Closeddates::where('boat_id', $boat->id)
                ->where('date', $date)
                ->whereNull('deleted_at')
                ->exists();

            if (!$hasRecord) return $boat->id;
        }

        return null;
    }
}
