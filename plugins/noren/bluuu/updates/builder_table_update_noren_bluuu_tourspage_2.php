<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBluuuTourspage2 extends Migration
{
    public function up()
    {
        Schema::table('noren_bluuu_tourspage', function($table)
        {
            $table->string('title', 255)->nullable()->change();
            $table->text('description')->nullable()->change();
            $table->string('link', 255)->nullable()->change();
            $table->string('video', 255)->nullable()->change();
            $table->text('section1')->nullable()->change();
            $table->text('section2')->nullable()->change();
            $table->text('section3')->nullable()->change();
            $table->text('section4')->nullable()->change();
            $table->text('section5')->nullable()->change();
            $table->string('slug', 255)->nullable()->change();
        });
    }
    
    public function down()
    {
        Schema::table('noren_bluuu_tourspage', function($table)
        {
            $table->string('title', 255)->nullable(false)->change();
            $table->text('description')->nullable(false)->change();
            $table->string('link', 255)->nullable(false)->change();
            $table->string('video', 255)->nullable(false)->change();
            $table->text('section1')->nullable(false)->change();
            $table->text('section2')->nullable(false)->change();
            $table->text('section3')->nullable(false)->change();
            $table->text('section4')->nullable(false)->change();
            $table->text('section5')->nullable(false)->change();
            $table->string('slug', 255)->nullable(false)->change();
        });
    }
}
