<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBluuuReviews extends Migration
{
    public function up()
    {
        Schema::table('noren_bluuu_reviews', function($table)
        {
            $table->renameColumn('source_id', 'source');
        });
    }
    
    public function down()
    {
        Schema::table('noren_bluuu_reviews', function($table)
        {
            $table->renameColumn('source', 'source_id');
        });
    }
}
