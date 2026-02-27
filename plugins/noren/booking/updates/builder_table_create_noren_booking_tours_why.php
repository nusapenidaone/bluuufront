<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingToursWhy extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_tours_why', function($table)
        {
            $table->integer('tours_id');
            $table->integer('why_id');
            $table->primary(['tours_id','why_id']);
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_tours_why');
    }
}
