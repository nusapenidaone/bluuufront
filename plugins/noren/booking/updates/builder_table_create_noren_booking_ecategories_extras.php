<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingEcategoriesExtras extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_ecategories_extras', function($table)
        {
            $table->integer('ecategories_id');
            $table->integer('extras_id');
            $table->primary(['ecategories_id','extras_id']);
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_ecategories_extras');
    }
}
