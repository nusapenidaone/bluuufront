<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingMeeting extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_meeting', function($table)
        {
            $table->string('name')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_meeting', function($table)
        {
            $table->dropColumn('name');
        });
    }
}
