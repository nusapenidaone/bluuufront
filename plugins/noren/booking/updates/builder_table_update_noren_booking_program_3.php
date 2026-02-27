<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingProgram3 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_program', function($table)
        {
            $table->renameColumn('amo_program_name', 'amo_name');
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_program', function($table)
        {
            $table->renameColumn('amo_name', 'amo_program_name');
        });
    }
}
