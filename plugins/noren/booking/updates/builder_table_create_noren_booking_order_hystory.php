<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingOrderHystory extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_order_hystory', function($table)
        {
            $table->increments('id')->unsigned();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->text('old')->nullable();
            $table->text('new')->nullable();
            $table->integer('status')->nullable();
            $table->integer('order_id')->nullable();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_order_hystory');
    }
}
