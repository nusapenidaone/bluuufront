<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBluuuTeam extends Migration
{
    public function up()
    {
        Schema::create('noren_bluuu_team', function($table)
        {
            $table->increments('id')->unsigned();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->string('name')->nullable();
            $table->text('languages')->nullable();
            $table->text('text')->nullable();
            $table->integer('type')->nullable();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_bluuu_team');
    }
}
