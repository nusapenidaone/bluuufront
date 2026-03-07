<?php

namespace Noren\Booking\Routes;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Session;

use Noren\Booking\Models\Order;
use Noren\Booking\Models\Rates;

use Noren\Booking\Classes\XenditService;
use Noren\Booking\Classes\PayPalService;

use Log;

class SharedOrderController extends Controller
{
    /**
     * POST /api/new/order/shared
     *
     * Accepts shared-tour booking data and creates an Order record.
     * Returns a payment URL (Xendit or PayPal) or a success URL for request-type orders.
     *
     * Expected JSON body:
     * {
     *   // Tour
     *   "tourId":           int,        // shared tour ID (classic / premium)
     *   "travelDate":       "YYYY-MM-DD",
     *
     *   // Guests
     *   "adults":           int,
     *   "kids":             int,        // children 3–11
     *   "children":         int,        // infants 0–2
     *
     *   // Pricing  (all in IDR)
     *   "pricePerPerson":   float,      // per-person base price for that date
     *   "tourPrice":        float,      // pricePerPerson * (adults + kids)
     *   "transferPrice":    float,
     *   "coverPrice":       float,
     *   "extrasTotal":      float,
     *   "totalPrice":       float,      // what the customer pays now (or deposit)
     *   "fullPrice":        float,      // full order value
     *   "discountPrice":    float,      // amount discounted
     *   "discount":         float,      // discount % or flat amount
     *
     *   // Selected options (IDs)
     *   "selectedTransferId": int|null,
     *   "selectedCoverId":    int|null,
     *   "selectedRouteId":    int|null, // shared-tour route (classic / premium)
     *   "selectedExtras":     array,    // [{id, qty, price, name}, ...]
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

        try {

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

        // ── UTM from session ──────────────────────────────────────────
        if (Session::has('utm')) {
            $order->utm = Session::get('utm');
            Session::forget('utm');
        }

        // ── Analytics ─────────────────────────────────────────────────
        $order->ga_client_id = $data['ga_client_id'] ?? null;
        $order->amo_lead_id  = $data['leadId']        ?? null;

        // ── Tour & dates ──────────────────────────────────────────────
        $order->tours_id    = $data['tourId'];
        $order->travel_date = $data['travelDate'];

        // ── Guests ────────────────────────────────────────────────────
        $order->adults   = $data['adults']   ?? 0;
        $order->kids     = $data['kids']     ?? 0;
        $order->children = $data['children'] ?? 0;
        $order->members  = ($data['adults'] ?? 0) + ($data['kids'] ?? 0);
        $order->cars     = 0;   // not applicable for shared tours

        // ── Selected options ──────────────────────────────────────────
        $order->transfer_id  = $data['selectedTransferId'] ?? null;
        $order->cover_id     = $data['selectedCoverId']    ?? null;
        $order->program_id   = $data['selectedRouteId']    ?? null;  // route stored as program
        $order->restaurant_id = null;   // shared tours handle restaurant via route

        // ── Pricing ───────────────────────────────────────────────────
        $order->boat_price     = 0;   // shared tours price per person, not per boat
        $order->tour_price     = $data['tourPrice']     ?? 0;
        $order->transfer_price = $data['transferPrice'] ?? 0;
        $order->cover_price    = $data['coverPrice']    ?? 0;
        $order->program_price  = 0;
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
            $order->method_id      = $data['method'];
            $order->deposite_summ  = $order->total_price * $order->deposite / 100;
        }

        // ── Extras ────────────────────────────────────────────────────
        $order->extras = $data['selectedExtras'] ?? [];

        // ── Guest contact ─────────────────────────────────────────────
        $order->name           = $data['name'];
        $order->email          = $data['email'];
        $order->whatsapp       = $data['whatsapp']      ?? null;
        $order->requests       = $data['requests']      ?? null;
        $order->pickup_address = $data['pickupAddress'] ?? null;
        $order->dropoff_address = $data['dropoffAddress'] ?? null;

        $order->save();

        Session::put('order_id', $order->id);

        // ── Request-only (no deposit) ─────────────────────────────────
        if ($order->deposite == 0) {
            return response()->json(url('/success/request-success'));
        }

        // ── Xendit payment ────────────────────────────────────────────
        if ($order->method_id == 1) {
            $url = XenditService::createPaymentLink(
                $order->external_id,
                $order->deposite_summ,
                $order->email,
                url('/success/payment-success'),
                url('/error'),
                $order->tours->name ?? 'Shared Tour'
            );

        // ── PayPal payment ────────────────────────────────────────────
        } else {
            $usd_rate = Rates::find(2)->rate;
            $usd_summ = $usd_rate * $order->deposite_summ;
            $url = PayPalService::createPaymentLink(
                $order->external_id,
                $usd_summ,
                $order->email,
                url('/success/payment-success'),
                url('/error'),
                $order->tours->name ?? 'Shared Tour'
            );
        }

        return response()->json($url);

        } catch (\Throwable $e) {
            \Log::error('SharedOrderController error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
