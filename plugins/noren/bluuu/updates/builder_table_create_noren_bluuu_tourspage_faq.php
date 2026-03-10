<?php namespace Noren\Bluuu\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBluuuTourspageFaq extends Migration
{
    public function up()
    {
        Schema::create('noren_bluuu_tourspage_faq', function($table)
        {
            $table->integer('tourspage_id');
            $table->integer('faq_id');
            $table->primary(['tourspage_id','faq_id']);
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('noren_bluuu_tourspage_faq');
    }
}
