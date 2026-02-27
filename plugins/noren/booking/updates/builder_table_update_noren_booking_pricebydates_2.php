<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingPricebydates2 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_pricebydates', function($table)
        {
            $table->boolean('low_price');
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_pricebydates', function($table)
        {
            $table->dropColumn('low_price');
        });
    }
}
