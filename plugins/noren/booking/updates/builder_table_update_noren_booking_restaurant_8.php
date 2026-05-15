<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingRestaurant8 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_restaurant', function($table)
        {
            $table->string('odoo_name')->nullable();
        });
    }

    public function down()
    {
        Schema::table('noren_booking_restaurant', function($table)
        {
            $table->dropColumn('odoo_name');
        });
    }
}
