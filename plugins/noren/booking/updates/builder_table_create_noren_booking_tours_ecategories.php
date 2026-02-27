<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingToursEcategories extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_tours_ecategories', function($table)
        {
            $table->integer('tours_id');
            $table->integer('ecategories_id');
            $table->primary(['tours_id','ecategories_id']);
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_tours_ecategories');
    }
}
