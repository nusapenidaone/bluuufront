<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingToursRestaurant extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_tours_restaurant', function($table)
        {
            $table->dropPrimary(['tours_id','resataurant_id']);
            $table->renameColumn('resataurant_id', 'restaurant_id');
            $table->primary(['tours_id','restaurant_id']);
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_tours_restaurant', function($table)
        {
            $table->dropPrimary(['tours_id','restaurant_id']);
            $table->renameColumn('restaurant_id', 'resataurant_id');
            $table->primary(['tours_id','resataurant_id']);
        });
    }
}
