<?php
namespace Noren\Booking\Updates;

use Db;
use October\Rain\Database\Updates\Migration;

class SeedRoutesTable extends Migration
{
    public function up()
    {
        $commonBefore = [
            ['time' => '08:00', 'duration' => '30m', 'title' => 'Meeting point', 'details' => 'Meeting, briefing and welcome drinks'],
            ['time' => '08:30', 'duration' => '30m', 'title' => 'Departure', 'details' => 'Serangan, Bali'],
            ['time' => '09:00–11:00', 'duration' => '3h', 'title' => 'Snorkeling stops', 'details' => 'Bali Hai Lagoon · SD Point · Wall Point'],
            ['time' => '12:00', 'duration' => '1h 30m', 'title' => 'Lunch', 'details' => 'Amarta Penida restaurant (lunch venue may vary)'],
        ];

        $routes = [
            [
                'title' => 'Classic route',
                'slug' => 'classic-route',
                'description' => 'Iconic views with the signature highlights.',
                'best_for' => 'first-timers • iconic views',
                'best_with' => 'floating breakfast, photographer, private transfer',
                'highlights' => json_encode([
                    ['label' => 'Big views', 'icon' => 'MapPin',],
                    ['label' => 'Manta stop', 'icon' => 'Fish',],
                ]),
                'schedule_before_lunch' => json_encode($commonBefore),
                'schedule_after_lunch' => json_encode([
                    ['time' => '13:30–16:00', 'duration' => '2h 30m', 'title' => 'Afternoon plan (Classic route)', 'details' => 'Kelingking land tour (viewpoint / photo stop)'],
                    ['time' => '16:00', 'duration' => '1h', 'title' => 'Manta stop (weather permitting)', 'details' => 'Swim with manta rays'],
                    ['time' => '17:00–18:00', 'duration' => '', 'title' => 'Return', 'details' => 'Return cruise to Bali (time may vary)'],
                ]),
            ],
            [
                'title' => 'Family-first day',
                'slug' => 'family-first',
                'description' => 'Easy pacing with family-friendly stops.',
                'best_for' => 'families • relaxed pace',
                'best_with' => 'private transfer, extra towels, snack box',
                'highlights' => json_encode([
                    ['label' => 'Easy pace', 'icon' => 'Clock',],
                    ['label' => 'Lago Pontoon', 'icon' => 'LifeBuoy',],
                ]),
                'schedule_before_lunch' => json_encode($commonBefore),
                'schedule_after_lunch' => json_encode([
                    ['time' => '13:30–16:00', 'duration' => '2h 30m', 'title' => 'Afternoon plan (Family-first)', 'details' => 'Lago Pontoon family stop (shade breaks, calm swims, lounge time)'],
                    ['time' => '16:00–18:00', 'duration' => '', 'title' => 'Return', 'details' => 'Return cruise to Bali (time may vary)'],
                ]),
                'popup_afternoon' => 'This style skips the late manta stop to keep pacing easy for families.',
            ],
            [
                'title' => 'Celebration day',
                'slug' => 'celebration-day',
                'description' => 'Lunch + beach club with photo-ready moments.',
                'best_for' => 'celebrations • photos',
                'best_with' => 'champagne setup, decorations, photographer',
                'highlights' => json_encode([
                    ['label' => 'La Rossa lunch', 'icon' => 'UtensilsCrossed',],
                    ['label' => 'Photo-ready', 'icon' => 'Camera',],
                ]),
                'schedule_before_lunch' => json_encode([
                    ['time' => '08:00', 'duration' => '30m', 'title' => 'Meeting point', 'details' => 'Meeting, briefing and welcome drinks'],
                    ['time' => '08:30', 'duration' => '30m', 'title' => 'Departure', 'details' => 'Serangan, Bali'],
                    ['time' => '09:00–11:00', 'duration' => '3h', 'title' => 'Snorkeling stops', 'details' => 'Bali Hai Lagoon · SD Point · Wall Point'],
                ]),
                'schedule_after_lunch' => json_encode([
                    ['time' => '13:30–16:00', 'duration' => '2h 30m', 'title' => 'Afternoon plan (Celebration: lunch + beach club)', 'details' => 'La Rossa (lunch + celebration time, photo-ready moments)'],
                    ['time' => '16:00', 'duration' => '1h', 'title' => 'Manta stop (weather permitting)', 'details' => 'Swim with manta rays'],
                    ['time' => '17:00–18:30', 'duration' => '', 'title' => 'Return', 'details' => 'Return cruise to Bali (time may vary)'],
                ]),
            ],
            [
                'title' => 'Dive highlights',
                'slug' => 'dive-highlights',
                'description' => 'Dive-forward flow with focused water time.',
                'best_for' => 'certified divers • manta dive',
                'best_with' => 'wetsuit, pro photographer, GoPro rental',
                'highlights' => json_encode([
                    ['label' => 'Manta Point', 'icon' => 'Fish',],
                    ['label' => 'Dive focus', 'icon' => 'Shield',],
                ]),
                'schedule_before_lunch' => json_encode([
                    ['time' => '08:00', 'duration' => '30m', 'title' => 'Meeting point', 'details' => 'Meeting, briefing and welcome drinks'],
                    ['time' => '08:30', 'duration' => '30m', 'title' => 'Departure', 'details' => 'Serangan, Bali'],
                    ['time' => '09:00–11:00', 'duration' => '3h', 'title' => 'Snorkeling stops (or surface warm-up)', 'details' => 'Bali Hai Lagoon · SD Point · Wall Point (may adjust based on dive plan)'],
                    ['time' => '12:00', 'duration' => '1h 30m', 'title' => 'Lunch', 'details' => 'Amarta Penida restaurant (lunch venue may vary)'],
                ]),
                'schedule_after_lunch' => json_encode([
                    ['time' => '13:30–16:00', 'duration' => '2h 30m', 'title' => 'Afternoon plan (Dive highlights)', 'details' => 'Manta Point dive session (requirements/conditions apply; safety-first routing)'],
                    ['time' => '16:00–18:30', 'duration' => '', 'title' => 'Return', 'details' => 'Return cruise to Bali (time may vary)'],
                ]),
                'popup_afternoon' => 'Designed for divers; requirements may apply. If conditions change, we choose the safest alternative.',
                'add_on_note' => 'Diving is an add-on (not included). Choose options in Extras.',
            ],
            [
                'title' => 'Watersport day',
                'slug' => 'watersport-day',
                'description' => 'High-energy water time with extra gear.',
                'best_for' => 'adrenaline • water toys',
                'best_with' => 'watersport add-ons, GoPro rental, towel kit',
                'highlights' => json_encode([
                    ['label' => 'Jetski + e-foil', 'icon' => 'Waves',],
                    ['label' => 'Sea scooter', 'icon' => 'Anchor',],
                ]),
                'schedule_before_lunch' => json_encode($commonBefore),
                'schedule_after_lunch' => json_encode([
                    ['time' => '13:30–16:00', 'duration' => '2h 30m', 'title' => 'Afternoon plan (Watersport)', 'details' => 'Watersport session (jetski · e-foil board · underwater scooter)'],
                    ['time' => '16:00', 'duration' => '1h', 'title' => 'Manta stop (weather permitting)', 'details' => 'Swim with manta rays'],
                    ['time' => '17:00–18:30', 'duration' => '', 'title' => 'Return', 'details' => 'Return cruise to Bali (time may vary)'],
                ]),
                'add_on_note' => 'Watersport is an add-on (not included). Choose options in Extras.',
            ],
            [
                'title' => 'Chill & relax',
                'slug' => 'chill-relax',
                'description' => 'Slow pacing with extra lounge time.',
                'best_for' => 'couples • slow scenic day',
                'best_with' => 'daybed, mocktails, private transfer',
                'highlights' => json_encode([
                    ['label' => 'Scenic bays', 'icon' => 'Sun',],
                    ['label' => 'Extra lounge', 'icon' => 'Waves',],
                ]),
                'schedule_before_lunch' => json_encode([
                    ['time' => '08:00', 'duration' => '30m', 'title' => 'Meeting point', 'details' => 'Meeting, briefing and welcome drinks'],
                    ['time' => '08:30', 'duration' => '30m', 'title' => 'Departure', 'details' => 'Serangan, Bali'],
                    ['time' => '09:00–11:00', 'duration' => '3h', 'title' => 'Morning plan (flexible)', 'details' => 'Scenic cruising + light snorkeling stops (guest preference)'],
                    ['time' => '12:00', 'duration' => '1h 30m', 'title' => 'Lunch', 'details' => 'Amarta Penida restaurant (lunch venue may vary)'],
                ]),
                'schedule_after_lunch' => json_encode([
                    ['time' => '13:30–16:00', 'duration' => '2h 30m', 'title' => 'Afternoon plan (Chill & relax)', 'details' => 'Lago Pontoon chill time (slow pacing, extra lounge time, easy scenic stops)'],
                    ['time' => '16:00', 'duration' => '1h', 'title' => 'Late highlight (weather permitting)', 'details' => 'Manta stop'],
                    ['time' => '17:00–18:30', 'duration' => '', 'title' => 'Return', 'details' => 'Return cruise to Bali (time may vary)'],
                ]),
                'popup_afternoon' => 'This style can be done with minimal snorkeling — tell the crew your preference.',
            ],
        ];

        foreach ($routes as $route) {
            Db::table('noren_booking_route')->insert($route);
        }
    }

    public function down()
    {
        Db::table('noren_booking_route')->truncate();
    }
}
