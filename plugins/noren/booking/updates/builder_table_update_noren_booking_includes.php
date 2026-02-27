<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingIncludes extends Migration
{
    public function up()
    {
        Schema::rename('noren_booking_include', 'noren_booking_includes');
    }
    
    public function down()
    {
        Schema::rename('noren_booking_includes', 'noren_booking_include');
    }
}
