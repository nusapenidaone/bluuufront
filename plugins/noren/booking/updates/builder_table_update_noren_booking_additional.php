<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingAdditional extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_additional', function($table)
        {
            $table->string('title')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_additional', function($table)
        {
            $table->dropColumn('title');
        });
    }
}
