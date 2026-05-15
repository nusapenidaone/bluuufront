<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingToursBoat2 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_tours_boat', function($table)
        {
            $table->integer('sort_order')->default(0)->after('boat_id');
        });
    }

    public function down()
    {
        Schema::table('noren_booking_tours_boat', function($table)
        {
            $table->dropColumn('sort_order');
        });
    }
}
