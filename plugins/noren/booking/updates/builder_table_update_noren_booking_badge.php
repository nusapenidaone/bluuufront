<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingBadge extends Migration
{
    public function up()
    {
        Schema::rename('noren_booking_bedge', 'noren_booking_badge');
    }
    
    public function down()
    {
        Schema::rename('noren_booking_badge', 'noren_booking_bedge');
    }
}
