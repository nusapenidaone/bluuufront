<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingOverview extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_overview', function($table)
        {
            $table->increments('id')->unsigned();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->integer('type')->nullable();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_overview');
    }
}
