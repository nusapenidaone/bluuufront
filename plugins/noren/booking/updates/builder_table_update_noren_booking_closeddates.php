<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingCloseddates extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_closeddates', function($table)
        {
            $table->integer('type')->nullable()->default(2);
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_closeddates', function($table)
        {
            $table->dropColumn('type');
        });
    }
}
