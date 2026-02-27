<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingCloseddates3 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_closeddates', function($table)
        {
            $table->boolean('delete')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_closeddates', function($table)
        {
            $table->dropColumn('delete');
        });
    }
}
