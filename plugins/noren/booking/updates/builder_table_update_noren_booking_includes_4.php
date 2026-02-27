<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingIncludes4 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_includes', function($table)
        {
            $table->dropColumn('icon');
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_includes', function($table)
        {
            $table->string('icon', 255)->nullable();
        });
    }
}
