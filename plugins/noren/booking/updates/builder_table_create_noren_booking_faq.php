<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingFaq extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_faq', function($table)
        {
            $table->integer('tours_id');
            $table->integer('faq_id');
            $table->primary(['tours_id','faq_id']);
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_faq');
    }
}
