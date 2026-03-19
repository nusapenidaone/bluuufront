<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingRoute4 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_route', function($table)
        {
            $table->integer('sort_order')->nullable()->default(0);
        });
    }

    public function down()
    {
        Schema::table('noren_booking_route', function($table)
        {
            $table->dropColumn('sort_order');
        });
    }
}
