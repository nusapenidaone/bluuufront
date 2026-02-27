<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingLead extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_lead', function($table)
        {
            $table->dropColumn('lead_id');
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_lead', function($table)
        {
            $table->integer('lead_id')->nullable();
        });
    }
}
