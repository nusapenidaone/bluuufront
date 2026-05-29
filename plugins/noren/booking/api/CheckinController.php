<?php

namespace Noren\Booking\Api;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Log;
use Mail;
use Noren\Booking\Classes\PayPalService;
use Noren\Booking\Classes\XenditService;
use Noren\Booking\Models\Rates;
use Noren\Booking\Odoo\OdooService;

class CheckinController extends Controller
{
    private function cors(): void
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');
    }

    // ─── GET /api/new/checkin/{odoo_id} ──────────────────────────────────────

    public function show(Request $request, int $odoo_id)
    {
        $this->cors();
        try {
            $order = OdooService::getFullOrder($odoo_id);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Order not found'], 404);
        }
        return response()->json($this->formatOrder($order));
    }

    // ─── POST /api/new/checkin/{odoo_id}/save ─────────────────────────────────
    // Save passengers to Odoo, mark checked in

    public function save(Request $request, int $odoo_id)
    {
        $this->cors();

        $passengers = $request->input('passengers', []);
        $menu       = $request->input('menu', null);

        $list = '';
        foreach ((array) $passengers as $i => $p) {
            $num    = $i + 1;
            $name   = $p['name']    ?? '';
            $age    = $p['age']     ?? '';
            $gender = $p['gender']  ?? '';
            $ctry   = $p['country'] ?? '';
            $list  .= "{$num}. {$name} | Age: {$age} | {$gender} | {$ctry}\n";
        }

        $updateFields = [
            'x_studio_passenger_list'                  => trim($list),
            'x_studio_customer_checked_in_and_cleared' => true,
        ];

        if (!empty($menu) && is_array($menu)) {
            $courseNames = [
                'starter'   => 'Starter',
                'main'      => 'Main Course',
                'dessert'   => 'Dessert',
                'beverages' => 'Beverages',
            ];
            $optionNames = [
                's1' => 'Gyoza', 's2' => 'Beef Tataki', 's3' => 'Brazilian Croquettes',
                'm1' => 'BBQ Prawn', 'm2' => 'Beef Kebab BBQ', 'm3' => 'Chicken Gravy Steak',
                'd1' => 'Chocolate Mousse', 'd2' => 'Churros', 'd3' => 'Melting Tiramisu',
                'b1' => 'Soft Drinks', 'b2' => 'Freshness', 'b3' => 'Cocktails',
            ];
            $parts = [];
            foreach ($courseNames as $key => $label) {
                $items = [];
                foreach ((array) ($menu[$key] ?? []) as $optId => $qty) {
                    if ((int) $qty > 0) {
                        $items[] = ($optionNames[$optId] ?? $optId) . ' ×' . (int) $qty;
                    }
                }
                if ($items) {
                    $parts[] = $label . ': ' . implode(', ', $items);
                }
            }
            if ($parts) {
                $updateFields['x_studio_first_class_menu'] = implode(' | ', $parts);
            }
        }

        try {
            OdooService::updateOrderFields($odoo_id, $updateFields);
        } catch (\Exception $e) {
            Log::error('CheckinController::save — ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }

        $email = (string) $request->input('email', '');
        if ($email) {
            try {
                $order = OdooService::getFullOrder($odoo_id);
                $fmt   = $this->formatOrder($order);
                $vars  = [
                    'odoo_id' => $odoo_id,
                    'name'    => $fmt['name'],
                    'date'    => $fmt['travel_date'],
                    'time'    => $fmt['meeting_time'],
                ];
                Mail::send('registration', $vars, function ($message) use ($email) {
                    $message->to($email);
                });
            } catch (\Exception $e) {
                Log::error('CheckinController::save — email send failed: ' . $e->getMessage());
            }
        }

        return response()->json(['success' => true]);
    }

    // ─── POST /api/new/checkin/{odoo_id}/pay ──────────────────────────────────

    public function pay(Request $request, int $odoo_id)
    {
        $this->cors();

        $method = (int) $request->input('method', 1);
        $email  = (string) $request->input('email', '');

        try {
            $collectAmount = OdooService::getOrderCollect($odoo_id);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to get collect amount'], 502);
        }

        if ($collectAmount <= 0) {
            return response()->json(['error' => 'No remaining amount to pay'], 400);
        }

        $extId      = 'odoo_' . $odoo_id;
        $cancelUrl  = url('/checkin/' . $odoo_id);
        $successUrl = url('/checkin/' . $odoo_id) . '?paid=1';
        $desc       = 'Bluuu Tour #' . $odoo_id;

        if ($method === 2) {
            $rate   = Rates::where('code', 'USD')->orderBy('id', 'desc')->first();
            $usdAmt = $rate ? round((float) $rate->rate * $collectAmount, 2) : 0;
            $payUrl = PayPalService::createPaymentLink($extId, $usdAmt, $email, $successUrl, $cancelUrl, $desc);
        } else {
            $payUrl = XenditService::createPaymentLink($extId, $collectAmount, $email, $successUrl, $cancelUrl, $desc);
        }

        return response()->json(['payment_url' => $payUrl]);
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private function formatOrder(array $order): array
    {
        $name        = is_array($order['partner_id']) ? ($order['partner_id'][1] ?? '') : '';
        $startDate   = $order['rental_start_date'] ?? null;
        $travelDate  = '';
        $meetingTime = '';

        if ($startDate) {
            $dt          = Carbon::parse($startDate, 'UTC')->setTimezone('+04:00');
            $travelDate  = $dt->format('Y-m-d');
            $meetingTime = $dt->format('H:i');
        }

        return [
            'odoo_id'         => (int) $order['id'],
            'order_number'    => $order['name'] ?? '',
            'state'           => $order['state'] ?? '',
            'name'            => $name,
            'travel_date'     => $travelDate,
            'meeting_time'    => $meetingTime,
            'boat_name'       => $order['x_studio_boat_name'] ?? '',
            'route'           => $order['x_studio_route_new'] ?? '',
            'adults'          => (int) ($order['x_studio_adults'] ?? 0),
            'kids'            => (int) ($order['x_studio_kids'] ?? 0),
            'count_of_people' => (int) ($order['x_studio_count_of_people'] ?? 0),
            'collect'         => (float) ($order['x_studio_collect'] ?? 0),
        ];
    }
}
