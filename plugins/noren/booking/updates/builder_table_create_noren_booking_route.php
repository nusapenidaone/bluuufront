<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingRoute extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_route', function($table)
        {
            $table->increments('id')->unsigned();
            $table->string('title');
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_route');
    }
}
