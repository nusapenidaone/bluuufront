<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingBedge extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_bedge', function($table)
        {
            $table->increments('id')->unsigned();
            $table->string('name')->nullable();
            $table->string('icon')->nullable();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_bedge');
    }
}
