<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingRouteEcategories extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_route_ecategories', function($table)
        {
            $table->integer('route_id');
            $table->integer('ecategories_id');
            $table->primary(['route_id','ecategories_id']);
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_route_ecategories');
    }
}
