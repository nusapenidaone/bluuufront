<?php namespace Noren\Booking\Doku;

use Illuminate\Routing\Controller;
use Noren\Booking\Odoo\OdooService;

class DokuPayController extends Controller
{
    // ─── GET /doku-weblink/{id}/{key} ──────────────────────────────────────────

    public function pay(int $id, string $key)
    {
        try {
            $info = OdooService::getOrderInfo($id);
        } catch (\Throwable $e) {
            return view('noren.booking::odoo_pay_error', ['message' => 'Order not found']);
        }

        // Same key mismatch and "not found" return the same message —
        // avoids leaking whether the id or the key is wrong.
        if (empty($info['unique_key']) || !hash_equals($info['unique_key'], $key)) {
            return view('noren.booking::odoo_pay_error', ['message' => 'Order not found']);
        }

        if ($info['state'] === 'cancel') {
            return view('noren.booking::odoo_pay_error', ['message' => 'Order is cancelled']);
        }

        $amount = $info['collect'];

        if ($amount <= 0) {
            return view('noren.booking::odoo_pay_error', ['message' => 'Nothing to pay']);
        }

        $returnUrl  = url("doku-weblink/{$id}/{$key}/callback");
        $invoiceUrl = DokuService::createLink(
            'odoo_' . $id,
            $amount,
            $returnUrl,
            $returnUrl,
            'Payment for order ' . $id
        );

        return redirect($invoiceUrl);
    }
}
