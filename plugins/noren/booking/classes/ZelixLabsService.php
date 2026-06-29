<?php namespace Noren\Booking\Classes;

use Http;
use Log;
use Noren\Booking\Models\Order;

class ZelixLabsService
{
    const ENDPOINT = 'https://bluuutours.zelixlabs.com/api/webhooks/bluu-purchase';
    const SECRET   = 'eb63fa2c0dc04c3dc88aaf2b5df685b600fac56a99f67a748f792a809b9c7d27';

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

        Http::withHeaders([
            'Content-Type'     => 'application/json',
            'x-webhook-secret' => self::SECRET,
        ])->timeout(10)->post(self::ENDPOINT, $payload);
    }
}
