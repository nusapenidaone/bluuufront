<?php namespace Noren\Booking\Maps;

use Http;
use Log;

class GoogleMapsService
{
    // Пункт назначения — офис/причал, откуда отправляются лодки
    protected const DEST_LAT = -8.721838291230016;
    protected const DEST_LNG = 115.2383718942317;

    protected static function cfg(): array
    {
        static $cfg = null;
        if ($cfg === null) {
            $cfg = require(__DIR__ . '/services.config.php');
            if (!is_array($cfg) || !isset($cfg['api_key'])) {
                throw new \RuntimeException('Invalid or missing Google Maps config in services.config.php');
            }
        }
        return $cfg;
    }

    protected static function apiKey(): string { return static::cfg()['api_key']; }
    public static function accessKey(): string { return static::cfg()['access_key'] ?? ''; }

    // Geocoding API: адрес → координаты
    // Все пикапы находятся на Бали — без этого ограничения Google иногда
    // отдаёт первым результатом одноимённую улицу в другом городе Индонезии
    // (например Jl. Palapa IV нашлась и в Джакарте), что ломает расчёт ETA.
    public static function geocodeAddress(string $address): array
    {
        $response = Http::timeout(15)->get('https://maps.googleapis.com/maps/api/geocode/json', [
            'address'    => $address,
            'components' => 'administrative_area:Bali|country:ID',
            'key'        => static::apiKey(),
        ]);

        if (!$response->successful()) {
            Log::warning('GoogleMapsService: geocode HTTP error', ['address' => $address, 'status' => $response->status()]);
            throw new \RuntimeException('Geocoding request failed');
        }

        $json = $response->json();
        if (($json['status'] ?? '') !== 'OK' || empty($json['results'][0])) {
            Log::warning('GoogleMapsService: geocode failed', ['address' => $address, 'status' => $json['status'] ?? null]);
            throw new \RuntimeException('Could not geocode address: ' . ($json['status'] ?? 'UNKNOWN_ERROR'));
        }

        $result = $json['results'][0];
        return [
            'lat'               => $result['geometry']['location']['lat'],
            'lng'               => $result['geometry']['location']['lng'],
            'formatted_address' => $result['formatted_address'] ?? $address,
        ];
    }

    // Distance Matrix API: координаты → время и расстояние до точки назначения
    // $departureTimestamp — unix timestamp (UTC) желаемого времени выезда для прогноза трафика;
    // Google принимает только текущее время или будущее, иначе используем 'now'
    public static function estimateDrivingTime(float $lat, float $lng, ?int $departureTimestamp = null): array
    {
        $departure = ($departureTimestamp !== null && $departureTimestamp > time())
            ? $departureTimestamp
            : 'now';

        $response = Http::timeout(15)->get('https://maps.googleapis.com/maps/api/distancematrix/json', [
            'origins'         => "{$lat},{$lng}",
            'destinations'    => self::DEST_LAT . ',' . self::DEST_LNG,
            'mode'            => 'driving',
            'departure_time'  => $departure,
            'key'             => static::apiKey(),
        ]);

        if (!$response->successful()) {
            Log::warning('GoogleMapsService: distance matrix HTTP error', ['lat' => $lat, 'lng' => $lng, 'status' => $response->status()]);
            throw new \RuntimeException('Distance Matrix request failed');
        }

        $json    = $response->json();
        $element = $json['rows'][0]['elements'][0] ?? null;
        if (($json['status'] ?? '') !== 'OK' || !$element || ($element['status'] ?? '') !== 'OK') {
            Log::warning('GoogleMapsService: distance matrix failed', ['lat' => $lat, 'lng' => $lng, 'status' => $json['status'] ?? null, 'element_status' => $element['status'] ?? null]);
            throw new \RuntimeException('Could not compute driving time');
        }

        return [
            'duration_seconds'            => $element['duration']['value'],
            'duration_text'               => $element['duration']['text'],
            'duration_in_traffic_seconds' => $element['duration_in_traffic']['value'] ?? null,
            'distance_meters'             => $element['distance']['value'],
            'distance_text'               => $element['distance']['text'],
        ];
    }

    // Комбинированный метод для контроллера: адрес → geocode → distance matrix
    public static function estimateFromAddress(string $address, ?int $departureTimestamp = null): array
    {
        $geo = static::geocodeAddress($address);
        $eta = static::estimateDrivingTime($geo['lat'], $geo['lng'], $departureTimestamp);

        return array_merge($eta, [
            'resolved_address' => $geo['formatted_address'],
            'lat'              => $geo['lat'],
            'lng'              => $geo['lng'],
        ]);
    }
}
