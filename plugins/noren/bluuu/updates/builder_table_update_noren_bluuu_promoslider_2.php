<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBluuuPromoslider2 extends Migration
{
    public function up()
    {
        Schema::table('noren_bluuu_promoslider', function($table)
        {
            $table->integer('sort_order')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_bluuu_promoslider', function($table)
        {
            $table->dropColumn('sort_order');
        });
    }
}
