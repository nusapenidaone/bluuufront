<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingAgent extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_agent', function($table)
        {
            $table->increments('id')->unsigned();
            $table->boolean('status')->nullable();
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('whatsapp')->nullable();
            $table->text('details')->nullable();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_agent');
    }
}
