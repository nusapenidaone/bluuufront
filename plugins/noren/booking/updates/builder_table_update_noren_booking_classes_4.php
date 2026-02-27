<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingClasses4 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_classes', function($table)
        {
            $table->dropColumn('seo_title');
            $table->dropColumn('seo_description');
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_classes', function($table)
        {
            $table->string('seo_title', 255)->nullable();
            $table->text('seo_description')->nullable();
        });
    }
}
