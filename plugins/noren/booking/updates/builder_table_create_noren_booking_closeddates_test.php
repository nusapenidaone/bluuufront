<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingCloseddatesTest extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_closeddates_test', function($table)
        {
            $table->increments('id')->unsigned();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->timestamp('deleted_at')->nullable();
            $table->date('date')->nullable();
            $table->integer('boat_id')->nullable();
            $table->integer('lead_id')->nullable();
            $table->integer('qtty')->nullable();
            $table->integer('type')->nullable();
            $table->integer('odoo_id')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('noren_booking_closeddates_test');
    }
}
