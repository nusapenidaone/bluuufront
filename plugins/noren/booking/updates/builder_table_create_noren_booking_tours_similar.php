<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingToursSimilar extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_tours_similar', function($table)
        {
            $table->integer('tours_id');
            $table->integer('similiar_tours_id');
            $table->primary(['tours_id','similiar_tours_id']);
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_tours_similar');
    }
}
