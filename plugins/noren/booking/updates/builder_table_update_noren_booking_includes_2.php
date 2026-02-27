<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingIncludes2 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_includes', function($table)
        {
            $table->integer('sort_order')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_includes', function($table)
        {
            $table->dropColumn('sort_order');
        });
    }
}
