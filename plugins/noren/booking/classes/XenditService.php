<?php namespace Noren\Booking\Classes;

use Illuminate\Support\Facades\Http;
use Exception;
use Log;
class XenditService
{
    public static function createPaymentLink($orderId, $amount, $email, $returnUrl, $cancelUrl, $description)
    {
         
        $amount=$amount*1.03;
        $fee=$amount*0.03;
        //$secretKey = 'xnd_development_MfMTAhXjKtwnrxuRR4HvQrLu2WQwtVIcD1fvleCwGWtBWH4KG8W9jtXD1GCsx';//test
        //$secretKey = 'xnd_production_KrUwFL4ZQTWsdarBtNxi6neVPHH0Cu5E8EC2ivRPfwxgXyHaaF36QwmTz7HnI';//real bluuu
        $secretKey = 'xnd_production_LkmE9Ubr5KAQsNwQK29UuZz0jwHVGDTZ3Q7rtHxQOIjcxOM8DQd7jL44IL9y9Dmr';//real db
        
        $payload = [
            'external_id' => $orderId,
            'amount' => $amount,
            'payer_email' => $email,
            'description'=>$description,
            'success_redirect_url' => $returnUrl,
            'failure_redirect_url' => $cancelUrl,
            'payment_methods' => ['CREDIT_CARD'],
            'invoice_duration' => 3600,
            'fees'=> [
              [
                  'type'=> 'Processing fee',
                  'value'=> "$fee"
              ]
            ]

        ];

        $response = Http::withBasicAuth($secretKey, '')
            ->post('https://api.xendit.co/v2/invoices', $payload)
            ->onError(function ($response) {
                Log::error('[Xendit] Answer Error: ' . $response->body());
                return $cancelUrl;
            });
        
        if ($response->successful()) {
            return $response->json()['invoice_url'] ?? $cancelUrl;
        }
        return $cancelUrl;

    }
    
    
    public static function createLink($orderId, $amount, $returnUrl, $cancelUrl, $description)
    {
         
        $amount=$amount*1.03;
        $fee=$amount*0.03;
        //$secretKey = 'xnd_development_MfMTAhXjKtwnrxuRR4HvQrLu2WQwtVIcD1fvleCwGWtBWH4KG8W9jtXD1GCsx';//test
        //$secretKey = 'xnd_production_KrUwFL4ZQTWsdarBtNxi6neVPHH0Cu5E8EC2ivRPfwxgXyHaaF36QwmTz7HnI';//real bluuu
        $secretKey = 'xnd_production_LkmE9Ubr5KAQsNwQK29UuZz0jwHVGDTZ3Q7rtHxQOIjcxOM8DQd7jL44IL9y9Dmr';//real db
        
        $payload = [
            'external_id' => $orderId,
            'amount' => $amount,
            //'payer_email' => $email,
            'description'=>$description,
            'success_redirect_url' => $returnUrl,
            'failure_redirect_url' => $cancelUrl,
            'payment_methods' => ['CREDIT_CARD'],
            'invoice_duration' => 3600,
            'fees'=> [
              [
                  'type'=> 'Processing fee',
                  'value'=> "$fee"
              ]
            ]

        ];

        $response = Http::withBasicAuth($secretKey, '')
            ->post('https://api.xendit.co/v2/invoices', $payload)
            ->onError(function ($response) {
                Log::error('[Xendit] Answer Error: ' . $response->body());
                return $cancelUrl;
            });
        
        if ($response->successful()) {
            return $response->json()['invoice_url'] ?? $cancelUrl;
        }
        return $cancelUrl;

    }
}
