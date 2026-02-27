<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingToursReviews extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_tours_reviews', function($table)
        {
            $table->integer('tours_id');
            $table->integer('reviews_id');
            $table->primary(['tours_id','reviews_id']);
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_booking_tours_reviews');
    }
}
