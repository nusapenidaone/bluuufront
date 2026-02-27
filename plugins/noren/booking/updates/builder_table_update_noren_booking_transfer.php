<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingTransfer extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_transfer', function($table)
        {
            $table->text('description')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_transfer', function($table)
        {
            $table->dropColumn('description');
        });
    }
}
