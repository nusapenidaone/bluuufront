<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingIncluded extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_included', function($table)
        {
            $table->string('icon')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_included', function($table)
        {
            $table->dropColumn('icon');
        });
    }
}
