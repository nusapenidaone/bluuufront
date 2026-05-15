<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingTours42 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_tours', function($table)
        {
            $table->string('avail_type')->nullable()->after('odoo_type');
        });
    }

    public function down()
    {
        Schema::table('noren_booking_tours', function($table)
        {
            $table->dropColumn('avail_type');
        });
    }
}
