<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingOrder31 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_order', function($table)
        {
            $table->integer('lowseason_percent')->nullable()->default(0)->after('donation_amount');
            $table->integer('lowseason_discount')->nullable()->default(0)->after('lowseason_percent');
        });
    }

    public function down()
    {
        Schema::table('noren_booking_order', function($table)
        {
            $table->dropColumn(['lowseason_percent', 'lowseason_discount']);
        });
    }
}
