<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingRestaurant4 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_restaurant', function($table)
        {
            $table->dropColumn('list');
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_restaurant', function($table)
        {
            $table->text('list')->nullable();
        });
    }
}
