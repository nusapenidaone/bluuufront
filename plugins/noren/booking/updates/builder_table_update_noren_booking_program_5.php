<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingProgram5 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_program', function($table)
        {
            $table->integer('amo_extras_id')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_program', function($table)
        {
            $table->dropColumn('amo_extras_id');
        });
    }
}
