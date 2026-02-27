<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingCategory extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_category', function($table)
        {
            $table->increments('id')->unsigned();
            $table->text('name')->nullable();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_category');
    }
}
