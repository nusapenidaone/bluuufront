<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingBoat extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_boat', function($table)
        {
            $table->increments('id')->unsigned();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->string('name')->nullable();
            $table->integer('capacity')->nullable();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_boat');
    }
}
