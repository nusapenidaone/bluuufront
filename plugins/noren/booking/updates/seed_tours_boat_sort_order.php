<?php namespace Noren\Booking\Updates;

use October\Rain\Database\Updates\Migration;
use DB;

class SeedToursBoatSortOrder extends Migration
{
    public function up()
    {
        DB::statement('
            UPDATE noren_booking_tours_boat tb
            JOIN noren_booking_boat b ON b.id = tb.boat_id
            SET tb.sort_order = b.sort_order
            WHERE tb.sort_order = 0
        ');
    }

    public function down()
    {
    }
}
