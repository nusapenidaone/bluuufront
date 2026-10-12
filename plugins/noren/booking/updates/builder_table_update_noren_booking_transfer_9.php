<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingTransfer9 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_transfer', function($table)
        {
            $table->integer('long_distance_price')->nullable()->after('price');
        });
    }

    public function down()
    {
        Schema::table('noren_booking_transfer', function($table)
        {
            $table->dropColumn('long_distance_price');
        });
    }
}
