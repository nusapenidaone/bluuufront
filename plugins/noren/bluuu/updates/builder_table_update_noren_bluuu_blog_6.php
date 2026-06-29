<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBluuuBlog6 extends Migration
{
    public function up()
    {
        Schema::table('noren_bluuu_blog', function($table)
        {
            $table->longText('sections')->nullable();
        });
    }

    public function down()
    {
        Schema::table('noren_bluuu_blog', function($table)
        {
            $table->dropColumn('sections');
        });
    }
}
