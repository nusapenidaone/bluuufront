<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingTypes3 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_types', function($table)
        {
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_types', function($table)
        {
            $table->dropColumn('seo_title');
            $table->dropColumn('seo_description');
        });
    }
}
