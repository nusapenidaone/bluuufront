<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingToursTours extends Migration
{
    public function up()
    {
        Schema::rename('noren_booking_tours_similar', 'noren_booking_tours_tours');
    }
    
    public function down()
    {
        Schema::rename('noren_booking_tours_tours', 'noren_booking_tours_similar');
    }
}
