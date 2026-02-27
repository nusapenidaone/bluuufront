<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingBadge2 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_badge', function($table)
        {
            $table->string('color')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_badge', function($table)
        {
            $table->dropColumn('color');
        });
    }
}
