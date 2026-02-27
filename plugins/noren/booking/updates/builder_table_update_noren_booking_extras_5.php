<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingExtras5 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_extras', function($table)
        {
            $table->renameColumn('my_request', 'by_request');
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_extras', function($table)
        {
            $table->renameColumn('by_request', 'my_request');
        });
    }
}
