<?php
namespace Noren\Booking\Updates;

use Db;
use October\Rain\Database\Updates\Migration;

// Data source: src/shared.jsx → STATIC_SHARED_OPTIONS
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
                    ['label' => 'Fast-paced day',      'icon' => ''],
                    ['label' => 'Great for first-timers', 'icon' => ''],
                ]),
                'schedule_before_lunch' => json_encode([
                    ['title' => 'Meet & briefing',        'details' => 'Meet the crew, safety briefing, boarding.'],
                    ['title' => 'Fast boat to Nusa Penida', 'details' => 'Scenic crossing and arrival.'],
                    ['title' => 'Morning highlights',     'details' => 'Top viewpoints + snorkeling stop.'],
                    ['title' => 'Lunch break',            'details' => 'Amarta restaurant.'],
                ]),
                'schedule_after_lunch' => json_encode([
                    ['title' => 'Afternoon loop', 'details' => 'Final highlights and photo moments.'],
                    ['title' => 'Return to Bali', 'details' => 'Arrive back in the afternoon.'],
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
                    ['title' => 'Meet & briefing',     'details' => 'Priority check-in and welcome.'],
                    ['title' => 'Premium boat crossing', 'details' => 'Comfort seating and space.'],
                    ['title' => 'Morning highlights',  'details' => 'Longer time at top viewpoints.'],
                    ['title' => 'Leisure lunch',       'details' => 'La Rossa restaurant.'],
                ]),
                'schedule_after_lunch' => json_encode([
                    ['title' => 'Afternoon highlights', 'details' => 'More time for photos + swim.'],
                    ['title' => 'Sunset stop',          'details' => 'Secret spot, Prosecco included.'],
                    ['title' => 'Return to Bali',       'details' => 'Relaxed cruise back.'],
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