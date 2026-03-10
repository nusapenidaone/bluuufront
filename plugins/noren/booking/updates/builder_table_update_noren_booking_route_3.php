<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingRoute3 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_route', function($table)
        {
            $table->integer('classes_id')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_route', function($table)
        {
            $table->dropColumn('classes_id');
        });
    }
}
