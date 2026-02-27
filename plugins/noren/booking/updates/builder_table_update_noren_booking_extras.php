<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingExtras extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_extras', function($table)
        {
            $table->text('text')->nullable();
            $table->dropColumn('tour_id');
            $table->dropColumn('category_id');
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_extras', function($table)
        {
            $table->dropColumn('text');
            $table->bigInteger('tour_id')->unsigned();
            $table->bigInteger('category_id')->unsigned();
        });
    }
}
