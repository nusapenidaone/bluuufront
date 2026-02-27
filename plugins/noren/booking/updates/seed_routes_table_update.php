<?php
namespace Noren\Booking\Updates;

use Db;
use October\Rain\Database\Updates\Migration;

// Data source: src/shared.jsx → STATIC_SHARED_OPTIONS + scheduleByOption + StepThreeDetails
class SeedRoutesTableUpdate extends Migration
{
    public function up()
    {
        $routes = [
            [
                'slug'        => 'classic',
                'title'       => 'Classic shared tour',
                'description' => '<p>Our signature day trip from Bali to Nusa Penida with snorkeling, manta point attempts, lunch, and the iconic Kelingking land stop.</p>',
                'best_for'    => 'first-timers • best value • all the highlights',
                'best_with'   => '',
                'badge'       => '',
                'tone'        => '',
                'highlights'  => json_encode([
                    ['label' => 'Fast-paced day',         'icon' => ''],
                    ['label' => 'Great for first-timers', 'icon' => ''],
                ]),
                // Sections stored as arrays — icon is a string, mapped to component on the frontend
                'schedule_before_lunch' => json_encode([
                    [
                        'section' => 'Morning',
                        'range'   => '08:00–11:00',
                        'items'   => [
                            ['title' => 'Meeting point',    'time' => '08:00',       'duration' => '30m', 'detail' => 'Meeting, briefing and coffee',              'icon' => 'MapPin'],
                            ['title' => 'Departure',        'time' => '08:30',       'duration' => '30m', 'location' => 'Serangan, Bali',                         'icon' => 'Ship'],
                            ['title' => 'Snorkeling stops', 'time' => '09:00–11:00', 'duration' => '3h',  'location' => 'Bali Hai Lagoon · SD Point · Wall Point', 'icon' => 'Waves'],
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
                            ['title' => 'Kelingking Cliff', 'time' => '13:30', 'duration' => '2h 30m', 'detail' => 'Land tour by car',       'icon' => 'Camera'],
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
                'popup_title'     => 'Classic shared tour',
                'popup_afternoon' => '',
                'add_on_note'     => '',
            ],

            [
                'slug'        => 'premium',
                'title'       => 'Premium shared tour',
                'description' => '<p>A relaxed premium version of the shared tour with extra comfort, more time on route, and a sunset Prosecco moment before returning.</p>',
                'best_for'    => 'comfort seekers • sunset lovers • more time on route',
                'best_with'   => '',
                'badge'       => 'Most popular',
                'tone'        => '',
                'highlights'  => json_encode([
                    ['label' => 'Premium boat',    'icon' => ''],
                    ['label' => 'Sunset Prosecco', 'icon' => ''],
                ]),
                'schedule_before_lunch' => json_encode([
                    [
                        'section' => 'Morning',
                        'range'   => '08:00–11:00',
                        'items'   => [
                            ['title' => 'Meeting point',    'time' => '08:00',       'duration' => '30m', 'detail' => 'Meeting, briefing and welcome drinks',      'icon' => 'MapPin'],
                            ['title' => 'Departure',        'time' => '08:30',       'duration' => '30m', 'location' => 'Serangan, Bali',                         'icon' => 'Ship'],
                            ['title' => 'Snorkeling stops', 'time' => '09:00–11:00', 'duration' => '3h',  'location' => 'Bali Hai Lagoon · SD Point · Wall Point', 'icon' => 'Waves'],
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
                            ['title' => 'Kelingking Cliff', 'time' => '13:30', 'duration' => '2h 30m', 'detail' => 'Land tour by car',       'icon' => 'Camera'],
                            ['title' => 'Manta Point',      'time' => '16:00', 'duration' => '1h',     'detail' => 'Swimming with Manta Rays', 'icon' => 'Fish'],
                        ],
                    ],
                    [
                        'section' => 'Sunset',
                        'range'   => '17:00–18:00',
                        'items'   => [
                            ['title' => 'Secret Spot', 'time' => '17:00', 'duration' => '1h',  'detail' => 'Chilling and enjoying Prosecco', 'icon' => 'Sparkles'],
                            ['title' => 'Arrival',     'time' => '18:00', 'duration' => '30m', 'location' => 'Serangan, Bali',              'icon' => 'Anchor'],
                        ],
                    ],
                ]),
                'popup_title'     => 'Premium shared tour',
                'popup_afternoon' => '+1 hour, less rush, premium guides.',
                'add_on_note'     => '',
            ],
        ];

        foreach ($routes as $route) {
            $exists = Db::table('noren_booking_route')->where('slug', $route['slug'])->first();

            if ($exists) {
                Db::table('noren_booking_route')
                    ->where('slug', $route['slug'])
                    ->update(array_merge($route, ['updated_at' => now()]));
            } else {
                Db::table('noren_booking_route')
                    ->insert(array_merge($route, ['created_at' => now(), 'updated_at' => now()]));
            }
        }
    }

    public function down()
    {
        Db::table('noren_booking_route')
            ->whereIn('slug', ['classic', 'premium'])
            ->delete();
    }
}
