<?php
namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingExtras10 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_extras', function ($table) {
            $table->integer('parent_id')->nullable();
        });
    }

    public function down()
    {
        Schema::table('noren_booking_extras', function ($table) {
            $table->dropColumn('parent_id');
        });
    }
}
