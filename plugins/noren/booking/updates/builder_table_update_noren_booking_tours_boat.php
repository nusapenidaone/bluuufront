<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingToursBoat extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_tours_boat', function($table)
        {
            $table->dropPrimary(['tours_id','boats_id']);
            $table->renameColumn('boats_id', 'boat_id');
            $table->primary(['tours_id','boat_id']);
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_tours_boat', function($table)
        {
            $table->dropPrimary(['tours_id','boat_id']);
            $table->renameColumn('boat_id', 'boats_id');
            $table->primary(['tours_id','boats_id']);
        });
    }
}
