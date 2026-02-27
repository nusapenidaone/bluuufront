<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingOverview extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_overview', function($table)
        {
            $table->renameColumn('title', 'name');
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_overview', function($table)
        {
            $table->renameColumn('name', 'title');
        });
    }
}
