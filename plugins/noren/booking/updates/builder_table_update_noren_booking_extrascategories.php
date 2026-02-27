<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingExtrascategories extends Migration
{
    public function up()
    {
        Schema::rename('noren_booking_extra_categories', 'noren_booking_extrascategories');
    }
    
    public function down()
    {
        Schema::rename('noren_booking_extrascategories', 'noren_booking_extra_categories');
    }
}
