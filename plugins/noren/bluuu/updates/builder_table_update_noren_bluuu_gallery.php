<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBluuuGallery extends Migration
{
    public function up()
    {
        Schema::table('noren_bluuu_gallery', function($table)
        {
            $table->string('slug')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_bluuu_gallery', function($table)
        {
            $table->dropColumn('slug');
        });
    }
}
