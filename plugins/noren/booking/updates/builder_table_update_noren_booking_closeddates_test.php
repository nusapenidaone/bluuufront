<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingCloseddatesTest extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_closeddates_test', function($table)
        {
            $table->string('tour_type')->nullable();
        });
    }

    public function down()
    {
        Schema::table('noren_booking_closeddates_test', function($table)
        {
            $table->dropColumn('tour_type');
        });
    }
}
