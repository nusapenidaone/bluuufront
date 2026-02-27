<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingTransfer3 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_transfer', function($table)
        {
            $table->text('short_description')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_transfer', function($table)
        {
            $table->dropColumn('short_description');
        });
    }
}
