<?php

namespace Noren\Booking\Routes;

use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Noren\Booking\Models\Rates;
use Log;

class RatesController extends Controller
{
    public function getRates()
    {
        $key = request()->input('key');

        if ($key !== 'e4f3b1a9c2d8e7f6a1b2c3d4e5f67890') {
            return Response::json(['error' => 'Unauthorized'], 401);
        }

        // процент скидки (берётся из .env или по умолчанию 3%)
        $discountPercent = env('RATE_DISCOUNT', 3);

        // коэффициент (например 3% → 0.97)
        $multiplier = (100 - $discountPercent) / 100;

        $rates = Rates::where('id', '!=', 1)->get(); 
        $list = $rates->pluck('code')->implode(',');

        $response = Http::get(
            'https://api.currencyapi.com/v3/latest',
            [
                'apikey' => 'cur_live_PrXgAUk4dhU3n0HAEiHHKKYYctQTQDvlR5pywSbb',
                'base_currency' => 'IDR',
                'currencies' => $list
            ]
        );

        $data = $response->json()['data'] ?? [];

        foreach ($rates as $rate) {
            if (isset($data[$rate->code]['value'])) {
                $originalRate = $data[$rate->code]['value'];

                // применяем -% и округляем
                $rate->rate = round($originalRate * $multiplier, 2);

                //Log::info("Original: $originalRate | New: " . $rate->rate);

                $rate->save();
            }
        }

        return Response::json([
            'success' => true,
            'discount_percent' => $discountPercent,
            'rates' => $data
        ]);
    }
}