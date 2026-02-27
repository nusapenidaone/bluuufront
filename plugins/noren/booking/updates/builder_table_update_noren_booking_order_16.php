<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingOrder16 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_order', function($table)
        {
            $table->string('lead_id', 10)->nullable()->unsigned(false)->default(null)->comment(null)->change();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_order', function($table)
        {
            $table->integer('lead_id')->nullable()->unsigned(false)->default(null)->comment(null)->change();
        });
    }
}
