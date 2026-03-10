<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBluuuPromoslider extends Migration
{
    public function up()
    {
        Schema::create('noren_bluuu_promoslider', function($table)
        {
            $table->increments('id')->unsigned();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->string('title');
            $table->text('description');
            $table->string('link');
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_bluuu_promoslider');
    }
}
