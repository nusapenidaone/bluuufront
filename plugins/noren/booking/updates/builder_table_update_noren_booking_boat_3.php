<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingBoat3 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_boat', function($table)
        {
            $table->dropColumn('id');
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_boat', function($table)
        {
            $table->increments('id')->unsigned();
        });
    }
}
