<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBluuuPromoslider extends Migration
{
    public function up()
    {
        Schema::table('noren_bluuu_promoslider', function($table)
        {
            $table->string('button_text');
        });
    }
    
    public function down()
    {
        Schema::table('noren_bluuu_promoslider', function($table)
        {
            $table->dropColumn('button_text');
        });
    }
}
