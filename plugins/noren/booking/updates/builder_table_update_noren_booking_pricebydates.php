<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingPricebydates extends Migration
{
    public function up()
    {
        Schema::rename('noren_booking_tour_price_by_dates', 'noren_booking_pricebydates');
        Schema::table('noren_booking_pricebydates', function($table)
        {
            $table->bigInteger('tours_id')->unsigned();
            $table->bigInteger('packages_id')->unsigned();
            $table->dropColumn('tour_id');
            $table->dropColumn('price_package_id');
        });
    }
    
    public function down()
    {
        Schema::rename('noren_booking_pricebydates', 'noren_booking_tour_price_by_dates');
        Schema::table('noren_booking_tour_price_by_dates', function($table)
        {
            $table->dropColumn('tours_id');
            $table->dropColumn('packages_id');
            $table->bigInteger('tour_id')->unsigned();
            $table->bigInteger('price_package_id')->unsigned();
        });
    }
}
