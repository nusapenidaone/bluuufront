<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBluuuBlog5 extends Migration
{
    public function up()
    {
        Schema::table('noren_bluuu_blog', function($table)
        {
            $table->unsignedInteger('author_id')->nullable();
            $table->text('content_blocks')->nullable();

            $table->foreign('author_id')
                  ->references('id')
                  ->on('noren_bluuu_authors')
                  ->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('noren_bluuu_blog', function($table)
        {
            $table->dropForeign(['author_id']);
            $table->dropColumn(['author_id', 'content_blocks']);
        });
    }
}
