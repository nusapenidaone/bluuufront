<?php namespace Noren\Booking\Classes;

use Http;
use Log;
use Noren\Booking\Models\Order;

class ZelixLabsService
{
    const ENDPOINT = 'https://www.zelixlabs.com/api/bluutours/webhook/';
    const SECRET   = '0c9e6552d32aaeb69a0e25a08b73004fd974def9addddf7c3b2f8b9e1b52b804';

    public static function sendPurchase(Order $order): void
    {
        $order->loadMissing(['tours']);

        $utm = is_array($order->utm) ? $order->utm : [];

        $payload = [
            'order_id'        => $order->external_id,
            'occurred_at'     => $order->updated_at ? $order->updated_at->toIso8601String() : null,
            'amount'          => (int) $order->total_price,
            'currency'        => 'IDR',
            'customer_name'   => $order->name,
            'customer_email'  => $order->email,
            'customer_phone'  => $order->whatsapp,
            'items'           => [
                [
                    'name' => optional($order->tours)->name,
                    'qty'  => (int) ($order->adults + $order->kids),
                ],
            ],
            'utm_source'      => $utm['utm_source']   ?? null,
            'utm_medium'      => $utm['utm_medium']   ?? null,
            'utm_campaign'    => $utm['utm_campaign'] ?? null,
            'utm_content'     => $utm['utm_content']  ?? null,
            'utm_term'        => $utm['utm_term']     ?? null,
            'fbclid'          => $utm['fbclid']       ?? null,
            'gclid'           => $utm['gclid']        ?? null,
            'ttclid'          => $utm['ttclid']       ?? null,
        ];

        $response = Http::withHeaders([
            'Content-Type'     => 'application/json',
            'x-webhook-secret' => self::SECRET,
        ])->timeout(10)->post(self::ENDPOINT, $payload);

        Log::info("ZelixLabsService::sendPurchase — order #{$order->id}", [
            'http_status' => $response->status(),
        ]);
    }
}
