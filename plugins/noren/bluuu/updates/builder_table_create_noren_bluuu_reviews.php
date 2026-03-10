<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBluuuReviews extends Migration
{
    public function up()
    {
        Schema::create('noren_bluuu_reviews', function($table)
        {
            $table->increments('id')->unsigned();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->string('name')->nullable();
            $table->date('date')->nullable();
            $table->integer('source_id')->nullable();
            $table->integer('rating')->nullable();
            $table->text('text')->nullable();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_bluuu_reviews');
    }
}
