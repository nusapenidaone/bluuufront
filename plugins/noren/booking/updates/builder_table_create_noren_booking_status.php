<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingStatus extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_status', function($table)
        {
            $table->increments('id')->unsigned();
            $table->string('name');
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_status');
    }
}
