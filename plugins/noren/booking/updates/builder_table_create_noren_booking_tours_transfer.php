<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingToursTransfer extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_tours_transfer', function($table)
        {
            $table->integer('tours_id');
            $table->integer('transfer_id');
            $table->primary(['tours_id','transfer_id']);
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_tours_transfer');
    }
}
