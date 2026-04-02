<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingOrder26 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_order', function($table)
        {
            $table->integer('route_id')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_order', function($table)
        {
            $table->dropColumn('route_id');
        });
    }
}
