<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingTours2 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_tours', function($table)
        {
            $table->renameColumn('type_id', 'types_id');
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_tours', function($table)
        {
            $table->renameColumn('types_id', 'type_id');
        });
    }
}
