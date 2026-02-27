<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingClasses3 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_classes', function($table)
        {
            $table->integer('types_id')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_classes', function($table)
        {
            $table->dropColumn('types_id');
        });
    }
}
