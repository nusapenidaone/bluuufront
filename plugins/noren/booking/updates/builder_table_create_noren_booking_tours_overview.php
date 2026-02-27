<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingToursOverview extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_tours_overview', function($table)
        {
            $table->integer('tours_id');
            $table->integer('overview_id');
            $table->primary(['tours_id','overview_id']);
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_tours_overview');
    }
}
