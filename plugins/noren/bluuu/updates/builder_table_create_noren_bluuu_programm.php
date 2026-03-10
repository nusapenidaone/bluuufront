<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBluuuProgramm extends Migration
{
    public function up()
    {
        Schema::create('noren_bluuu_programm', function($table)
        {
            $table->increments('id')->unsigned();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->text('list')->nullable();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_bluuu_programm');
    }
}
