<?php
namespace Noren\Booking\Updates;

use Db;
use October\Rain\Database\Updates\Migration;

// Updates schedule_before_lunch / schedule_after_lunch for shared tour routes
// with full sectioned format (section, range, items[])
class SeedRoutesScheduleShared extends Migration
{
    public function up()
    {
        $schedules = [
            'classic' => [
                'schedule_before_lunch' => json_encode([
                    [
                        'section' => 'Morning',
                        'range'   => '08:00–11:00',
                        'items'   => [
                            ['title' => 'Meeting point',    'time' => '08:00',       'duration' => '30m', 'detail'   => 'Meeting, briefing and coffee',              'icon' => 'MapPin'],
                            ['title' => 'Departure',        'time' => '08:30',       'duration' => '30m', 'location' => 'Serangan, Bali',                           'icon' => 'Ship'],
                            ['title' => 'Snorkeling stops', 'time' => '09:00–11:00', 'duration' => '3h',  'location' => 'Bali Hai Lagoon · SD Point · Wall Point',   'icon' => 'Waves'],
                        ],
                    ],
                    [
                        'section' => 'Midday',
                        'range'   => '12:00',
                        'items'   => [
                            ['title' => 'Amarta Restaurant', 'time' => '12:00', 'duration' => '1h 30m', 'detail' => 'Lunch', 'icon' => 'UtensilsCrossed'],
                        ],
                    ],
                ]),
                'schedule_after_lunch' => json_encode([
                    [
                        'section' => 'Afternoon',
                        'range'   => '13:30–16:00',
                        'items'   => [
                            ['title' => 'Kelingking Cliff', 'time' => '13:30', 'duration' => '2h 30m', 'detail' => 'Land tour by car',        'icon' => 'Camera'],
                            ['title' => 'Manta Point',      'time' => '16:00', 'duration' => '1h',     'detail' => 'Swimming with Manta Rays', 'icon' => 'Fish'],
                        ],
                    ],
                    [
                        'section' => 'Sunset',
                        'range'   => '17:00–18:00',
                        'items'   => [
                            ['title' => 'Arrival', 'time' => '18:00', 'duration' => '30m', 'location' => 'Serangan, Bali', 'icon' => 'Anchor'],
                        ],
                    ],
                ]),
            ],

            'premium' => [
                'schedule_before_lunch' => json_encode([
                    [
                        'section' => 'Morning',
                        'range'   => '08:00–11:00',
                        'items'   => [
                            ['title' => 'Meeting point',    'time' => '08:00',       'duration' => '30m', 'detail'   => 'Meeting, briefing and welcome drinks',      'icon' => 'MapPin'],
                            ['title' => 'Departure',        'time' => '08:30',       'duration' => '30m', 'location' => 'Serangan, Bali',                           'icon' => 'Ship'],
                            ['title' => 'Snorkeling stops', 'time' => '09:00–11:00', 'duration' => '3h',  'location' => 'Bali Hai Lagoon · SD Point · Wall Point',   'icon' => 'Waves'],
                        ],
                    ],
                    [
                        'section' => 'Midday',
                        'range'   => '12:00',
                        'items'   => [
                            ['title' => 'La Rossa Restaurant', 'time' => '12:00', 'duration' => '1h 30m', 'detail' => 'Lunch', 'icon' => 'UtensilsCrossed'],
                        ],
                    ],
                ]),
                'schedule_after_lunch' => json_encode([
                    [
                        'section' => 'Afternoon',
                        'range'   => '13:30–16:00',
                        'items'   => [
                            ['title' => 'Kelingking Cliff', 'time' => '13:30', 'duration' => '2h 30m', 'detail' => 'Land tour by car',        'icon' => 'Camera'],
                            ['title' => 'Manta Point',      'time' => '16:00', 'duration' => '1h',     'detail' => 'Swimming with Manta Rays', 'icon' => 'Fish'],
                        ],
                    ],
                    [
                        'section' => 'Sunset',
                        'range'   => '17:00–18:00',
                        'items'   => [
                            ['title' => 'Secret Spot', 'time' => '17:00', 'duration' => '1h',  'detail'   => 'Chilling and enjoying Prosecco', 'icon' => 'Sparkles'],
                            ['title' => 'Arrival',     'time' => '18:00', 'duration' => '30m', 'location' => 'Serangan, Bali',                 'icon' => 'Anchor'],
                        ],
                    ],
                ]),
            ],
        ];

        foreach ($schedules as $slug => $data) {
            Db::table('noren_booking_route')
                ->where('slug', $slug)
                ->update(array_merge($data, ['updated_at' => now()]));
        }
    }

    public function down()
    {
        // Revert to empty schedule
        Db::table('noren_booking_route')
            ->whereIn('slug', ['classic', 'premium'])
            ->update(['schedule_before_lunch' => null, 'schedule_after_lunch' => null]);
    }
}
