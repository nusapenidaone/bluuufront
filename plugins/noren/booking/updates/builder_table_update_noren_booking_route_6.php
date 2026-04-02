<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingRoute6 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_route', function($table)
        {
            $table->time('start')->nullable();
            $table->time('end')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_route', function($table)
        {
            $table->dropColumn('start');
            $table->dropColumn('end');
        });
    }
}
