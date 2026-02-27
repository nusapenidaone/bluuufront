<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingOrder extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_order', function($table)
        {
            $table->integer('tours_id')->nullable()->change();
            $table->date('travel_date')->nullable()->change();
            $table->integer('adults')->nullable()->change();
            $table->integer('kids')->nullable()->change();
            $table->integer('children')->nullable()->change();
            $table->integer('members')->nullable()->change();
            $table->integer('cars')->nullable()->change();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_order', function($table)
        {
            $table->integer('tours_id')->nullable(false)->change();
            $table->date('travel_date')->nullable(false)->change();
            $table->integer('adults')->nullable(false)->change();
            $table->integer('kids')->nullable(false)->change();
            $table->integer('children')->nullable(false)->change();
            $table->integer('members')->nullable(false)->change();
            $table->integer('cars')->nullable(false)->change();
        });
    }
}
