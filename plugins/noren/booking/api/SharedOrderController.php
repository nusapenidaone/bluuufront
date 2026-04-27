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
     *   "cars":             int,        // number of cars for transfer
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
            Log::info($data);
            $order = new Order;

            // ── Order type & status ───────────────────────────────────────
            if (($data['deposite'] ?? 0) > 0) {
                $order->order_type_id = 1;   // order
                $order->status_id = 1;   // new
                $order->payment_status_id = 1;   // pending
            } else {
                $order->order_type_id = 2;   // request
                $order->status_id = 4;   // pending request
                $order->payment_status_id = 5;   // not paid
            }

            // ── UTM from request ──────────────────────────────────────────
            if (!empty($data['utm']) && is_array($data['utm'])) {
                $order->utm = $data['utm'];
            }

            // ── Analytics ─────────────────────────────────────────────────
            $order->ga_client_id = $data['ga_client_id'] ?? null;
            $order->amo_lead_id = $data['leadId'] ?? null;

            // ── Tour & dates ──────────────────────────────────────────────
            $order->tours_id = $data['tourId'];
            $order->boat_id = $this->selectBoatForOrder(
                (int) $data['tourId'],
                $data['travelDate'],
                ($data['adults'] ?? 0) + ($data['kids'] ?? 0)
            );
            $order->travel_date = $data['travelDate'];

            // ── Guests ────────────────────────────────────────────────────
            $order->adults = $data['adults'] ?? 0;
            $order->kids = $data['kids'] ?? 0;
            $order->children = $data['children'] ?? 0;
            $order->members = ($data['adults'] ?? 0) + ($data['kids'] ?? 0);

            // ── Selected options ──────────────────────────────────────────
            $order->transfer_id = $data['selectedTransferId'] ?? null;
            $order->cover_id = $data['selectedCoverId'] ?? null;
            $order->route_id = $data['selectedRouteId'] ?? null;
            $route = $order->route_id ? Route::find($order->route_id) : null;
            $order->program_id = optional($route)->program_id ?? null;
            $order->restaurant_id = optional($route)->restaurant_id ?? ($data['selectedRestaurantId'] ?? null);
            $order->cars = $data['cars'] ?? ($order->transfer_id ? (int) ceil($order->members / 5) : 0);

            // ── Pricing ───────────────────────────────────────────────────
            $order->boat_price = 0;   // shared tours price per person, not per boat
            $order->tour_price = $data['tourPrice'] ?? 0;
            $order->transfer_price = $data['transferPrice'] ?? 0;
            $order->cover_price = $data['coverPrice'] ?? 0;
            $order->program_price = 0;
            $order->extras_total = $data['extrasTotal'] ?? 0;

            $order->total_price = $data['totalPrice'] ?? 0;
            $order->full_price = $data['fullPrice'] ?? 0;
            $order->discount_price = $data['discountPrice'] ?? 0;
            $order->discount = $data['discount'] ?? 0;

            // ── Promo / agent ─────────────────────────────────────────────
            $order->promocode = $data['promocode'] ?? null;
            $order->agent_fee = $data['agent_fee'] ?? 0;
            $order->agent_name = $data['agent_name'] ?? null;

            // ── Deposit & payment method ──────────────────────────────────
            $order->deposite = $data['deposite'] ?? 0;
            if ($order->deposite > 0) {
                $order->method_id = $data['method'];
                $order->deposite_summ = $order->full_price * $order->deposite / 100;
            }

            // ── Extras ────────────────────────────────────────────────────
            $order->extras = $data['selectedExtras'] ?? [];

            // ── Guest contact ─────────────────────────────────────────────
            $order->name = $data['name'];
            $order->email = $data['email'];
            $order->whatsapp = $data['whatsapp'] ?? null;
            $order->requests = $data['requests'] ?? null;
            $order->pickup_address = $data['pickupAddress'] ?? null;
            $order->dropoff_address = $data['dropoffAddress'] ?? null;

            $order->source_id = 1;

            $order->save();

            Log::info('SharedOrder saved', [
                'order_id' => $order->id,
                'route_id' => $order->route_id,
                'restaurant_id' => $order->restaurant_id,
                'program_id' => $order->program_id,
            ]);

            Session::put('order_id', $order->id);

            // ── Request-only (no deposit) ─────────────────────────────────
            if ($order->deposite == 0) {
                return response()->json(url('/new/success') . '?type=request');
            }

            // ── Xendit payment ────────────────────────────────────────────
            $successBase = url('/new/success') . '?type=shared'
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
                    $order->tours->name ?? 'Shared Tour'
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
                    $order->tours->name ?? 'Shared Tour'
                );
            }

            return response()->json($url);

        } catch (\Throwable $e) {

            \Log::error('SharedOrderController error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Select the best boat for a shared order:
     * 1. Exact match — boat whose available seats == group size (by sort_order)
     * 2. First boat by sort_order that has available seats >= 1
     */
    protected function selectBoatForOrder(int $tourId, string $date, int $members): ?int
    {
        $tour = Tours::with([
            'boat' => function ($q) {
                $q->orderBy('sort_order')->orderBy('id');
            }
        ])->find($tourId);

        if (!$tour || $tour->boat->isEmpty())
            return null;

        $boatAvail = [];
        foreach ($tour->boat as $boat) {
            $records = Closeddates::where('boat_id', $boat->id)
                ->where('date', $date)
                ->whereNull('deleted_at')
                ->get();

            // Any blocking record → skip
            $blocked = $records->contains(function ($r) use ($boat) {
                if (!empty($boat->closed))
                    return true;
                $t = $r->type;
                return $t === null || $t === '' || in_array((int) $t, [2, 3, 4]);
            });

            if ($blocked) {
                $boatAvail[$boat->id] = 0;
                continue;
            }

            $booked = $records->where('type', 1)->sum('qtty');
            $boatAvail[$boat->id] = max(0, (int) $boat->capacity - (int) $booked);
        }

        // 1. Exact match
        foreach ($tour->boat as $boat) {
            if (($boatAvail[$boat->id] ?? 0) === $members)
                return $boat->id;
        }

        // 2. First by sort_order with enough available seats for the group
        foreach ($tour->boat as $boat) {
            if (($boatAvail[$boat->id] ?? 0) >= $members)
                return $boat->id;
        }

        return null;
    }
}
