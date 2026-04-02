<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingCompany extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_company', function($table)
        {
            $table->renameColumn('odoo_company_id', 'odoo_id');
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_company', function($table)
        {
            $table->renameColumn('odoo_id', 'odoo_company_id');
        });
    }
}
