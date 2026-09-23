<?php namespace Noren\Booking\Cashlez;

use Illuminate\Support\Facades\Http;
use Log;

/**
 * Cashlez Link (cashUP) — клиент платёжного шлюза.
 *
 * Этап 1: модуль изолирован от боевого флоу оплаты. Никто, кроме
 * временного CashlezTestController, его пока не вызывает — сначала
 * прогоняем ручной тест, потом решаем, подключать ли к заказам.
 *
 * Документация: TSD - Cashlez Link v1.1 (04.11.2025).
 */
class CashlezService
{
    const LOGIN_PATH    = '/MmCorePsgsHost/v1/login';
    const GENERATE_PATH = '/MmCoreCzLinkHost/api/v1/generate';
    const STATUS_PATH   = '/MmCoreCzLinkHost/internal/payment/status/';

    /**
     * Авторизация, возвращает JWT.
     *
     * pass_hash = sha256( device_timestamp . md5(password) ), где
     * device_timestamp — epoch в МИЛЛИсекундах и он же уходит в теле запроса.
     * Формула сверена с примером из документации (стр. 6).
     *
     * TODO: кешировать токен, когда Cashlez подтвердит его TTL.
     */
    public static function login(): string
    {
        $config = self::config();

        // Именно миллисекунды: в примере документации 13-значный timestamp.
        // Приведение через (int) обязательно: round() возвращает float, и при
        // ini precision < 13 строковое приведение дало бы "1.79015E+12".
        $timestamp = (string) (int) round(microtime(true) * 1000);

        $body = [
            'device_timestamp' => $timestamp,
            'pass_hash'        => hash('sha256', $timestamp . md5($config['password'])),
            'username'         => $config['username'],
        ];

        $response = self::send(function () use ($config, $body) {
            // ->post($url, $array) шлёт JSON по умолчанию — как в XenditService.
            return Http::connectTimeout(15)
                ->timeout(25)
                ->post($config['base_url'] . self::LOGIN_PATH, $body);
        });

        if (!$response->successful()) {
            Log::error('[Cashlez] Login failed: ' . $response->status() . ' ' . $response->body());
            throw new \RuntimeException('Cashlez login failed: ' . $response->status() . ' ' . $response->body());
        }

        $token = $response->json('token');

        if (!$token) {
            Log::error('[Cashlez] Login: no token in response: ' . $response->body());
            throw new \RuntimeException('Cashlez login returned no token: ' . $response->body());
        }

        Log::info('[Cashlez] Login OK', [
            'response_code' => $response->json('response_code'),
            'merchant_name' => $response->json('merchant_name'),
        ]);

        return $token;
    }

    /**
     * Создать платёжную ссылку. Возвращает блок `data` целиком —
     * нужен и generated_link, и order_id (по нему потом проверяется статус).
     */
    public static function generate($referenceId, $amount, $customerName, $phone, $returnUrl, $callbackUrl = null): array
    {
        $config = self::config();
        $token  = self::login();

        $body = [
            'device_id' => $config['device_id'],
            // В отличие от login, в примере generate timestamp 10-значный (секунды).
            'device_timestamp' => (string) time(),
            'base_amount'      => (int) round($amount),
            'currency'         => 'IDR',
            'customer_name'    => $customerName,
            'phone_no'         => $phone,
            'reference_id'     => (string) $referenceId,
            'callback_url'     => $callbackUrl ?: url('api/cashlez/webhook'),
            // Cashlez сам допишет ?status=&referenceId=&orderId=
            'redirect_url' => $returnUrl,
        ];

        $response = self::sendAuthorized($config['base_url'] . self::GENERATE_PATH, $token, $body);

        if (!$response->successful()) {
            Log::error('[Cashlez] Generate failed: ' . $response->status() . ' ' . $response->body());
            throw new \RuntimeException('Cashlez generate failed: ' . $response->status() . ' ' . $response->body());
        }

        $data = $response->json('data');

        if (!is_array($data) || empty($data['generated_link'])) {
            Log::error('[Cashlez] Generate: no generated_link in response: ' . $response->body());
            throw new \RuntimeException('Cashlez generate returned no link: ' . $response->body());
        }

        return $data;
    }

    /**
     * Обёртка в форме остальных шлюзов — только ссылка.
     * Сигнатура отличается от DokuService::createPaymentLink (там $email):
     * Cashlez требует customer_name + phone_no. Приведём к общему виду
     * на этапе 2, если решим подключать к заказам.
     */
    public static function createPaymentLink($referenceId, $amount, $customerName, $phone, $returnUrl, $callbackUrl = null)
    {
        $data = self::generate($referenceId, $amount, $customerName, $phone, $returnUrl, $callbackUrl);

        return $data['generated_link'];
    }

    /**
     * Проверка статуса платежа. $orderId — UUID из ответа generate
     * (не наш reference_id).
     */
    public static function checkStatus(string $orderId): array
    {
        $config = self::config();
        $token  = self::login();

        $url = $config['base_url'] . self::STATUS_PATH . rawurlencode($orderId);

        // Документация не указывает заголовок для этого эндпоинта, но путь
        // помечен как /internal/ — шлём токен на всякий случай, лишним не будет.
        $response = self::sendAuthorized($url, $token, null);

        if (!$response->successful()) {
            Log::error('[Cashlez] Status failed: ' . $response->status() . ' ' . $response->body());
            throw new \RuntimeException('Cashlez status failed: ' . $response->status() . ' ' . $response->body());
        }

        return $response->json() ?: [];
    }

    /**
     * Запрос с JWT. Документация (стр. 7) говорит лишь "JWT Token from Login
     * response" и не уточняет, нужен ли префикс Bearer. Пробуем голый токен,
     * при 401/403 повторяем с "Bearer " и логируем, какой вариант сработал.
     *
     * @param array|null $body null — GET, иначе POST с JSON-телом
     */
    protected static function sendAuthorized(string $url, string $token, ?array $body)
    {
        $attempt = function ($authValue) use ($url, $body) {
            return self::send(function () use ($url, $body, $authValue) {
                $request = Http::withHeaders(['Authorization' => $authValue])
                    ->connectTimeout(15)
                    ->timeout(25);

                return $body === null ? $request->get($url) : $request->post($url, $body);
            });
        };

        $response = $attempt($token);

        if (in_array($response->status(), [401, 403])) {
            Log::warning('[Cashlez] Auth rejected with raw token (' . $response->status() . '), retrying with "Bearer " prefix');

            $retry = $attempt('Bearer ' . $token);

            if ($retry->successful()) {
                Log::warning('[Cashlez] "Bearer " prefix works — закрепить в коде и убрать фолбэк');
            }

            return $retry;
        }

        return $response;
    }

    /**
     * Сетевые сбои (DNS/TCP/TLS не дошли до сервера) — транзиентные, не ошибки
     * запроса: один ретрай, как в DokuService. Повтор безопасен — первая попытка
     * до Cashlez не долетела.
     */
    protected static function send(callable $request)
    {
        try {
            return $request();
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::warning('[Cashlez] Connection failed, retrying once: ' . $e->getMessage());

            try {
                return $request();
            } catch (\Illuminate\Http\Client\ConnectionException $e2) {
                Log::error('[Cashlez] Connection failed after retry: ' . $e2->getMessage());
                throw new \RuntimeException('Cashlez is temporarily unavailable: ' . $e2->getMessage());
            }
        }
    }

    public static function config()
    {
        return require __DIR__ . '/services.config.php';
    }
}
