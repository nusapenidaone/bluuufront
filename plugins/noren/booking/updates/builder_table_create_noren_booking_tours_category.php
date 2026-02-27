<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingToursCategory extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_tours_category', function($table)
        {
            $table->integer('tours_id');
            $table->integer('category_id');
            $table->primary(['tours_id','category_id']);
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_tours_category');
    }
}
