<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingTours14 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_tours', function($table)
        {
            $table->integer('cancelation_id')->nullable();
            $table->integer('meeting_id')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_tours', function($table)
        {
            $table->dropColumn('cancelation_id');
            $table->dropColumn('meeting_id');
        });
    }
}
