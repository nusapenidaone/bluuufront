<?php namespace Noren\Booking\Cashlez;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Noren\Booking\Odoo\OdooService;
use Noren\Booking\Classes\OrderPaymentService;
use Noren\Booking\Classes\PaymentMethod;
use Log;

/**
 * Callback от Cashlez после обработки платежа.
 *
 * Подпись (partner-code/api-secret) подтверждена на реальной оплате
 * 2026-09-29 (карта, CNP/Mastercard, и QRIS — через хостинговую страницу).
 *
 * Диспетчер по префиксу reference_id, как в DokuWebhookController:37-45:
 *   bluuu<digits>_* -> оплата заказа на сайте (Private/SharedOrderController) —
 *                  подтверждаем заказ через OrderPaymentService, как DOKU/Xendit.
 *   odoo_*      -> доплата остатка: ручная ссылка из Odoo (CashlezPayController),
 *                  кабинет, чек-ин, account — пишем сумму в Odoo.
 *   bluuu_test_* -> наши собственные ручные тесты через CashlezTestController,
 *                  не привязаны к реальному заказу — только логируем.
 */
class CashlezWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $rawBody = $request->getContent();

        if (!$this->verifySecret($request, $rawBody)) {
            return Response::make('Forbidden', 403);
        }

        $payload = json_decode($rawBody, true) ?: [];

        $referenceId = (string) ($payload['reference_id'] ?? '');
        $isPaid      = strtoupper((string) ($payload['payment_link_status'] ?? '')) === 'PAID';
        $amount      = (float) ($payload['amount'] ?? 0);

        // Всё одной строкой (не context-массивом) — лог-вьювер контекст не показывает.
        Log::info(sprintf(
            '[Cashlez] Callback. reference_id=%s order_id=%s amount=%s trx_type=%s response_code=%s payment_link_status=%s payment_date=%s raw=%s',
            $referenceId ?: 'NULL',
            $payload['order_id'] ?? 'NULL',
            $payload['amount'] ?? 'NULL',
            $payload['trx_type'] ?? 'NULL',
            $payload['response_code'] ?? 'NULL',
            $payload['payment_link_status'] ?? 'NULL',
            $payload['payment_date'] ?? 'NULL',
            $rawBody
        ));

        // Только PAID: в отличие от DOKU, неоплаченные статусы Cashlez не
        // документированы, а OrderPaymentService со статусом "не оплачен"
        // удаляет заказ — не рискуем, неоплаченный заказ просто остаётся New.
        if ($isPaid && preg_match('/^(bluuu\d+)/', $referenceId, $m)) {
            // Заказ сайта: reference_id = {external_id}_{time} (нонс на случай,
            // если Cashlez не примет повторный reference_id при повторной оплате).
            (new OrderPaymentService)->handle(PaymentMethod::CASHLEZ, $m[1], 1, $rawBody);
        } elseif ($isPaid && preg_match('/^odoo_(\d+)(?:_f(\d+))?/', $referenceId, $m)) {
            // Доплата остатка: odoo_{id}[_f{fee}]_{time} — наценка 2.5% из кабинета/
            // чек-ина приходит в "_f{fee}", как у DOKU; ручная ссылка из Odoo — без неё.
            $odooOrderId = (int) $m[1];
            $feeAmount   = (float) ($m[2] ?? 0);

            try {
                OdooService::registerPayment($odooOrderId, $amount - $feeAmount, 'x_studio_collected_by_cashlez', $referenceId, $feeAmount);
            } catch (\Throwable $e) {
                Log::error("[Cashlez] Callback: registerPayment failed for odoo_id=$odooOrderId: " . $e->getMessage());
            }
        }

        // Документация (стр. 14) требует ровно 200 OK.
        return response('ok', 200);
    }

    /**
     * api-secret = base64(sha512(partner_code . api_key)) — статический общий
     * секрет, не подпись тела (в отличие от DOKU). Ближе к X-Callback-Token
     * у Xendit.
     *
     * ВНИМАНИЕ: пример в документации (стр. 11) показывает результат в HEX,
     * но реальный боевой api-secret приходит в BASE64 (88 символов, "+"/"=="
     * на конце) — подтверждено эмпирически 2026-09-29 и проверено на живом
     * платеже. Документация в этом месте либо устарела, либо описывает
     * другой режим — не доверять примеру буквально.
     */
    protected function verifySecret(Request $request, string $rawBody): bool
    {
        $partnerCode = $request->header('partner-code');
        $apiSecret   = $request->header('api-secret');

        if (!$partnerCode || !$apiSecret) {
            Log::warning('[Cashlez] Callback rejected: missing partner-code/api-secret header. body=' . $rawBody);

            return false;
        }

        $config = CashlezService::config();

        // Пока реквизиты не заполнены — не пропускаем ничего, иначе
        // сравнение свелось бы к sha512('') и приняло бы любой запрос.
        if (empty($config['partner_code']) || empty($config['api_key'])) {
            Log::warning('[Cashlez] Callback rejected: partner_code/api_key не заполнены в services.config.php');

            return false;
        }

        if (!hash_equals((string) $config['partner_code'], (string) $partnerCode)) {
            Log::warning("[Cashlez] Callback rejected: partner-code mismatch, received=[$partnerCode] api-secret=[$apiSecret] body=" . $rawBody);

            return false;
        }

        $expected = base64_encode(hash('sha512', $config['partner_code'] . $config['api_key'], true));

        // Сравниваем case-insensitive: в наблюдаемых callback'ах значение
        // приходит в нижнем регистре, но не гарантировано документацией.
        if (!hash_equals(strtolower($expected), strtolower((string) $apiSecret))) {
            Log::warning("[Cashlez] Callback rejected: api-secret mismatch, received=[$apiSecret] body=" . $rawBody);

            return false;
        }

        return true;
    }
}
