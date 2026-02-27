<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingRourFaq extends Migration
{
    public function up()
    {
        Schema::rename('noren_booking_faq', 'noren_booking_rour_faq');
    }
    
    public function down()
    {
        Schema::rename('noren_booking_rour_faq', 'noren_booking_faq');
    }
}
