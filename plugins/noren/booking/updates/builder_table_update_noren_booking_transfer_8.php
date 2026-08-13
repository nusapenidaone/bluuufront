<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingTransfer8 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_transfer', function($table)
        {
            $table->integer('types_id')->nullable()->unsigned()->after('classes_id');
        });
    }

    public function down()
    {
        Schema::table('noren_booking_transfer', function($table)
        {
            $table->dropColumn('types_id');
        });
    }
}
