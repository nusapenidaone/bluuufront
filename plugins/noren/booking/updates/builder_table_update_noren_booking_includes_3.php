<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingIncludes3 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_includes', function($table)
        {
            $table->string('icon')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_includes', function($table)
        {
            $table->dropColumn('icon');
        });
    }
}
