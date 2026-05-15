<?php namespace Noren\Booking\RespondIo;

use Carbon\Carbon;
use Http;
use Log;
use Noren\Booking\Models\Order;

class RespondIoService
{
    protected static function cfg(): array
    {
        static $cfg = null;
        if ($cfg === null) {
            $cfg = require(__DIR__ . '/respondio.config.php');
        }
        return $cfg;
    }

    public static function sendMarketingLead(array $data): void
    {
        $utm = is_array($data['utm'] ?? null) ? $data['utm'] : [];

        $payload = [
            'phone'        => $data['whatsapp']  ?? '',
            'name'         => $data['name']       ?? '',
            'firstName'    => explode(' ', trim($data['name'] ?? ''))[0],
            'email'        => $data['email']      ?? '',
            'group_size'   => (string) ($data['groupSize'] ?? ''),
            'utm_source'   => $utm['utm_source']   ?? '',
            'utm_medium'   => $utm['utm_medium']   ?? '',
            'utm_campaign' => $utm['utm_campaign'] ?? '',
            'utm_content'  => $utm['utm_content']  ?? '',
        ];

        try {
            $response = Http::withHeaders(['Content-Type' => 'application/json'])
                ->timeout(10)
                ->post(static::cfg()['webhook_url_explore'], $payload);

            Log::info('RespondIoService::sendMarketingLead — done', [
                'name'        => $data['name'] ?? '',
                'http_status' => $response->status(),
            ]);
        } catch (\Exception $e) {
            Log::error('RespondIoService::sendMarketingLead — error', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    public static function sendOrder(Order $order): void
    {
        $order->loadMissing(['tours.meeting', 'boat', 'transfer', 'route', 'program', 'restaurant', 'method']);

        try {
            $payload = static::buildPayload($order);

            $response = Http::withHeaders(['Content-Type' => 'application/json'])
                ->timeout(10)
                ->post(static::cfg()['webhook_url'], $payload);

            Log::info('RespondIoService::sendOrder — done', [
                'order_id'    => $order->id,
                'external_id' => $order->external_id,
                'http_status' => $response->status(),
            ]);
        } catch (\Exception $e) {
            Log::error('RespondIoService::sendOrder — error', [
                'order_id'   => $order->id,
                'error'      => $e->getMessage(),
                'trace'      => $e->getTraceAsString(),
                'order_data' => [
                    'travel_date'    => $order->travel_date,
                    'tours_id'       => $order->tours_id,
                    'boat_id'        => $order->boat_id,
                    'route_id'       => $order->route_id,
                    'transfer_id'    => $order->transfer_id,
                    'status_id'      => $order->status_id,
                    'source_id'      => $order->source_id,
                ],
            ]);
        }
    }

    protected static function buildPayload(Order $order): array
    {
        $tour       = $order->tours;
        $boat       = $order->boat;
        $transfer   = $order->transfer;
        $restaurant = $order->restaurant;
        $route      = $order->route;
        $program    = $order->program;
        $method     = $order->method;
        $utm        = is_array($order->utm) ? $order->utm : [];

        $isShared  = $tour && (int) $tour->types_id === 1;
        $isPrivate = $tour && (int) $tour->types_id === 2;

        $transferId  = (int) ($order->transfer_id ?? 0);
        $cars        = (int) ($order->cars ?? 0);
        $pickupCars  = in_array($transferId, [1, 2]) ? $cars : 0;
        $dropoffCars = $transferId === 2 ? $cars : 0;

        $travelDate = '-';
        if ($order->travel_date) {
            $startTime  = optional($route)->start ?? '08:00:00';
            $travelDate = Carbon::parse($order->travel_date)->format('Y-m-d') . ' ' . $startTime;
            $travelDate = Carbon::parse($travelDate)->format('d.m.Y H:i');
        }

        $totalPrice    = (float) ($order->total_price    ?? 0);
        $depositSumm   = (float) ($order->deposite_summ  ?? 0);
        $tourPrice     = (float) ($order->tour_price     ?? 0);
        $boatPrice     = (float) ($order->boat_price     ?? 0);
        $transferPrice = (float) ($order->transfer_price ?? 0);
        $collect       = max(0.0, $totalPrice - $depositSumm);

        $agentFeePercent = (float) ($order->agent_fee ?? 0);
        $agentFeeAmount  = $agentFeePercent > 0
            ? round($totalPrice * $agentFeePercent / 100)
            : 0;

        $methodName   = optional($method)->name ?? '';
        $boatName     = optional($boat)->name   ?? '';
        $meetingPoint = optional(optional($tour)->meeting)->name ?? '';
        $lunchName    = optional($restaurant)->amo_name ?? '';

        $sharedBoatField  = 'N/A';
        $privateBoatField = 'N/A';
        if ($isShared && optional($tour)->amo_boat_name) {
            $sharedBoatField = $tour->amo_boat_name;
        } elseif ($isPrivate && optional($tour)->amo_boat_name) {
            $privateBoatField = $tour->amo_boat_name;
        }

        $sourceName        = optional($tour)->amo_source_name ?? '';
        $sourceSharedTour  = ($isShared  && $sourceName) ? $sourceName : 'N/A';
        $sourcePrivateTour = ($isPrivate && $sourceName) ? $sourceName : 'N/A';

        $transferName  = $transfer ? (optional($transfer)->amo_name ?? '') : '23-Transfer (No Transfer)';
        $itineraryName = optional($route)->name ?? optional($program)->name ?? '';
        $tourName      = optional($tour)->amo_tour_name ?? '';
        $members       = (int) ($order->adults ?? 0) + (int) ($order->kids ?? 0);

        return [
            'phone'           => $order->whatsapp ?? '',
            'name'            => $order->name     ?? '',
            'firstName'       => explode(' ', trim($order->name ?? ''))[0],
            'email'           => $order->email    ?? '',
            'special_request' => $order->requests ?? '',
            'utm_source'      => $utm['utm_source']   ?? '',
            'utm_medium'      => $utm['utm_medium']   ?? '',
            'utm_campaign'    => $utm['utm_campaign'] ?? '',
            'utm_content'     => $utm['utm_content']  ?? '',
            'order' => [
                'ta_reference'               => $order->external_id ?? '',
                'sale'                       => $totalPrice,
                'sale_tech'                  => $totalPrice,
                'collect'                    => $collect,
                'deposit'                    => $depositSumm,
                'boat_tour_base_price'       => $tourPrice + $boatPrice,
                'agent_fee_amount'           => $agentFeeAmount,
                'transfer_price'             => $transferPrice,
                'dp_paid'                    => $methodName,
                'source'                     => $methodName,
                'source_shared_tour'         => $sourceSharedTour,
                'source_shared_premium_tour' => 'N/A',
                'source_private_tour'        => $sourcePrivateTour,
                'tour'                       => $tourName,
                'itinerary'                  => $itineraryName,
                'transfer'                   => $transferName,
                'shared_boat'                => $sharedBoatField,
                'private_boat'               => $privateBoatField,
                'boat_name'                  => $boatName,
                'lunch'                      => $lunchName,
                'travel_date'                => $travelDate,
                'meeting_point'              => $meetingPoint,
                'pick_up_address'            => $order->pickup_address  ?: '-',
                'drop_off_address'           => $order->dropoff_address ?: '-',
                'pick_up_cars_numbers'       => $pickupCars,
                'drop_off_cars_numbers'      => $dropoffCars,
                'land_tour_cars'             => 0,
                'count_of_people'            => $members,
                'quantity_of_shared_tours'   => $isShared ? $members : 1,
                'adults'                     => (int) ($order->adults   ?? 0),
                'kids'                       => (int) ($order->kids     ?? 0),
                'toddlers'                   => (int) ($order->children ?? 0),
                'comments'                   => 'Rp' . number_format($totalPrice, 2, '.', ','),
            ],
        ];
    }
}
