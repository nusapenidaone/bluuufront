<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingExtras13 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_extras', function($table)
        {
            $table->string('qty_type')->nullable()->default('manual');
        });
    }

    public function down()
    {
        Schema::table('noren_booking_extras', function($table)
        {
            $table->dropColumn('qty_type');
        });
    }
}
