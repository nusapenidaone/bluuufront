<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingLowseasonTours extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_lowseason_tours', function($table)
        {
            $table->integer('lowseason_id');
            $table->integer('tours_id');
            $table->primary(['lowseason_id','tours_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('noren_booking_lowseason_tours');
    }
}
