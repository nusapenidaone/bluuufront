<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingPackages extends Migration
{
    public function up()
    {
        Schema::rename('noren_booking_price_packages', 'noren_booking_packages');
    }
    
    public function down()
    {
        Schema::rename('noren_booking_packages', 'noren_booking_price_packages');
    }
}
