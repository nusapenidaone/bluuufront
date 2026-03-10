<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBluuuTourspageProgramm extends Migration
{
    public function up()
    {
        Schema::create('noren_bluuu_tourspage_programm', function($table)
        {
            $table->integer('tourpage_id');
            $table->integer('programm_id');
            $table->primary(['tourpage_id','programm_id']);
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_bluuu_tourspage_programm');
    }
}
