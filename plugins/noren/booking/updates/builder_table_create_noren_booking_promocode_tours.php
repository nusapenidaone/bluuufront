<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingPromocodeTours extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_promocode_tours', function($table)
        {
            $table->integer('promocode_id');
            $table->integer('tours_id');
            $table->primary(['promocode_id','tours_id']);
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_promocode_tours');
    }
}
