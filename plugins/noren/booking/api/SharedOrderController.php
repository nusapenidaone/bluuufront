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
     * Saves the order to the database immediately (no payment gateway call).
     * Returns {external_id} so the frontend can call /pay next.
     */
    public function createOrder(Request $request)
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $corsOrigin = in_array($origin, ['https://www.bluuu.tours', 'https://bluuu.tours']) ? $origin : 'https://bluuu.tours';
        header('Access-Control-Allow-Origin: ' . $corsOrigin);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, X-CSRF-TOKEN, Authorization');

        try {

            $data = $request->all();

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

            Session::put('order_id', $order->id);

            return response()->json(['external_id' => $order->external_id]);

        } catch (\Throwable $e) {

            \Log::error('SharedOrderController error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/new/order/shared/pay
     *
     * Accepts {external_id}, loads the saved order, calls Xendit or PayPal,
     * and returns the payment URL. Safe to retry — order already exists.
     */
    public function createPaymentLink(Request $request)
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $corsOrigin = in_array($origin, ['https://www.bluuu.tours', 'https://bluuu.tours']) ? $origin : 'https://bluuu.tours';
        header('Access-Control-Allow-Origin: ' . $corsOrigin);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, X-CSRF-TOKEN, Authorization');

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

            if ($order->deposite == 0) {
                return response()->json(url('/new/success') . '?type=request');
            }

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
            \Log::error('SharedOrderController@createPaymentLink error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
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
                $q->orderBy('noren_booking_tours_boat.sort_order')->orderBy('noren_booking_boat.sort_order')->orderBy('noren_booking_boat.id');
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

            $tourType = $tour->odoo_type ?? null;

            // Any blocking record → skip
            $blocked = $records->contains(function ($r) use ($boat, $tourType) {
                if (!empty($boat->closed))
                    return true;
                $t = (int) $r->type;
                if ($r->type === null || $r->type === '' || in_array($t, [2, 3, 4]))
                    return true;
                // Boat already used by a different shared tour
                if ($t === 1 && $r->tour_type && $r->tour_type !== $tourType)
                    return true;
                return false;
            });

            if ($blocked) {
                $boatAvail[$boat->id] = 0;
                continue;
            }

            $booked = $records->where('type', 1)->filter(function ($r) use ($tourType) {
                return !$r->tour_type || $r->tour_type === $tourType;
            })->sum('qtty');
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
