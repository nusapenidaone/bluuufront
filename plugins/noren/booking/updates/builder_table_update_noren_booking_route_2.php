<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingRoute2 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_route', function($table)
        {
            $table->integer('restaurant_id')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_route', function($table)
        {
            $table->dropColumn('restaurant_id');
        });
    }
}
