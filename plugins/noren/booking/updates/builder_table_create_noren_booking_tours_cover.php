<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingToursCover extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_tours_cover', function($table)
        {
            $table->integer('tours_id');
            $table->integer('cover_id');
            $table->primary(['tours_id','cover_id']);
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_tours_cover');
    }
}
