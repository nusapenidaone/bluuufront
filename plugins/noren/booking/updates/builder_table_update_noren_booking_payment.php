<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingPayment extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_payment', function($table)
        {
            $table->integer('method');
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_payment', function($table)
        {
            $table->dropColumn('method');
        });
    }
}
