<?php

namespace Noren\Booking\Api;

use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Noren\Booking\Odoo\OdooService;

class QrController extends Controller
{
    // Ищет заказ по odoo_id и сверяет key с x_studio_unique_key заказа.
    private function fetchOdooOrder(int $odooId, string $key): ?array
    {
        try {
            $order = OdooService::getFullOrder($odooId);
        } catch (\Exception $e) {
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

    // ─── GET /api/new/qr/{odoo_id}/{key} ──────────────────────────────────────

    public function generate(Request $request, int $odoo_id, string $key)
    {
        $order = $this->fetchOdooOrder($odoo_id, $key);
        if (!$order) {
            return response()->json(['error' => 'Not found'], 404);
        }

        $odooUrl = "https://pt-day-trip-bali.odoo.com/web?debug=assets#id={$odoo_id}"
            . "&cids=22-1-18-21-15-16-2-20-19-24-3-14-11-13-12-17"
            . "&menu_id=526&action=744&model=sale.order&view_type=form";

        $options = new QROptions([
            'outputType'  => QRCode::OUTPUT_IMAGE_PNG,
            'scale'       => 9,
            'imageBase64' => false,
        ]);
        $png = (new QRCode($options))->render($odooUrl);

        return response($png, 200)->header('Content-Type', 'image/png');
    }
}
