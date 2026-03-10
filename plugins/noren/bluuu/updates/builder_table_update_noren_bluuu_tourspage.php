<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBluuuTourspage extends Migration
{
    public function up()
    {
        Schema::table('noren_bluuu_tourspage', function($table)
        {
            $table->string('slug');
        });
    }
    
    public function down()
    {
        Schema::table('noren_bluuu_tourspage', function($table)
        {
            $table->dropColumn('slug');
        });
    }
}
