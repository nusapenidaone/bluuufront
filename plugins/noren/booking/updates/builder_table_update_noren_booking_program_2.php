<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingProgram2 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_program', function($table)
        {
            $table->string('amo_program_name')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_program', function($table)
        {
            $table->dropColumn('amo_program_name');
        });
    }
}
