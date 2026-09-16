<?php

namespace Noren\Booking\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Log;
use Noren\Booking\Maps\GoogleMapsService;

class TransferDistanceController extends Controller
{
    // GET /api/new/transfer/distance?lat=..&lng=.. — вызывается прямо из виджета
    // на сайте после того как клиент выбрал адрес pickup (подсказка Google / точка
    // на карте), чтобы показать клиенту тариф ещё до отправки заказа.
    public function check(Request $request)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: *');

        $lat = $request->query('lat');
        $lng = $request->query('lng');

        if (!is_numeric($lat) || !is_numeric($lng)) {
            return response()->json(['success' => false, 'error' => 'lat/lng are required'], 422);
        }

        try {
            $eta  = GoogleMapsService::estimateDrivingTime((float) $lat, (float) $lng);
            $tier = GoogleMapsService::classifyDistance($eta['distance_km']);

            return response()->json([
                'success'     => true,
                'distance_km' => $eta['distance_km'],
                'tier'        => $tier,
            ]);
        } catch (\Exception $e) {
            Log::error('TransferDistanceController: check failed', ['lat' => $lat, 'lng' => $lng, 'error' => $e->getMessage()]);
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
