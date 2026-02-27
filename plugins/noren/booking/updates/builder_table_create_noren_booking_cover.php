<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingCover extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_cover', function($table)
        {
            $table->increments('id')->unsigned();
            $table->string('name');
            $table->integer('price');
            $table->text('description')->nullable();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_cover');
    }
}
