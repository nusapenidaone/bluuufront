<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingPackages2 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_packages', function($table)
        {
            $table->text('pricelist')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_packages', function($table)
        {
            $table->dropColumn('pricelist');
        });
    }
}
