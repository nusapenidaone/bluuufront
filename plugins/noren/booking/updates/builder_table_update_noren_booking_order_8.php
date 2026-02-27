<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingOrder8 extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_order', function($table)
        {
            $table->integer('members')->nullable();
            $table->integer('cars')->nullable();
            $table->integer('full_total')->nullable();
            $table->integer('discount_price')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('noren_booking_order', function($table)
        {
            $table->dropColumn('members');
            $table->dropColumn('cars');
            $table->dropColumn('full_total');
            $table->dropColumn('discount_price');
        });
    }
}
