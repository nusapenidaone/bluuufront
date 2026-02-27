<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingRestaurant2 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_restaurant', function($table)
        {
            $table->string('amo_name')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_restaurant', function($table)
        {
            $table->dropColumn('amo_name');
        });
    }
}
