<?php

namespace Noren\Booking\Api;

use Carbon\Carbon;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use Dompdf\Dompdf;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Log;
use Noren\Booking\Classes\XenditService;
use Noren\Booking\Classes\PaymentMethod;
use Noren\Booking\Doku\DokuService;
use Noren\Booking\Odoo\OdooService;
use Noren\Bluuu\Models\Registration;

// Standalone counterpart to CheckinController, feeding the React check-in
// wizard at /checkin1/:odoo_id/:key. Kept fully separate (own controller, own
// routes) so the existing /checkin/:odoo_id page and its API are never
// touched while the React rewrite is trialled in parallel. Auth mirrors
// CabinetController: the link must carry x_studio_unique_key, not just the id.
class Checkin1Controller extends Controller
{
    private function cors(): void
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: *');
    }

    // Fetch Odoo order and verify key matches x_studio_unique_key (= external_id set at order creation).
    private function fetchOdooOrder(int $odooId, string $key): ?array
    {
        try {
            $order = OdooService::getFullOrder($odooId);
        } catch (\Exception $e) {
            Log::warning('Checkin1Controller: Odoo fetch failed', ['odoo_id' => $odooId, 'error' => $e->getMessage()]);
            return null;
        }

        $uniqueKey = $order['x_studio_unique_key'] ?? '';
        if (!$uniqueKey || $uniqueKey !== $key) {
            return null;
        }

        if (($order['state'] ?? '') === 'cancel') {
            return null;
        }

        return $order;
    }

    // Trip already happened (Bali calendar day) — frontend shows a "see you
    // again" screen instead of the wizard/QR once this is true.
    private function isExpired(array $order): bool
    {
        $startDate = $order['rental_start_date'] ?? null;
        if (!$startDate) return false;

        $travelDate = Carbon::parse($startDate, 'UTC')->setTimezone('Asia/Makassar')->format('Y-m-d');
        return $travelDate < Carbon::now('Asia/Makassar')->format('Y-m-d');
    }

    // ─── GET /api/new/checkin1/{odoo_id}/{key} ────────────────────────────────

    public function show(Request $request, int $odoo_id, string $key)
    {
        $this->cors();

        $order = $this->fetchOdooOrder($odoo_id, $key);
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        return response()->json($this->formatOrder($order));
    }

    // ─── POST /api/new/checkin1/{odoo_id}/{key}/save ──────────────────────────
    // Save passengers to Odoo, mark checked in

    public function save(Request $request, int $odoo_id, string $key)
    {
        $this->cors();

        $order = $this->fetchOdooOrder($odoo_id, $key);
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

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
            'x_studio_passenger_list'           => trim($list),
            'x_studio_online_check_in_complete' => true,
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
            foreach ($courseNames as $courseKey => $label) {
                $items = [];
                foreach ((array) ($menu[$courseKey] ?? []) as $optId => $qty) {
                    if ((int) $qty > 0) {
                        $items[] = ($optionNames[$optId] ?? $optId) . ' ×' . (int) $qty;
                    }
                }
                if ($items) {
                    $parts[] = $label . ': ' . implode(', ', $items);
                }
            }
            if ($parts) {
                $updateFields['x_studio_first_class_menu_selection'] = implode(' | ', $parts);
            }
        }

        try {
            OdooService::updateOrderFields($odoo_id, $updateFields);
        } catch (\Exception $e) {
            Log::error('Checkin1Controller::save — ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }

        return response()->json(['success' => true]);
    }

    // ─── POST /api/new/checkin1/{odoo_id}/{key}/pay ───────────────────────────

    public function pay(Request $request, int $odoo_id, string $key)
    {
        $this->cors();

        $order = $this->fetchOdooOrder($odoo_id, $key);
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $method = PaymentMethod::default();
        $email  = (string) $request->input('email', '');

        try {
            $collectAmount = OdooService::getOrderCollect($odoo_id);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to get collect amount'], 502);
        }

        if ($collectAmount <= 0) {
            return response()->json(['error' => 'No remaining amount to pay'], 400);
        }

        // Online remainder payment carries the same 2.5% gateway surcharge as full
        // payment at booking — charged to the customer, recorded separately in Odoo
        // as x_studio_extra_processing_fee (never folded into x_studio_collect).
        $feeAmount    = (int) round($collectAmount * 0.025);
        $chargeAmount = $collectAmount + $feeAmount;
        // Fee travels to the webhook via the external_id itself — the "_f{fee}" segment
        // is parsed back out there (see DokuWebhookController / VerifyController).
        $extId      = 'odoo_' . $odoo_id . '_f' . $feeAmount;
        $cancelUrl  = url('/checkin1/' . $odoo_id . '/' . $key);
        $successUrl = url('/checkin1/' . $odoo_id . '/' . $key) . '?paid=1';
        $desc       = 'Bluuu Tour #' . $odoo_id;

        if ($method === 3) {
            // Unique per attempt — DOKU rejects a re-used invoice_number, and the
            // odoo_{id} prefix (needed by the webhook) still parses fine since the
            // regex there stops at the first non-digit/non-"_f<digits>" segment.
            $payUrl = DokuService::createPaymentLink($extId . '_' . time(), $chargeAmount, $email, $successUrl, $cancelUrl, $desc);
        } else {
            $payUrl = XenditService::createPaymentLink($extId, $chargeAmount, $email, $successUrl, $cancelUrl, $desc);
        }

        return response()->json(['payment_url' => $payUrl]);
    }

    // ─── GET /api/new/checkin1/{odoo_id}/{key}/qr ─────────────────────────────
    // Feeds the post-checkin confirmation page (QR + downloadable PDF) — the
    // React counterpart of themes/bluuu/pages/checkin/qr.htm, which is left
    // untouched and keeps serving the old /checkin/:id/qr page.

    public function qr(Request $request, int $odoo_id, string $key)
    {
        $this->cors();

        $order = $this->fetchOdooOrder($odoo_id, $key);
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $name      = is_array($order['partner_id']) ? ($order['partner_id'][1] ?? '') : '';
        $startDate = $order['rental_start_date'] ?? null;
        $travelDate    = '';
        $travelDateFmt = '';
        $meetingTime   = '';

        if ($startDate) {
            $dt            = Carbon::parse($startDate, 'UTC')->setTimezone('Asia/Makassar');
            $travelDate    = $dt->format('Y-m-d');
            $travelDateFmt = $dt->format('d M Y');
            $meetingTime   = $dt->format('H:i');
        }

        $boatName = $order['x_studio_boat_name'] ?? '';
        $orderNum = $order['name'] ?? "#{$odoo_id}";
        $people   = (int) ($order['x_studio_count_of_people'] ?? 0);
        $route    = $order['x_studio_route_new'] ?? '';
        $expired  = $this->isExpired($order);

        // Once the trip has passed there's nothing to check in for — skip the
        // (fairly expensive) QR/PDF generation and let the frontend show the
        // "see you again" screen instead.
        if ($expired) {
            return response()->json([
                'expired'         => true,
                'name'            => $name,
                'order_number'    => $orderNum,
                'boat_name'       => $boatName,
                'travel_date'     => $travelDate,
                'travel_date_fmt' => $travelDateFmt,
                'meeting_time'    => $meetingTime,
                'route'           => $route,
                'people'          => $people,
            ]);
        }

        $odooUrl = "https://pt-day-trip-bali.odoo.com/web?debug=assets#id={$odoo_id}&cids=22-1-18-21-15-16-2-20-19-24-3-14-11-13-12-17&menu_id=526&action=744&model=sale.order&view_type=form";
        $qr  = $this->generateQr($odooUrl);
        $pdf = $this->generatePdf($qr, $name, $orderNum, $boatName, $travelDateFmt, $meetingTime, $people);

        return response()->json([
            'expired'         => false,
            'name'            => $name,
            'order_number'    => $orderNum,
            'boat_name'       => $boatName,
            'travel_date'     => $travelDate,
            'travel_date_fmt' => $travelDateFmt,
            'meeting_time'    => $meetingTime,
            'route'           => $route,
            'people'          => $people,
            'qr'              => $qr,
            'pdf'             => $pdf,
        ]);
    }

    private function generateQr(string $text): string
    {
        $options = new QROptions([
            'outputType' => QRCode::OUTPUT_IMAGE_PNG,
            'scale'      => 9,
        ]);
        return (new QRCode($options))->render($text);
    }

    private function generatePdf(string $qr, string $name, string $orderNum, string $boatName, string $travelDate, string $meetingTime, int $people): string
    {
        $dompdf = new Dompdf();
        $html   = "
        <style>
            @page { margin:0; size:A4 portrait; }
            * { box-sizing:border-box; }
            body { margin:0; font-family:Arial,sans-serif; color:#1a1a1a; font-size:15px; }
        </style>

        <!-- Header -->
        <div style='background-color:#0073E0; color:#fff; padding:36px 36px 28px; text-align:center;'>
            <div style='font-size:36px; font-weight:bold; letter-spacing:6px; margin-bottom:6px;'>BLUUU</div>
            <div style='font-size:13px; letter-spacing:2px; color:rgba(255,255,255,0.7); text-transform:uppercase; margin-bottom:20px;'>Nusa Penida Day Tour</div>
            <div style='display:inline-block; background:rgba(255,255,255,0.18); border-radius:10px; padding:10px 28px;'>
                <div style='font-size:17px; font-weight:bold; letter-spacing:0.5px;'>Check-In Confirmed</div>
            </div>
        </div>

        <!-- Order strip -->
        <div style='background:#eef6ff; border-bottom:2px solid #cce4ff; padding:12px 36px; text-align:right;'>
            <span style='color:#888; font-size:13px; letter-spacing:0.5px;'>ORDER </span>
            <span style='color:#0073E0; font-weight:bold; font-size:18px; letter-spacing:0.5px;'>{$orderNum}</span>
        </div>

        <!-- Details table -->
        <div style='padding:24px 36px 16px;'>
            <table style='width:100%; border-collapse:collapse;'>
                <tr>
                    <td style='padding:11px 0; color:#888; width:38%; border-bottom:1px solid #f0f0f0; font-size:14px;'>Name</td>
                    <td style='padding:11px 0; font-weight:bold; color:#0f172a; border-bottom:1px solid #f0f0f0; font-size:15px;'>{$name}</td>
                </tr>
                <tr>
                    <td style='padding:11px 0; color:#888; border-bottom:1px solid #f0f0f0; font-size:14px;'>Yacht</td>
                    <td style='padding:11px 0; font-weight:bold; color:#0f172a; border-bottom:1px solid #f0f0f0; font-size:15px;'>{$boatName}</td>
                </tr>
                <tr>
                    <td style='padding:11px 0; color:#888; border-bottom:1px solid #f0f0f0; font-size:14px;'>Travel Date</td>
                    <td style='padding:11px 0; font-weight:bold; color:#0f172a; border-bottom:1px solid #f0f0f0; font-size:15px;'>{$travelDate}</td>
                </tr>
                <tr>
                    <td style='padding:11px 0; color:#888; border-bottom:1px solid #f0f0f0; font-size:14px;'>Meeting Time</td>
                    <td style='padding:11px 0; font-weight:bold; color:#0f172a; border-bottom:1px solid #f0f0f0; font-size:15px;'>{$meetingTime}</td>
                </tr>
                <tr>
                    <td style='padding:11px 0; color:#888; font-size:14px;'>Passengers</td>
                    <td style='padding:11px 0; font-weight:bold; color:#0f172a; font-size:15px;'>{$people}</td>
                </tr>
            </table>
        </div>

        <!-- Meeting point -->
        <div style='margin:4px 36px 20px; padding:14px 18px; background:#f8fafc; border-radius:10px; border-left:4px solid #0073E0;'>
            <div style='font-size:12px; color:#888; text-transform:uppercase; letter-spacing:1px; margin-bottom:5px;'>Meeting Point</div>
            <div style='font-weight:bold; font-size:16px; color:#0073E0; margin-bottom:2px;'>Bluuu Tours office</div>
            <div style='color:#555; font-size:14px;'>Serangan Harbor, Bali</div>
        </div>

        <!-- QR code full width -->
        <div style='padding:0 36px; text-align:center;'>
            <img src='{$qr}' style='width:260px; height:260px; display:block; margin:0 auto; border-radius:10px; border:1px solid #e8edf2;'>
            <div style='margin-top:12px; font-size:13px; color:#94a3b8;'>Present this QR code to our manager at the check-in desk</div>
        </div>

        <!-- Footer -->
        <div style='background:#0073E0; padding:14px 36px; text-align:center; margin-top:28px;'>
            <span style='color:rgba(255,255,255,0.65); font-size:13px; letter-spacing:2px; text-transform:uppercase;'>bluuu.tours</span>
        </div>";

        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->set_option('defaultFont', 'Arial');
        $dompdf->set_option('isHtml5ParserEnabled', true);
        $dompdf->set_option('isRemoteEnabled', true);
        $dompdf->render();

        return 'data:application/pdf;base64,' . base64_encode($dompdf->output());
    }

    // ─── Helpers ────────────────────────────────────────────────────────────

    private function formatOrder(array $order): array
    {
        $partnerId   = is_array($order['partner_id']) ? (int) ($order['partner_id'][0] ?? 0) : 0;
        $name        = is_array($order['partner_id']) ? ($order['partner_id'][1] ?? '') : '';
        $startDate   = $order['rental_start_date'] ?? null;
        $travelDate  = '';
        $meetingTime = '';

        if ($startDate) {
            $dt          = Carbon::parse($startDate, 'UTC')->setTimezone('Asia/Makassar');
            $travelDate  = $dt->format('Y-m-d');
            $meetingTime = $dt->format('H:i');
        }

        $email = '';
        $phone = '';
        if ($partnerId) {
            try {
                $partners = OdooService::readPartners([$partnerId]);
                $partner  = $partners[$partnerId] ?? [];
                $email    = $partner['email'] ?? '';
                $phone    = $partner['phone'] ?? '';
            } catch (\Exception $e) {}
        }

        return [
            'odoo_id'             => (int) $order['id'],
            'order_number'        => $order['name'] ?? '',
            'state'               => $order['state'] ?? '',
            'name'                => $name,
            'email'               => $email,
            'phone'               => $phone,
            'travel_date'         => $travelDate,
            'meeting_time'        => $meetingTime,
            'boat_name'           => $order['x_studio_boat_name'] ?? '',
            'route'               => $order['x_studio_route_new'] ?? '',
            'adults'              => (int) ($order['x_studio_adults'] ?? 0),
            'kids'                => (int) ($order['x_studio_kids'] ?? 0),
            'count_of_people'     => (int) ($order['x_studio_count_of_people'] ?? 0),
            'collect'             => (float) ($order['x_studio_collect'] ?? 0),
            'has_lunch'           => ($order['x_studio_tour_type'] ?? '') === 'First Class Shared',
            'already_checked_in'  => !empty($order['x_studio_online_check_in_complete']),
            'expired'             => $this->isExpired($order),
            'reg'                 => $this->formatRegistration(),
        ];
    }

    private function formatRegistration(): array
    {
        $reg   = Registration::instance();
        $regS1 = (array) ($reg->step1 ?? []);
        $regS2 = (array) ($reg->step2 ?? []);
        $regS3 = (array) ($reg->step3 ?? []);

        $imgPath = $regS1['img'] ?? '';
        $imgUrl  = $imgPath ? '/storage/app/media' . $imgPath : '';

        $videoUrl = $regS2['video'] ?? '';
        $embedUrl = '';
        if ($videoUrl) {
            if (strpos($videoUrl, '/embed/') !== false) {
                $embedUrl = $videoUrl;
            } elseif (preg_match('/(?:youtu\.be\/|[?&]v=)([\w-]+)/', $videoUrl, $m)) {
                $embedUrl = 'https://www.youtube.com/embed/' . $m[1] . '?rel=0';
            } else {
                $embedUrl = $videoUrl;
            }
        }

        return [
            's1_img'   => $imgUrl,
            's1_title' => $regS1['title'] ?? '',
            's1_desc'  => $regS1['description'] ?? '',
            's2_title' => $regS2['title'] ?? '',
            's2_desc'  => $regS2['description'] ?? '',
            's2_video' => $embedUrl,
            's3_title' => $regS3['title'] ?? '',
            's3_desc'  => $regS3['description'] ?? '',
            's3_map'   => $regS3['map'] ?? '',
            's3_text'  => $regS3['text'] ?? '',
            's4'       => $this->formatRegStep((array) ($reg->step4 ?? [])),
            's5'       => $this->formatRegStep((array) ($reg->step5 ?? [])),
            's6'       => $this->formatRegStep((array) ($reg->step6 ?? [])),
            's7'       => $this->formatRegStep((array) ($reg->step7 ?? [])),
            's8'       => $this->formatRegStep((array) ($reg->step8 ?? [])),
        ];
    }

    private function formatRegStep(array $s): array
    {
        $list = [];
        foreach ((array) ($s['list'] ?? []) as $item) {
            $item     = (array) $item;
            $iconPath = $item['icon'] ?? '';
            $list[]   = [
                'title' => $item['title'] ?? '',
                'text'  => $item['text']  ?? '',
                'icon'  => $iconPath ? '/storage/app/media' . $iconPath : '',
            ];
        }
        return [
            'title' => $s['title']       ?? '',
            'desc'  => $s['description'] ?? '',
            'list'  => $list,
            'text'  => $s['text']        ?? '',
        ];
    }
}
