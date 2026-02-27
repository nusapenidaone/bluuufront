<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingProgramRestaurant extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_program_restaurant', function($table)
        {
            $table->integer('program_id');
            $table->integer('restaurant_id');
            $table->primary(['program_id','restaurant_id']);
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_program_restaurant');
    }
}
