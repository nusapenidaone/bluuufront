<?php namespace Noren\Booking\Cashlez;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Log;

/**
 * Callback от Cashlez после обработки платежа.
 *
 * ЭТАП 1 — DRY-RUN: подпись проверяется, payload целиком пишется в лог,
 * но в БД и в Odoo НИЧЕГО не пишется. Нужно сперва увидеть реальную форму
 * данных на живой оплате.
 *
 * ЭТАП 2 (когда/если решим подключать Cashlez к заказам) — здесь появится
 * диспетчер по префиксу reference_id, как в DokuWebhookController:37-45:
 *   bluuu*  -> (new OrderPaymentService)->handle(4, $referenceId, $isPaid ? 1 : 2, $rawBody)
 *   odoo_*  -> OdooService::registerPayment($id, $amount - $fee, 'x_studio_collected_by_cashlez', ...)
 */
class CashlezWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $rawBody = $request->getContent();

        if (!$this->verifySecret($request)) {
            Log::warning('[Cashlez] Invalid callback secret', [
                'partner_code' => $request->header('partner-code'),
                'body'         => $rawBody,
            ]);

            return Response::make('Forbidden', 403);
        }

        $payload = json_decode($rawBody, true) ?: [];

        // Пишем и разобранные поля (для быстрого чтения), и сырое тело
        // (чтобы увидеть всё, что Cashlez реально присылает).
        Log::info('[Cashlez] Callback', [
            'reference_id'        => $payload['reference_id'] ?? null,
            'order_id'            => $payload['order_id'] ?? null,
            'amount'              => $payload['amount'] ?? null,
            'trx_type'            => $payload['trx_type'] ?? null,
            'response_code'       => $payload['response_code'] ?? null,
            'payment_link_status' => $payload['payment_link_status'] ?? null,
            'payment_date'        => $payload['payment_date'] ?? null,
            'raw'                 => $rawBody,
        ]);

        // Документация (стр. 14) требует ровно 200 OK.
        return response('ok', 200);
    }

    /**
     * api-secret = sha512(partner_code . api_key) — статический общий секрет,
     * не подпись тела (в отличие от DOKU). Ближе к X-Callback-Token у Xendit.
     * Формула сверена с примером из документации (стр. 11).
     */
    protected function verifySecret(Request $request): bool
    {
        $partnerCode = $request->header('partner-code');
        $apiSecret   = $request->header('api-secret');

        if (!$partnerCode || !$apiSecret) {
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
            return false;
        }

        $expected = hash('sha512', $config['partner_code'] . $config['api_key']);

        return hash_equals($expected, strtolower((string) $apiSecret));
    }
}
