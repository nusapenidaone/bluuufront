<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingAdditional extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_additional', function($table)
        {
            $table->increments('id')->unsigned();
            $table->string('name')->nullable();
            $table->text('text')->nullable();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_additional');
    }
}
