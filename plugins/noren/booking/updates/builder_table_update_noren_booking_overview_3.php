<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingOverview3 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_overview', function($table)
        {
            $table->text('list')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_overview', function($table)
        {
            $table->dropColumn('list');
        });
    }
}
