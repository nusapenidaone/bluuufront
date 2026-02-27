<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingEmailStatus extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_email_status', function($table)
        {
            $table->increments('id')->unsigned();
            $table->string('name');
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_email_status');
    }
}
