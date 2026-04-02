<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingTransfer5 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_transfer', function($table)
        {
            $table->integer('odoo_id')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_transfer', function($table)
        {
            $table->dropColumn('odoo_id');
        });
    }
}
