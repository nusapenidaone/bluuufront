<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingTours40 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_tours', function($table)
        {
            $table->string('odoo_types')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_tours', function($table)
        {
            $table->dropColumn('odoo_types');
        });
    }
}
