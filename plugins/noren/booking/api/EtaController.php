<?php

namespace Noren\Booking\Api;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Log;
use Noren\Booking\Maps\GoogleMapsService;

class EtaController extends Controller
{
    // Вызывается из Odoo automation (server-to-server), доступ по ключу в query-параметрах.
    private function checkAccess(Request $request): bool
    {
        $expected = GoogleMapsService::accessKey();
        if (!$expected) {
            return false;
        }

        return hash_equals($expected, (string) $request->query('key', ''));
    }

    public function estimate(Request $request)
    {
        if (!$this->checkAccess($request)) {
            return response()->json(['success' => false, 'error' => 'Unauthorized'], 401);
        }

        $address = trim((string) $request->query('address', ''));
        if ($address === '') {
            return response()->json(['success' => false, 'error' => 'address is required'], 422);
        }

        try {
            // Если Odoo передал время тура — используем его как ориентир для прогноза трафика
            // (иначе Google считает трафик на текущий момент запроса, а не на время поездки).
            $tourTime  = trim((string) $request->query('tour_time', ''));
            $tourTimeUtc = $tourTime !== '' ? Carbon::parse($tourTime, 'UTC') : null;

            $result = GoogleMapsService::estimateFromAddress(
                $address,
                $tourTimeUtc?->getTimestamp()
            );

            // Готовое время встречи клиента (tour_time минус время в пути) для записи в поле.
            if ($tourTimeUtc !== null) {
                $result['pickup_time'] = $tourTimeUtc
                    ->subSeconds($result['duration_seconds'])
                    ->subMinutes(40)
                    ->setTimezone('Asia/Makassar')
                    ->format('H:i');
            }

            return response()->json(['success' => true] + $result);
        } catch (\Exception $e) {
            Log::error('EtaController: estimate failed', ['address' => $address, 'error' => $e->getMessage()]);
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
