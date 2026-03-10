<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBluuuTourspage3 extends Migration
{
    public function up()
    {
        Schema::table('noren_bluuu_tourspage', function($table)
        {
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_bluuu_tourspage', function($table)
        {
            $table->dropColumn('meta_title');
            $table->dropColumn('meta_description');
        });
    }
}
