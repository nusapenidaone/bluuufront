<?php namespace Noren\Booking\Odoo;

use Carbon\Carbon;
use Illuminate\Routing\Controller;
use Mail;
use Log;

class BriefingController extends Controller
{
    // Restaurant name (x_studio_lunch_resto) → email
    // Add new restaurants here as needed
    protected static array $restaurants = [
        'Amarta'    => 'amarta@example.com',
        'Khamara'   => 'khamara@example.com',
        'La Bianca' => 'labianca@example.com',
    ];

    public function send()
    {
        $cfg = require(__DIR__ . '/services.config.php');
        if (request()->bearerToken() !== $cfg['admin_token']) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $baliTz = 'Asia/Makassar';

        $dateParam = request('date');
        $day = $dateParam
            ? Carbon::createFromFormat('Y-m-d', $dateParam, $baliTz)
            : Carbon::now($baliTz);

        $startUtc = $day->copy()->startOfDay()->utc()->format('Y-m-d H:i:s');
        $endUtc   = $day->copy()->endOfDay()->utc()->format('Y-m-d H:i:s');

        $orders = OdooService::getTodayOrders($startUtc, $endUtc);

        if (empty($orders)) {
            return response()->json([
                'date'    => $day->toDateString(),
                'message' => 'No tours today',
                'sent'    => [],
            ]);
        }

        // Group by x_studio_lunch_resto
        $groups   = [];
        $unmapped = [];
        foreach ($orders as $order) {
            $restoName = trim($order['x_studio_lunch_resto'] ?? '');
            if (!$restoName || !isset(static::$restaurants[$restoName])) {
                $unmapped[] = ($order['name'] ?? $order['id']) . ' (resto: ' . ($restoName ?: 'empty') . ')';
                continue;
            }
            $groups[$restoName][] = $order;
        }

        $dryRun  = !request()->boolean('send');
        $results = [];

        foreach ($groups as $restoName => $groupOrders) {
            $email    = static::$restaurants[$restoName];
            $totalPax = array_sum(array_column($groupOrders, 'x_studio_count_of_people'));
            $subject  = 'BLUUU TOURS — Lunch Order ' . $day->format('d M Y');
            $body     = $this->formatMessage($day, $restoName, $groupOrders, $totalPax);

            $result = [
                'restaurant' => $restoName,
                'email'      => $email,
                'orders'     => count($groupOrders),
                'total_pax'  => $totalPax,
            ];

            if ($dryRun) {
                $result['status']  = 'dry_run';
                $result['preview'] = $body;
            } else {
                try {
                    Mail::raw($body, function ($m) use ($email, $restoName, $subject) {
                        $m->to($email, $restoName)->subject($subject);
                    });
                    $result['status'] = 'sent';
                } catch (\Exception $e) {
                    Log::error('BriefingController: failed to send to ' . $restoName . ': ' . $e->getMessage());
                    $result['status'] = 'failed';
                    $result['error']  = $e->getMessage();
                }
            }

            $results[] = $result;
        }

        return response()->json([
            'date'         => $day->toDateString(),
            'total_orders' => count($orders),
            'sent'         => $results,
            'unmapped'     => $unmapped,
            'dry_run'      => $dryRun,
        ]);
    }

    protected function formatMessage(Carbon $day, string $restoName, array $orders, int $totalPax): string
    {
        $lines = [
            'BLUUU TOURS — Lunch Order',
            'Date: ' . $day->format('d F Y'),
            'Restaurant: ' . $restoName,
            '',
        ];

        foreach ($orders as $order) {
            $boat   = $order['x_studio_boat_name'] ?: 'TBD';
            $adults = (int) ($order['x_studio_adults'] ?? 0);
            $kids   = (int) ($order['x_studio_kids'] ?? 0);
            $pax    = (int) ($order['x_studio_count_of_people'] ?? ($adults + $kids));
            $paxStr = $kids > 0 ? "{$pax} ({$adults} adults + {$kids} kids)" : "{$adults} adults";

            $arrivalTime = '';
            if (!empty($order['rental_start_date'])) {
                try {
                    $arrivalTime = Carbon::parse($order['rental_start_date'], 'UTC')
                        ->setTimezone('Asia/Makassar')
                        ->format('H:i');
                } catch (\Exception $e) {}
            }

            $lines[] = 'Boat: ' . $boat;
            $lines[] = '  Pax: ' . $paxStr;
            if ($arrivalTime) {
                $lines[] = '  Arrival approx: ' . $arrivalTime;
            }
            $lines[] = '';
        }

        $lines[] = 'Total pax today: ' . $totalPax;
        $lines[] = 'Please confirm receipt.';

        return implode("\n", $lines);
    }
}
