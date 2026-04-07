<?php namespace Noren\Booking\Odoo;

use Illuminate\Routing\Controller;
use Noren\Booking\Classes\XenditService;

class OdooPayController extends Controller
{
    // ─── GET /odoo-pay/{id} ───────────────────────────────────────────────────

    public function pay(int $id)
    {
        try {
            $info = OdooService::getOrderInfo($id);
        } catch (\Throwable $e) {
            return view('noren.booking::odoo_pay_error', ['message' => 'Order not found']);
        }

        if ($info['state'] !== 'sale') {
            return view('noren.booking::odoo_pay_error', ['message' => 'Order is not confirmed']);
        }

        $amount = $info['collect'];

        if ($amount <= 0) {
            return view('noren.booking::odoo_pay_error', ['message' => 'Nothing to pay']);
        }

        $returnUrl  = url('odoo-pay/' . $id . '/callback');
        $invoiceUrl = XenditService::createLink(
            'odoo_' . $id,
            $amount,
            $returnUrl,
            $returnUrl,
            'Payment for order #' . $id
        );

        return redirect($invoiceUrl);
    }
}
