<?php namespace Noren\Booking\Doku;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Log;

class DokuService
{
    const CHECKOUT_PATH = '/checkout/v1/payment';

    public static function createPaymentLink($orderId, $amount, $email, $returnUrl, $cancelUrl, $description)
    {
        return self::requestCheckout($orderId, $amount, $returnUrl, $cancelUrl, $description, $email);
    }

    public static function createLink($orderId, $amount, $returnUrl, $cancelUrl, $description)
    {
        return self::requestCheckout($orderId, $amount, $returnUrl, $cancelUrl, $description, null);
    }

    protected static function requestCheckout($orderId, $amount, $returnUrl, $cancelUrl, $description, $email)
    {
        $config = self::config();

        $body = [
            'order' => [
                'amount' => (int) round($amount),
                'invoice_number' => (string) $orderId,
                'currency' => 'IDR',
                'callback_url' => $returnUrl,
                'callback_url_cancel' => $cancelUrl,
                'callback_url_result' => $returnUrl,
            ],
            'payment' => [
                'payment_due_date' => 60,
                'payment_method_types' => ['CREDIT_CARD', 'QRIS'],
            ],
        ];

        if ($description) {
            $body['order']['line_items'] = [[
                'id' => (string) $orderId,
                'name' => self::sanitizeText((string) $description),
                'quantity' => 1,
                'price' => (int) round($amount),
            ]];
        }

        if ($email) {
            $body['customer'] = ['email' => $email];
        }

        $rawBody = json_encode($body, JSON_UNESCAPED_SLASHES);

        $requestId = (string) Str::uuid();
        $timestamp = gmdate('Y-m-d\TH:i:s\Z');
        $digest = base64_encode(hash('sha256', $rawBody, true));
        $signature = self::buildSignature($config['client_id'], $config['secret_key'], $requestId, $timestamp, self::CHECKOUT_PATH, $digest);

        $response = Http::withHeaders([
                'Client-Id' => $config['client_id'],
                'Request-Id' => $requestId,
                'Request-Timestamp' => $timestamp,
                'Signature' => $signature,
                'Content-Type' => 'application/json',
            ])
            ->timeout(20)
            ->send('POST', $config['base_url'] . self::CHECKOUT_PATH, ['body' => $rawBody])
            ->onError(function ($response) {
                Log::error('[Doku] Answer Error: ' . $response->body());
            });

        if ($response->successful()) {
            return $response->json('response.payment.url') ?? $cancelUrl;
        }

        Log::error('[Doku] Checkout failed: ' . $response->status() . ' ' . $response->body());

        return $cancelUrl;
    }

    // DOKU rejects any character outside a-z A-Z 0-9 . - / + , = _ : ' @ % ( ) —
    // real tour names/descriptions are free text, so strip anything else.
    protected static function sanitizeText(string $text): string
    {
        return preg_replace('/[^a-zA-Z0-9.\-\/+,=_:\'@%() ]/', '', $text);
    }

    protected static function buildSignature($clientId, $secretKey, $requestId, $timestamp, $path, $digest)
    {
        $stringToSign = "Client-Id:{$clientId}\n"
            . "Request-Id:{$requestId}\n"
            . "Request-Timestamp:{$timestamp}\n"
            . "Request-Target:{$path}\n"
            . "Digest:{$digest}";

        $hmac = base64_encode(hash_hmac('sha256', $stringToSign, $secretKey, true));

        return 'HMACSHA256=' . $hmac;
    }

    public static function config()
    {
        $config = require __DIR__ . '/services.config.php';
        $mode = $config['mode'] ?? 'sandbox';

        return $config[$mode];
    }
}
