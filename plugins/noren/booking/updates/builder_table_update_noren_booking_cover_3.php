<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingCover3 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_cover', function($table)
        {
            $table->integer('amo_id')->nullable();
            $table->dropColumn('amo_name');
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_cover', function($table)
        {
            $table->dropColumn('amo_id');
            $table->string('amo_name', 255)->nullable();
        });
    }
}
