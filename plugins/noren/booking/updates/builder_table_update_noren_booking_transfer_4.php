<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingTransfer4 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_transfer', function($table)
        {
            $table->integer('bus_price')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_transfer', function($table)
        {
            $table->dropColumn('bus_price');
        });
    }
}
