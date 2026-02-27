<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingToursBoat extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_tours_boat', function($table)
        {
            $table->integer('tours_id');
            $table->integer('boats_id');
            $table->primary(['tours_id','boats_id']);
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_tours_boat');
    }
}
