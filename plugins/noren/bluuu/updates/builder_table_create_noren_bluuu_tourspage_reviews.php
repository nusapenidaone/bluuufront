<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBluuuTourspageReviews extends Migration
{
    public function up()
    {
        Schema::create('noren_bluuu_tourspage_reviews', function($table)
        {
            $table->integer('tourspage_id');
            $table->integer('reviews_id');
            $table->primary(['tourspage_id','reviews_id']);
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_bluuu_tourspage_reviews');
    }
}
