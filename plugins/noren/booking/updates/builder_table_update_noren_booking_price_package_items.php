<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingPricePackageItems extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_price_package_items', function($table)
        {
            $table->renameColumn('price_package_id', 'price_packages_id');
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_price_package_items', function($table)
        {
            $table->renameColumn('price_packages_id', 'price_package_id');
        });
    }
}
