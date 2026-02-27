<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingOrder extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_order', function($table)
        {
            $table->increments('id')->unsigned();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->integer('tours_id');
            $table->date('travel_date');
            $table->integer('adults');
            $table->integer('kids');
            $table->integer('children');
            $table->integer('members');
            $table->integer('cars');
            $table->integer('transfer_id')->nullable();
            $table->integer('cover_id')->nullable();
            $table->integer('program_id')->nullable();
            $table->integer('boat_price')->nullable()->default(0);
            $table->integer('tour_price')->nullable()->default(0);
            $table->integer('transfer_price')->nullable()->default(0);
            $table->integer('cover_price')->nullable()->default(0);
            $table->integer('program_price')->nullable()->default(0);
            $table->integer('extras_total')->nullable()->default(0);
            $table->integer('discount')->nullable()->default(0);
            $table->string('promocode')->nullable();
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('whatsapp')->nullable();
            $table->string('pickup_address')->nullable();
            $table->string('dropoff_address')->nullable();
            $table->text('requests')->nullable();
            $table->integer('status_id')->nullable();
            $table->integer('payment_status_id')->nullable();
            $table->integer('confirmation_status_id')->nullable();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_order');
    }
}
