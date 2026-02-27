<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingRates extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_rates', function($table)
        {
            $table->decimal('rate', 10, 8)->change();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_rates', function($table)
        {
            $table->decimal('rate', 10, 6)->change();
        });
    }
}
