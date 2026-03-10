<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBluuuTourspage extends Migration
{
    public function up()
    {
        Schema::create('noren_bluuu_tourspage', function($table)
        {
            $table->increments('id')->unsigned();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->string('title');
            $table->text('description');
            $table->string('link');
            $table->string('video');
            $table->text('section1');
            $table->text('section2');
            $table->text('section3');
            $table->text('section4');
            $table->text('section5');
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_bluuu_tourspage');
    }
}
