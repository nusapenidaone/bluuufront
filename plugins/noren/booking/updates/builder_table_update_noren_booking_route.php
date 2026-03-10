<?php
namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class BuilderTableUpdateNorenBookingRoute extends Migration
{
    public function up()
    {
        Schema::table('noren_booking_route', function ($table) {
            $table->text('description')->nullable();
            $table->string('best_for')->nullable();
            $table->text('best_with')->nullable();
            $table->string('tone')->nullable();
            $table->string('badge')->nullable();
            $table->text('after_lunch')->nullable();
            $table->string('popup_title')->nullable();
            $table->text('popup_afternoon')->nullable();
            $table->text('highlights')->nullable();
            $table->text('schedule_before_lunch')->nullable();
            $table->text('schedule_after_lunch')->nullable();
            $table->text('add_on_note')->nullable();
            $table->string('slug')->nullable();
        });
    }

    public function down()
    {
        Schema::table('noren_booking_route', function ($table) {
            $table->dropColumn('description');
            $table->dropColumn('best_for');
            $table->dropColumn('best_with');
            $table->dropColumn('tone');
            $table->dropColumn('badge');
            $table->dropColumn('after_lunch');
            $table->dropColumn('popup_title');
            $table->dropColumn('popup_afternoon');
            $table->dropColumn('highlights');
            $table->dropColumn('slug');
        });
    }
}