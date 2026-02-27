<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingCloseddates2 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_closeddates', function($table)
        {
            $table->integer('type')->default(null)->change();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_closeddates', function($table)
        {
            $table->integer('type')->default(2)->change();
        });
    }
}
