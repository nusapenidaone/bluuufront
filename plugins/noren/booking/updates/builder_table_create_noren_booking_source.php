<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingSource extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_source', function($table)
        {
            $table->increments('id')->unsigned();
            $table->string('name')->nullable();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_source');
    }
}
