<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBluuuFaq extends Migration
{
    public function up()
    {
        Schema::create('noren_bluuu_faq', function($table)
        {
            $table->increments('id')->unsigned();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->string('question')->nullable();
            $table->text('answer')->nullable();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_bluuu_faq');
    }
}
