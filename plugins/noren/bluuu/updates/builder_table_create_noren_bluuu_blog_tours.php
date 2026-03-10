<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBluuuBlogTours extends Migration
{
    public function up()
    {
        Schema::create('noren_bluuu_blog_tours', function($table)
        {
            $table->integer('blog_id');
            $table->integer('tours_id');
            $table->primary(['blog_id','tours_id']);
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_bluuu_blog_tours');
    }
}
