<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingTours3 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_tours', function($table)
        {
            $table->integer('packages_id')->nullable();
            $table->string('name', 255)->nullable()->change();
            $table->string('slug', 255)->nullable()->change();
            $table->decimal('base_price', 10, 2)->nullable()->change();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_tours', function($table)
        {
            $table->dropColumn('packages_id');
            $table->string('name', 255)->nullable(false)->change();
            $table->string('slug', 255)->nullable(false)->change();
            $table->decimal('base_price', 10, 2)->nullable(false)->change();
        });
    }
}
