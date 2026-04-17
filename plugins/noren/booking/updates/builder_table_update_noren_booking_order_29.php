<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingOrder29 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_order', function($table)
        {
            $table->text('utm')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('noren_booking_order', function($table)
        {
            $table->string('utm')->nullable()->change();
        });
    }
}
