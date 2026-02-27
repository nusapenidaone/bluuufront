<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingMeeting2 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_meeting', function($table)
        {
            $table->dropColumn('title');
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_meeting', function($table)
        {
            $table->string('title', 255)->nullable();
        });
    }
}
