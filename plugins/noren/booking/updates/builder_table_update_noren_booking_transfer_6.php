<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingTransfer6 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_transfer', function($table)
        {
            $table->integer('classes_id')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_transfer', function($table)
        {
            $table->dropColumn('classes_id');
        });
    }
}
