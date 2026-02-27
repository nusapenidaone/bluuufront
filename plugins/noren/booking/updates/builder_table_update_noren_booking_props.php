<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingProps extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_props', function($table)
        {
            $table->integer('tours_id')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_props', function($table)
        {
            $table->dropColumn('tours_id');
        });
    }
}
