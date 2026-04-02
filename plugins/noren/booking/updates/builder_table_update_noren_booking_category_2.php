<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingCategory2 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_category', function($table)
        {
            $table->boolean('status')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_category', function($table)
        {
            $table->dropColumn('status');
        });
    }
}
