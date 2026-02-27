<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingProgram6 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_program', function($table)
        {
            $table->dropColumn('details');
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_program', function($table)
        {
            $table->text('details')->nullable();
        });
    }
}
