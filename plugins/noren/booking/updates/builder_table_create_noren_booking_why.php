<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingWhy extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_why', function($table)
        {
            $table->increments('id')->unsigned();
            $table->string('name')->nullable();
            $table->string('icon')->nullable();
            $table->integer('sort_order')->nullable();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_why');
    }
}
