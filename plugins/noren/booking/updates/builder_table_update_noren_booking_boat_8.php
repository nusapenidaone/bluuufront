<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingBoat8 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_boat', function($table)
        {
            $table->integer('odoo_id')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_boat', function($table)
        {
            $table->dropColumn('odoo_id');
        });
    }
}
