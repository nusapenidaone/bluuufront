<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingTransfer extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_transfer', function($table)
        {
            $table->increments('id')->unsigned();
            $table->string('name');
            $table->integer('price');
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_transfer');
    }
}
