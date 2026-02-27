<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingToursIncludes extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_tours_includes', function($table)
        {
            $table->integer('tours_id');
            $table->integer('includes_id');
            $table->primary(['tours_id','includes_id']);
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_tours_includes');
    }
}
