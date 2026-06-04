<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingIncludes7 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_includes', function($table)
        {
            $table->text('icon_svg')->nullable();
        });
    }

    public function down()
    {
        Schema::table('noren_booking_includes', function($table)
        {
            $table->dropColumn('icon_svg');
        });
    }
}
