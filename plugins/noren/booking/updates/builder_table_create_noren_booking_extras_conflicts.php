<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableCreateNorenBookingExtrasConflicts extends Migration
{
    public function up()
    {
        Schema::create('noren_booking_extras_conflicts', function($table)
        {
            $table->integer('extras_id');
            $table->integer('conflict_extras_id');
            $table->primary(['extras_id','conflict_extras_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('noren_booking_extras_conflicts');
    }
}
