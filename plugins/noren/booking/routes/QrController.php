<?php

namespace Noren\Booking\Routes;

use Illuminate\Routing\Controller;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;

class QrController extends Controller
{
    public function generate()
    {
        $odoo_id = request()->get('odoo_id');


        if (!$odoo_id) {
            return [];
        }

        $text = "https://pt-day-trip-bali.odoo.com/web?debug=assets#id=$odoo_id&cids=22-1-18-21-15-16-2-20-19-24-3-14-11-13-12-17&menu_id=526&action=744&model=sale.order&view_type=form";

        try {
            $options = new QROptions([
                'outputType'     => QRCode::OUTPUT_IMAGE_PNG,
                'scale'          => 9,
                'imageBase64'    => false,
            ]);

            $qrRaw = (new QRCode($options))->render($text);

            if (str_starts_with($qrRaw, 'data:image')) {
                $qrRaw = substr($qrRaw, strpos($qrRaw, ',') + 1);
                $qrRaw = base64_decode($qrRaw);
            }

            return response($qrRaw, 200)
                ->header('Content-Type', 'image/png')
                ->header('Content-Length', strlen($qrRaw))
                ->header('Cache-Control', 'no-store, no-cache, must-revalidate');
        }
        catch (\Throwable $e) {
            \Log::error('QR ERROR: '.$e->getMessage());
            abort(500, 'QR generation error');
        }
    }
}
