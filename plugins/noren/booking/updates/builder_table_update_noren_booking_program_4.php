<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingProgram4 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_program', function($table)
        {
            $table->text('details')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_program', function($table)
        {
            $table->dropColumn('details');
        });
    }
}
