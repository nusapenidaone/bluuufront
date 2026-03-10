<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBluuuClasspage extends Migration
{
    public function up()
    {
        Schema::table('noren_bluuu_classpage', function($table)
        {
            $table->integer('tourspage_id')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_bluuu_classpage', function($table)
        {
            $table->dropColumn('tourspage_id');
        });
    }
}
