<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBluuuClasspage extends Migration
{
    public function up()
    {
        Schema::create('noren_bluuu_classpage', function($table)
        {
            $table->increments('id')->unsigned();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->integer('parent_id')->nullable();
            $table->integer('nest_left')->nullable();
            $table->integer('nest_right')->nullable();
            $table->integer('nest_depth')->nullable();
            $table->boolean('status')->nullable();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->text('props')->nullable();
            $table->integer('price')->nullable();
            $table->string('slug')->nullable();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_bluuu_classpage');
    }
}
