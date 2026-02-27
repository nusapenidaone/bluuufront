<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingRatesHistory extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_rates_history', function($table)
        {
            $table->increments('id')->unsigned();
            $table->integer('rates_id');
            $table->decimal('rate', 10, 8);
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_rates_history');
    }
}
