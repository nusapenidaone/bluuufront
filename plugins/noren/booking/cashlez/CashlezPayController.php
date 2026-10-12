<?php namespace Noren\Booking\Cashlez;

use Illuminate\Routing\Controller;
use Noren\Booking\Odoo\OdooService;
use Log;

/**
 * Ручная оплата остатка (x_studio_collect) по ссылке, которую сотрудник сам
 * формирует в Odoo — по образцу DokuPayController/OdooPayController. Сайт
 * этот шлюз пока не использует, ссылка не участвует в обычном флоу заказа.
 *
 * Ссылка: https://bluuu.tours/cashlez-weblink/{id}/{key}
 *   {id}  — id заказа в Odoo (sale.order.id, видно в адресной строке Odoo)
 *   {key} — значение поля x_studio_unique_key этого же заказа
 * Оба значения открыты на форме заказа в Odoo — то же самое, что уже
 * используется для ссылок кабинета/чек-ина/DOKU-weblink на этом заказе.
 */
class CashlezPayController extends Controller
{
    // ─── GET /cashlez-weblink/{id}/{key} ───────────────────────────────────────

    public function pay(int $id, string $key)
    {
        try {
            $info = OdooService::getOrderInfo($id);
        } catch (\Throwable $e) {
            return view('noren.booking::odoo_pay_error', ['message' => 'Order not found']);
        }

        // Одинаковое сообщение и при неверном id, и при неверном key —
        // не даём понять, что именно не совпало.
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

        $customerName = $info['customer_name'] ?: 'Customer';
        // Cashlez требует phone_no обязательным полем — если у контакта в Odoo
        // телефон не заполнен, шлём заглушку, чтобы Generate Link не упал.
        $phone = $info['phone'] ?: '0000000000';

        if (empty($info['phone'])) {
            Log::warning("[Cashlez] pay(): у заказа odoo_id=$id нет телефона контакта, отправлена заглушка");
        }

        $returnUrl = url("cashlez-weblink/{$id}/{$key}/callback");

        // На случай, если Cashlez тоже не примет повторный reference_id (как
        // DOKU с «INVOICE ALREADY USED») — добавляем нонс. Префикс 'odoo_{id}'
        // всё равно первым распознаётся в вебхуке ((int) casting останавливается
        // на первом не-цифровом символе).
        $referenceId = 'odoo_' . $id . '_' . time();

        try {
            $paymentUrl = CashlezService::createPaymentLink($referenceId, $amount, $customerName, $phone, $returnUrl);
        } catch (\Throwable $e) {
            Log::error("[Cashlez] pay() failed for odoo_id=$id: " . $e->getMessage());
            return view('noren.booking::odoo_pay_error', ['message' => 'Payment gateway is temporarily unavailable, please try again later']);
        }

        return redirect($paymentUrl);
    }

    // ─── GET /cashlez-weblink/{id}/{key}/callback ──────────────────────────────
    // Cashlez возвращает сюда браузер клиента после оплаты (redirect_url) —
    // фактическое подтверждение оплаты приходит отдельно через
    // /api/cashlez/webhook; эта страница — просто то, что видит клиент.

    public function callback(int $id, string $key)
    {
        return view('noren.booking::odoo_pay_success');
    }
}
