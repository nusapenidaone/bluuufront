<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingExtras6 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_extras', function($table)
        {
            $table->integer('sort_order')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_extras', function($table)
        {
            $table->dropColumn('sort_order');
        });
    }
}
