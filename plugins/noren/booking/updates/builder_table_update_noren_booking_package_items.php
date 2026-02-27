<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingPackageItems extends Migration
{
    public function up()
    {
        Schema::rename('noren_booking_price_package_items', 'noren_booking_package_items');
        Schema::table('noren_booking_package_items', function($table)
        {
            $table->renameColumn('price_packages_id', 'packages_id');
        });
    }
    
    public function down()
    {
        Schema::rename('noren_booking_package_items', 'noren_booking_price_package_items');
        Schema::table('noren_booking_price_package_items', function($table)
        {
            $table->renameColumn('packages_id', 'price_packages_id');
        });
    }
}
