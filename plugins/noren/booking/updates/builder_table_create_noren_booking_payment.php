<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingPayment extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_payment', function($table)
        {
            $table->increments('id')->unsigned();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->boolean('status');
            $table->integer('order_id');
            $table->text('body');
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_payment');
    }
}
