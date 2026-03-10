<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBluuuVacancy extends Migration
{
    public function up()
    {
        Schema::table('noren_bluuu_vacancy', function($table)
        {
            $table->renameColumn('screening_questions', 'questions');
        });
    }
    
    public function down()
    {
        Schema::table('noren_bluuu_vacancy', function($table)
        {
            $table->renameColumn('questions', 'screening_questions');
        });
    }
}
