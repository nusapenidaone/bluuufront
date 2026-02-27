<?php namespace Noren\Booking\Classes;


use Http;
use Exception;
use Log;

class PayPalService
{
    protected static $clientId;
    protected static $secret;
    protected static $baseUrl;

    public static function init()
    {

        //self::$clientId = 'ARy_e166_oq__vuwE8Q4mLepOtXXfuF7M_Lz58S6ABHLZBcQIiyQ4_odZ18X4eL83jqhVZI3_vqNbNwu'; //test
        self::$clientId = 'AVtHAq5p8QI7W0G6xHYxJcTFrM4DKvaA-8lYBG8nVidt8Edia59Fem9WbezO9y7wsfebyrQUqSnee_6a'; //real
        //self::$secret = 'ECqjLHMHdP6dQJi7bCBe1WYxn8DIcd6hdb9ytqTxtcN0BE4LLqwlJ1e4oNahePvLVV17JWDhdKf7w36p'; //test
        self::$secret = 'ENtuzwb2-wKonxgVfzqRXseg_Kq8qJXrY40ABMdvRzwU5kYO2k3pCRhUsDBieJ26dCfgonqBGA6pKJXL'; //real
        //self::$baseUrl = 'https://api-m.sandbox.paypal.com'; //test
        self::$baseUrl = 'https://api-m.paypal.com'; //real
    }

    protected static function getAccessToken()
    {
        self::init();

        $response = Http::asForm()
            ->withBasicAuth(self::$clientId, self::$secret)
            ->post(self::$baseUrl . '/v1/oauth2/token', [
                'grant_type' => 'client_credentials',
            ]);

        if (!$response->successful()) {
            Log::error('[PayPal] Token error: ' . $response->body());
            throw new Exception('Unable to get PayPal token.');
        }

        return $response->json()['access_token'];
    }

public static function createPaymentLink($orderId, $amount, $email, $returnUrl, $cancelUrl, $description)
{
    try {
        $token = self::getAccessToken();
        
        $amount=$amount*1.05;
        $fee=$amount*0.05;
        
        $payload = [
            'intent' => 'CAPTURE',
            'purchase_units' => [[
                'reference_id' => $orderId,
                'purchase_units'=>$description,
                'amount' => [
                    'currency_code' => 'USD',
                    'value' => number_format($amount, 2, '.', ''),
                ],
                //'payee' => [
                //    'email_address' => $email,
                //]
            ]],
            'application_context' => [
                'brand_name' => 'Bluuu.tours',
                'landing_page' => 'BILLING',
                'return_url' => $returnUrl,
                'cancel_url' => $cancelUrl,
                'shipping_preference' => 'NO_SHIPPING',
                'user_action' => 'PAY_NOW',
                'payment_method' => [
                    'payee_preferred' => 'IMMEDIATE_PAYMENT_REQUIRED'
                ]
            ]
        ];

        $response = Http::withToken($token)
            ->post(self::$baseUrl . '/v2/checkout/orders', $payload);

        if (!$response->successful()) {
            Log::error('[PayPal] Answer Error: ' . $response->body());
            return $cancelUrl;  // возвращаем ссылку на страницу ошибки
        }

        $links = $response->json()['links'] ?? [];

        foreach ($links as $link) {
            if ($link['rel'] === 'approve') {
                return $link['href'];  // успешная ссылка на оплату
            }
        }

        // Если ссылка approve не найдена — логируем и возвращаем ошибку
        Log::error('[PayPal] Link Error: ' . json_encode($response->json()));
        return $cancelUrl;

    } catch (Exception $e) {
        Log::error('[PayPal] Исключение: ' . $e->getMessage());
        return $cancelUrl;  // при исключении тоже возвращаем ссылку на ошибку
    }
}


public static function capturePayment($orderId)
{
    $accessToken = self::getAccessToken(); // Получение access token

    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $accessToken,
        'PayPal-Request-Id' => uniqid(),
    ])->withBody('{}', 'application/json')->post(
        self::$baseUrl.'/v2/checkout/orders/' . $orderId . '/capture'
    );

    if ($response->failed()) {
        Log::error('[PayPal] Capture error: ' . $response->body());
    }

    return $response->json();
}


public static function getOrderStatus($orderId)
{
    $accessToken = self::getAccessToken(); // Получение access token

    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $accessToken,
    ])->get(self::$baseUrl . '/v2/checkout/orders/' . $orderId);

    if ($response->failed()) {
        return $response->json();
       
    }

    return $response->json(); // вернет всю информацию о заказе, включая статус
}



}

