<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBluuuTourspagePromoslider extends Migration
{
    public function up()
    {
        Schema::create('noren_bluuu_tourspage_promoslider', function($table)
        {
            $table->integer('tourspage_id');
            $table->integer('promoslider_id');
            $table->primary(['tourspage_id','promoslider_id']);
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_bluuu_tourspage_promoslider');
    }
}
