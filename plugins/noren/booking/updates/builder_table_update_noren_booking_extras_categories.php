<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingExtrasCategories extends Migration
{
    public function up()
    {
        Schema::rename('noren_booking_extrascategories', 'noren_booking_extras_categories');
    }
    
    public function down()
    {
        Schema::rename('noren_booking_extras_categories', 'noren_booking_extrascategories');
    }
}
