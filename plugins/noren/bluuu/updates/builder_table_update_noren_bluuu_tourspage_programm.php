<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBluuuTourspageProgramm extends Migration
{
    public function up()
    {
        Schema::table('noren_bluuu_tourspage_programm', function($table)
        {
            $table->dropPrimary(['tourpage_id','programm_id']);
            $table->renameColumn('tourpage_id', 'tourspage_id');
            $table->primary(['tourspage_id','programm_id']);
        });
    }
    
    public function down()
    {
        Schema::table('noren_bluuu_tourspage_programm', function($table)
        {
            $table->dropPrimary(['tourspage_id','programm_id']);
            $table->renameColumn('tourspage_id', 'tourpage_id');
            $table->primary(['tourpage_id','programm_id']);
        });
    }
}
