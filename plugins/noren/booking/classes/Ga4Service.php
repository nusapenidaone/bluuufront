<?php namespace Noren\Booking\Classes;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class Ga4Service
{
    protected static string $measurementId = 'G-EG07NDYHQ0';
    protected static string $apiSecret = '9J5lg3-eRkqSaeSB_95dAA';

	public static function sendPurchase($order): bool
{
    if (empty($order->ga_client_id)) {
        Log::warning('GA4: missing client_id');
        return false;
    }

    $payload = [
        'client_id' => (string) $order->ga_client_id,
        

        'events' => [
            [
                'name' => 'test_purchase',
                'params' => [
                    // REQUIRED
                    'transaction_id' => (string) $order->external_id,
                    'value'          => (float)  $order->total_price,
                    'currency'       => 'IDR',

                    // CUSTOM PARAMS (нужно зарегистрировать в GA4)
                    'email'         => $order->email ?? null,
                    'customer_type' => 'new',
                    'customer_age'  => 30,
                    'passengers'    => ($order->adults ?? 0)
                                     + ($order->kids ?? 0)
                                     + ($order->children ?? 0),
                    'date_of_tour'  => $order->travel_date ?? null,
                    'phone_number'  => $order->whatsapp ?? null,

                    // ITEMS (ВСЕГДА массив)
                    'items' => [
                        [
                            'item_id'       => (string) $order->tours->id,
                            'item_name'     => (string) $order->tours->name,
                            'item_brand'    => 'bluuu',
                            'item_category' => $order->tours->types->name ?? null,
                            'currency'      => 'IDR',
                            'price'         => (float) $order->total_price,
                            'quantity'      => 1,
                            'index'         => 0,
                        ]
                    ]
                ]
            ]
        ]
    ];

    $url = 'https://www.google-analytics.com/mp/collect'
        . '?measurement_id=' . self::$measurementId
        . '&api_secret=' . self::$apiSecret;

    try {
        $response = Http::timeout(5)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post($url, $payload);

        //Log::info('GA4 response', [
        //    'status' => $response->status()
        //]);

        return $response->status() === 204;

    } catch (\Throwable $e) {
        Log::error('GA4 exception', [
            'message' => $e->getMessage()
        ]);
        return false;
    }
}


}
