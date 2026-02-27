<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingExtras4 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_extras', function($table)
        {
            $table->boolean('recomended')->nullable();
            $table->boolean('my_request')->nullable();
            $table->text('description')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_extras', function($table)
        {
            $table->dropColumn('recomended');
            $table->dropColumn('my_request');
            $table->dropColumn('description');
        });
    }
}
