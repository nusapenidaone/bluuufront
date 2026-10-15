<?php namespace Noren\Booking\Xendit;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\ConnectionException;
use Log;

/**
 * Xendit Invoices API (v2) — замена classes/XenditService.php.
 *
 * Отличия от старого сервиса:
 *  - ключи в services.config.php, переключение test/production через 'mode';
 *  - один метод создания инвойса вместо двух копий;
 *  - ошибка шлюза бросает исключение, а не молча отдаёт cancelUrl
 *    (клиента больше не кидает на "оплата не прошла", когда инвойс даже не создан);
 *  - getInvoice() — вебхук перепроверяет статус/сумму у самого Xendit.
 */
class XenditService
{
    /**
     * Создаёт инвойс и возвращает ['id' => invoice id, 'url' => invoice_url].
     *
     * @throws \RuntimeException если Xendit недоступен или вернул ошибку
     */
    public static function createInvoice(string $externalId, float $amount, ?string $email, string $successUrl, string $failureUrl, string $description): array
    {
        $config = self::config();

        $payload = [
            'external_id'          => $externalId,
            'amount'               => (int) round($amount), // IDR — без копеек
            'currency'             => $config['currency'],
            'description'          => $description,
            'success_redirect_url' => $successUrl,
            'failure_redirect_url' => $failureUrl,
            'payment_methods'      => $config['payment_methods'],
            'invoice_duration'     => $config['invoice_duration'],
        ];

        if ($email) {
            $payload['payer_email'] = $email;
        }

        $response = self::request('post', '/v2/invoices', $payload);

        if (!$response->successful() || !$response->json('invoice_url')) {
            Log::error('[XenditV2] createInvoice failed: ' . $response->status() . ' ' . $response->body(), ['external_id' => $externalId]);
            throw new \RuntimeException('Payment gateway error, please try again');
        }

        return [
            'id'  => (string) $response->json('id'),
            'url' => (string) $response->json('invoice_url'),
        ];
    }

    /**
     * Та же сигнатура, что у старого XenditService::createPaymentLink — для
     * подмены в контроллерах. Возвращает URL, при ошибке бросает исключение.
     */
    public static function createPaymentLink($orderId, $amount, $email, $returnUrl, $cancelUrl, $description): string
    {
        return self::createInvoice((string) $orderId, (float) $amount, $email ?: null, $returnUrl, $cancelUrl, (string) $description)['url'];
    }

    /**
     * Инвойс по его Xendit id, null — если не найден.
     *
     * @throws \RuntimeException если Xendit недоступен (вебхук должен ответить 5xx, чтобы Xendit повторил)
     */
    public static function getInvoice(string $invoiceId): ?array
    {
        $response = self::request('get', '/v2/invoices/' . rawurlencode($invoiceId));

        if ($response->status() === 404) {
            return null;
        }
        if (!$response->successful()) {
            Log::error('[XenditV2] getInvoice failed: ' . $response->status() . ' ' . $response->body(), ['invoice_id' => $invoiceId]);
            throw new \RuntimeException('Xendit getInvoice failed');
        }

        return $response->json();
    }

    /** Все инвойсы с данным external_id (у Xendit он не уникален). */
    public static function findByExternalId(string $externalId): array
    {
        $response = self::request('get', '/v2/invoices', null, ['external_id' => $externalId]);

        if (!$response->successful()) {
            Log::error('[XenditV2] findByExternalId failed: ' . $response->status() . ' ' . $response->body(), ['external_id' => $externalId]);
            throw new \RuntimeException('Xendit findByExternalId failed');
        }

        return $response->json() ?: [];
    }

    /** Принудительно гасит неоплаченный инвойс (например, при пересоздании ссылки). */
    public static function expireInvoice(string $invoiceId): bool
    {
        $response = self::request('post', '/invoices/' . rawurlencode($invoiceId) . '/expire!');

        if (!$response->successful()) {
            Log::warning('[XenditV2] expireInvoice failed: ' . $response->status() . ' ' . $response->body(), ['invoice_id' => $invoiceId]);
        }

        return $response->successful();
    }

    /**
     * external_id для доплаты остатка Odoo-ордера: odoo_{id}_f{fee}_{nonce}.
     * Nonce делает каждую попытку уникальной — по нему вебхук отличает
     * повтор того же платежа от второй реальной оплаты. Регулярка вебхуков
     * (^odoo_(\d+)(?:_f(\d+))?) на суффикс не реагирует.
     */
    public static function collectExternalId(int $odooOrderId, int $feeAmount = 0): string
    {
        return 'odoo_' . $odooOrderId . ($feeAmount > 0 ? '_f' . $feeAmount : '') . '_' . time();
    }

    public static function config(): array
    {
        $config = require __DIR__ . '/services.config.php';
        $mode   = $config['mode'] ?? 'test';

        return array_merge($config, $config[$mode]);
    }

    protected static function request(string $method, string $path, ?array $body = null, array $query = [])
    {
        $config = self::config();
        $url    = $config['base_url'] . $path . ($query ? '?' . http_build_query($query) : '');

        $send = function () use ($config, $method, $url, $body) {
            $http = Http::withBasicAuth($config['secret_key'], '')
                ->acceptJson()
                ->connectTimeout(10)
                ->timeout(20);

            return $method === 'get' ? $http->get($url) : $http->post($url, $body ?? []);
        };

        // Соединение не установилось — запрос до Xendit не дошёл, повтор безопасен.
        try {
            return $send();
        } catch (ConnectionException $e) {
            Log::warning('[XenditV2] Connection failed, retrying once: ' . $e->getMessage());
            try {
                return $send();
            } catch (ConnectionException $e2) {
                Log::error('[XenditV2] Connection failed after retry: ' . $e2->getMessage());
                throw new \RuntimeException('Payment gateway is temporarily unavailable, please try again');
            }
        }
    }
}
