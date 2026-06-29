<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBluuuBlogFaq extends Migration
{
    public function up()
    {
        Schema::create('noren_bluuu_blog_faq', function($table)
        {
            $table->unsignedInteger('blog_id');
            $table->unsignedInteger('faq_id');
            $table->primary(['blog_id', 'faq_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('noren_bluuu_blog_faq');
    }
}
