<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingRates extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_rates', function($table)
        {
            $table->increments('id')->unsigned();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->string('code');
            $table->string('name');
            $table->decimal('rate', 10, 6);
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_rates');
    }
}
