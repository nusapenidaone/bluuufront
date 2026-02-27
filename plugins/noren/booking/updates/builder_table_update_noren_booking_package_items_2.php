<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingPackageItems2 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_package_items', function($table)
        {
            $table->renameColumn('passengers_count', 'members_count');
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_package_items', function($table)
        {
            $table->renameColumn('members_count', 'passengers_count');
        });
    }
}
