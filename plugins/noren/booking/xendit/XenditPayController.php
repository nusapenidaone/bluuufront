<?php namespace Noren\Booking\Xendit;

use Illuminate\Routing\Controller;
use Noren\Booking\Odoo\OdooService;
use Log;

/**
 * Оплата остатка по ссылке из Odoo — замена odoo/OdooPayController (/weblink/{id}).
 * Как doku-weblink: требует x_studio_unique_key, каждая попытка — уникальный external_id.
 * Наценка 2.5% здесь, как и в DOKU-weblink, не добавляется.
 */
class XenditPayController extends Controller
{
    // ─── GET /xendit-weblink/{id}/{key} ────────────────────────────────────────

    public function pay(int $id, string $key)
    {
        try {
            $info = OdooService::getOrderInfo($id);
        } catch (\Throwable $e) {
            return view('noren.booking::odoo_pay_error', ['message' => 'Order not found']);
        }

        // Неверный ключ и "не найден" — одно сообщение, чтобы не подсказывать, что именно не так.
        if (empty($info['unique_key']) || !hash_equals($info['unique_key'], $key)) {
            return view('noren.booking::odoo_pay_error', ['message' => 'Order not found']);
        }

        if ($info['state'] === 'cancel') {
            return view('noren.booking::odoo_pay_error', ['message' => 'Order is cancelled']);
        }

        $amount = (float) $info['collect'];

        if ($amount <= 0) {
            return view('noren.booking::odoo_pay_error', ['message' => 'Nothing to pay']);
        }

        $returnUrl = url("xendit-weblink/{$id}/{$key}/callback");

        try {
            $invoice = XenditService::createInvoice(
                XenditService::collectExternalId($id),
                $amount,
                null,
                $returnUrl,
                url("xendit-weblink/{$id}/{$key}"),
                'Payment for order ' . $id
            );
        } catch (\Throwable $e) {
            Log::error('[XenditV2] pay() failed: ' . $e->getMessage(), ['odoo_id' => $id]);
            return view('noren.booking::odoo_pay_error', ['message' => 'Payment gateway is temporarily unavailable, please try again later']);
        }

        return redirect($invoice['url']);
    }

    // ─── GET /xendit-weblink/{id}/{key}/callback ───────────────────────────────
    // Куда Xendit возвращает браузер после оплаты. Сама оплата подтверждается
    // отдельно вебхуком /api/xendit/webhook.

    public function callback(int $id, string $key)
    {
        return view('noren.booking::odoo_pay_success');
    }
}
