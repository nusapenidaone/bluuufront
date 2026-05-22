<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingTours44 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_tours', function($table)
        {
            $table->integer('transfer_id')->nullable()->unsigned();
            $table->decimal('ota_commission', 5, 2)->default(0);
        });
    }

    public function down()
    {
        Schema::table('noren_booking_tours', function($table)
        {
            $table->dropColumn('transfer_id');
            $table->dropColumn('ota_commission');
        });
    }
}
