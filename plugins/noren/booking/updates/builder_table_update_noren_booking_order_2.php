<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingOrder2 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_order', function($table)
        {
            $table->string('external_id')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_order', function($table)
        {
            $table->dropColumn('external_id');
        });
    }
}
