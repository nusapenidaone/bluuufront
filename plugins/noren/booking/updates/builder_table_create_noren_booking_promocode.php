<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingPromocode extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_promocode', function($table)
        {
            $table->increments('id')->unsigned();
            $table->string('code')->nullable();
            $table->integer('discount')->nullable();
            $table->integer('agent_id')->nullable();
            $table->integer('agent_fee')->nullable();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_promocode');
    }
}
