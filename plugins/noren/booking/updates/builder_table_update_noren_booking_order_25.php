<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingOrder25 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_order', function($table)
        {
            $table->integer('boat_id')->nullable()->after('tours_id');
        });
    }

    public function down()
    {
        Schema::table('noren_booking_order', function($table)
        {
            $table->dropColumn('boat_id');
        });
    }
}
