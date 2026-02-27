<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingToursSimilar extends Migration
{
    public function up()
    {
        Schema::rename('noren_booking_tours_tours', 'noren_booking_tours_similar');
        Schema::table('noren_booking_tours_similar', function($table)
        {
            $table->dropPrimary(['tours_id','similiar_tours_id']);
            $table->renameColumn('similiar_tours_id', 'similar_tours_id');
            $table->primary(['tours_id','similar_tours_id']);
        });
    }
    
    public function down()
    {
        Schema::rename('noren_booking_tours_similar', 'noren_booking_tours_tours');
        Schema::table('noren_booking_tours_tours', function($table)
        {
            $table->dropPrimary(['tours_id','similar_tours_id']);
            $table->renameColumn('similar_tours_id', 'similiar_tours_id');
            $table->primary(['tours_id','similiar_tours_id']);
        });
    }
}
