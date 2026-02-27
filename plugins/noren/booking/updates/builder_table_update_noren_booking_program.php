<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingProgram extends Migration
{
    public function up()
    {
        Schema::rename('noren_booking_itineraries', 'noren_booking_program');
        Schema::table('noren_booking_program', function($table)
        {
            $table->integer('sort_order')->nullable();
            $table->text('description')->nullable();
            $table->text('list')->nullable();
            $table->dropColumn('tour_id');
        });
    }
    
    public function down()
    {
        Schema::rename('noren_booking_program', 'noren_booking_itineraries');
        Schema::table('noren_booking_itineraries', function($table)
        {
            $table->dropColumn('sort_order');
            $table->dropColumn('description');
            $table->dropColumn('list');
            $table->bigInteger('tour_id')->unsigned();
        });
    }
}
