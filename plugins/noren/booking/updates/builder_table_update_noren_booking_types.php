<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingTypes extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_types', function($table)
        {
            $table->string('slug')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_types', function($table)
        {
            $table->dropColumn('slug');
        });
    }
}
