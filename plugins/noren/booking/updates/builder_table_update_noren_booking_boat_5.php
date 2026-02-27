<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingBoat5 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_boat', function($table)
        {
            $table->boolean('closed')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_boat', function($table)
        {
            $table->dropColumn('closed');
        });
    }
}
