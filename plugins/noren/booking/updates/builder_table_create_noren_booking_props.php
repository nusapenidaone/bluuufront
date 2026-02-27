<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingProps extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_props', function($table)
        {
            $table->increments('id')->unsigned();
            $table->integer('sort_order')->nullable();
            $table->string('name')->nullable();
            $table->string('icon')->nullable();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_props');
    }
}
