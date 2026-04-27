<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingExtras12 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_extras', function($table)
        {
            $table->boolean('per_car')->nullable()->default(false);
        });
    }

    public function down()
    {
        Schema::table('noren_booking_extras', function($table)
        {
            $table->dropColumn('per_car');
        });
    }
}
