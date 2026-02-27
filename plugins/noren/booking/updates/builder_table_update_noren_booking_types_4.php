<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingTypes4 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_types', function($table)
        {
            $table->text('description')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_types', function($table)
        {
            $table->dropColumn('description');
        });
    }
}
