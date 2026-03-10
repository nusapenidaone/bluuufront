<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBluuuVacancy extends Migration
{
    public function up()
    {
        Schema::create('noren_bluuu_vacancy', function($table)
        {
            $table->increments('id')->unsigned();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->string('job_title')->nullable();
            $table->text('requirements')->nullable();
            $table->text('terms')->nullable();
            $table->text('screening_questions')->nullable();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_bluuu_vacancy');
    }
}
