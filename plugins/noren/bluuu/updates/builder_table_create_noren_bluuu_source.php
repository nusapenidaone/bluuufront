<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBluuuSource extends Migration
{
    public function up()
    {
        Schema::create('noren_bluuu_source', function($table)
        {
            $table->increments('id')->unsigned();
            $table->string('name')->nullable();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_bluuu_source');
    }
}
