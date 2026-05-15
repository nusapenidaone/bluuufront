<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingTours43 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_tours', function($table)
        {
            $table->integer('source_id')->unsigned()->nullable()->after('avail_type');
        });
    }

    public function down()
    {
        Schema::table('noren_booking_tours', function($table)
        {
            $table->dropColumn('source_id');
        });
    }
}
