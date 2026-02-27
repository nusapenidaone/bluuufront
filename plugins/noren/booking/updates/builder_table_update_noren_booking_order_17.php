<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingOrder17 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_order', function($table)
        {
            $table->dropColumn('email_status_id');
            $table->dropColumn('lead_id');
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_order', function($table)
        {
            $table->integer('email_status_id')->nullable();
            $table->string('lead_id', 10)->nullable();
        });
    }
}
