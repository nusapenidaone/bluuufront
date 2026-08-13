<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingOrder30 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_order', function($table)
        {
            $table->integer('donation_amount')->nullable()->default(0)->after('deposite_summ');
        });
    }

    public function down()
    {
        Schema::table('noren_booking_order', function($table)
        {
            $table->dropColumn('donation_amount');
        });
    }
}
