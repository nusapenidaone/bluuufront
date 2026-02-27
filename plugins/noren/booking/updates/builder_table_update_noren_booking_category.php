<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingCategory extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_category', function($table)
        {
            $table->string('slug')->nullable();
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->text('description')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_category', function($table)
        {
            $table->dropColumn('slug');
            $table->dropColumn('seo_title');
            $table->dropColumn('seo_description');
            $table->dropColumn('description');
        });
    }
}
