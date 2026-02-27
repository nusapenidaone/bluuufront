<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingTours13 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_tours', function($table)
        {
            $table->integer('capacity')->nullable();
            $table->integer('duration')->nullable();
            $table->integer('size')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_tours', function($table)
        {
            $table->dropColumn('capacity');
            $table->dropColumn('duration');
            $table->dropColumn('size');
        });
    }
}
