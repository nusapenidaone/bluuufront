<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingOrder6 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_order', function($table)
        {
            $table->integer('deposite_summ')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_order', function($table)
        {
            $table->dropColumn('deposite_summ');
        });
    }
}
