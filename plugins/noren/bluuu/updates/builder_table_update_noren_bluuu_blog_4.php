<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBluuuBlog4 extends Migration
{
    public function up()
    {
        Schema::table('noren_bluuu_blog', function($table)
        {
            $table->string('status', 20)->nullable()->default('draft');
            $table->string('author_name')->nullable();
            $table->string('author_title')->nullable();
            $table->text('author_bio')->nullable();
            $table->string('author_avatar')->nullable();
            $table->string('category')->nullable();
            $table->string('overline')->nullable();
            $table->date('published_at')->nullable();
            $table->string('hero_caption')->nullable();
            $table->text('content3')->nullable();
            $table->text('content4')->nullable();
            $table->text('pull_quote')->nullable();
            $table->string('meta_keywords', 500)->nullable();
            $table->string('og_image')->nullable();
            $table->text('faq')->nullable();
        });
    }

    public function down()
    {
        Schema::table('noren_bluuu_blog', function($table)
        {
            $table->dropColumn([
                'status', 'author_name', 'author_title', 'author_bio',
                'author_avatar', 'category', 'overline', 'published_at',
                'hero_caption', 'content3', 'content4', 'pull_quote',
                'meta_keywords', 'og_image', 'faq',
            ]);
        });
    }
}
