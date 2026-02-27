<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingToursRestaurant extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_tours_restaurant', function($table)
        {
            $table->integer('tours_id');
            $table->integer('resataurant_id');
            $table->primary(['tours_id','resataurant_id']);
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_tours_restaurant');
    }
}
