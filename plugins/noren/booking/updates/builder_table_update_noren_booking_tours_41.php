<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingTours41 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_tours', function($table)
        {
            $table->renameColumn('odoo_types', 'odoo_type');
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_tours', function($table)
        {
            $table->renameColumn('odoo_type', 'odoo_types');
        });
    }
}
