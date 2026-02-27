<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingOverview4 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_overview', function($table)
        {
            $table->text('list_title')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_overview', function($table)
        {
            $table->dropColumn('list_title');
        });
    }
}
