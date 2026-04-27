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
     * Accepts private-tour booking data and creates an Order record.
     * Returns a payment URL (Xendit or PayPal) or a success URL for request-type orders.
     *
     * Expected JSON body:
     * {
     *   // Tour
     *   "tourId":           int,        // private tour ID
     *   "travelDate":       "YYYY-MM-DD",
     *
     *   // Guests
     *   "adults":           int,
     *   "kids":             int,        // children 3–11
     *   "children":         int,        // infants 0–2
     *   "members":          int,        // adults + kids
     *   "cars":             int,        // number of cars for transfer
     *
     *   // Pricing  (all in IDR)
     *   "boatPrice":        float,      // base boat rental price
     *   "tourPrice":        float,      // tour price (may differ from boatPrice with discount)
     *   "transferPrice":    float,
     *   "coverPrice":       float,
     *   "programPrice":     float,      // route/program add-on price
     *   "extrasTotal":      float,
     *   "totalPrice":       float,      // what the customer pays now (or deposit)
     *   "fullPrice":        float,      // full order value
     *   "discountPrice":    float,      // amount discounted
     *   "discount":         float,      // discount % or flat amount
     *
     *   // Selected options (IDs)
     *   "selectedTransferId":   int|null,
     *   "selectedCoverId":      int|null,
     *   "selectedProgramId":    int|null,
     *   "selectedRestaurantId": int|null,
     *   "selectedExtras":       array,    // [{id, qty, price, name}, ...]
     *
     *   // Payment
     *   "deposite":   int,    // deposit % (0 = request only, no payment)
     *   "method":     int,    // 1 = Xendit, 2 = PayPal
     *
     *   // Promo / agent
     *   "promocode":  string|null,
     *   "agent_fee":  float,
     *   "agent_name": string|null,
     *
     *   // Guest contact
     *   "name":           string,
     *   "email":          string,
     *   "whatsapp":       string,
     *   "requests":       string|null,
     *   "pickupAddress":  string|null,
     *   "dropoffAddress": string|null,
     *
     *   // Analytics
     *   "ga_client_id": string|null,
     *   "leadId":       int|null,
     * }
     */
    public function createOrder(Request $request)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        // CSRF check (same as OrderController)
        // TODO: re-enable before production
        // if (Session::token() != $request->header('X-CSRF-TOKEN')) {
        //     return response('Unauthorized.', 401);
        // }

        $data = $request->all();

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

        // ── Request-only (no deposit) ─────────────────────────────────
        if ($order->deposite == 0) {
            return response()->json(url('/new/success') . '?type=request');
        }

        // ── Xendit payment ────────────────────────────────────────────
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

        // ── PayPal payment ────────────────────────────────────────────
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
