<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBluuuClasspage4 extends Migration
{
    public function up()
    {
        Schema::table('noren_bluuu_classpage', function($table)
        {
            $table->text('details')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_bluuu_classpage', function($table)
        {
            $table->dropColumn('details');
        });
    }
}
