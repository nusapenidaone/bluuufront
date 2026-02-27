<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingEcategories2 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_ecategories', function($table)
        {
            $table->string('show_name')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_ecategories', function($table)
        {
            $table->dropColumn('show_name');
        });
    }
}
