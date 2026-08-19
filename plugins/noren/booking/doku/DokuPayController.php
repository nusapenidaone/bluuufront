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

        // DOKU rejects a re-used invoice_number ("INVOICE ALREADY USED") — append a
        // per-click nonce so retries/repeat visits to the same weblink work. The
        // 'odoo_{id}' prefix (needed by the webhook to route the payment) still
        // parses correctly since (int) casting stops at the first non-digit char.
        $returnUrl  = url("doku-weblink/{$id}/{$key}/callback");
        $invoiceUrl = DokuService::createLink(
            'odoo_' . $id . '_' . time(),
            $amount,
            $returnUrl,
            $returnUrl,
            'Payment for order ' . $id
        );

        return redirect($invoiceUrl);
    }
}
