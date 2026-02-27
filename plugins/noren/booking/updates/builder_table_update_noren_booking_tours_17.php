<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingTours17 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_tours', function($table)
        {
            $table->string('amo_tour_name')->nullable();
            $table->string('amo_boat_name')->nullable();
            $table->string('amo_odoo_name')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_tours', function($table)
        {
            $table->dropColumn('amo_tour_name');
            $table->dropColumn('amo_boat_name');
            $table->dropColumn('amo_odoo_name');
        });
    }
}
