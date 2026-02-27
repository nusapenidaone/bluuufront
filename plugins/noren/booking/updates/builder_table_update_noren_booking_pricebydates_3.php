<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingPricebydates3 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_pricebydates', function($table)
        {
            $table->boolean('flash_sale');
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_pricebydates', function($table)
        {
            $table->dropColumn('flash_sale');
        });
    }
}
