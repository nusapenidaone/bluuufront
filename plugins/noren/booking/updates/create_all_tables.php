<?php namespace Noren\Booking\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class CreateAllTables extends Migration
{
    public function up()
    {
        // Tours
        Schema::create('noren_booking_tours', function ($table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->unsignedBigInteger('type_id')->nullable();
            $table->unsignedBigInteger('class_id')->nullable();
            $table->decimal('base_price', 10, 2)->default(0);
            $table->timestamps();
        });

        // Tour types
        Schema::create('noren_booking_types', function ($table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        // Tour classes
        Schema::create('noren_booking_classes', function ($table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        // Price packages
        Schema::create('noren_booking_price_packages', function ($table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        // Price package items
        Schema::create('noren_booking_price_package_items', function ($table) {
            $table->id();
            $table->unsignedBigInteger('price_package_id');
            $table->integer('passengers_count');
            $table->decimal('price', 10, 2);
            $table->timestamps();
        });

        // Tour price by date (выбор пакета по дате)
        Schema::create('noren_booking_tour_price_by_dates', function ($table) {
            $table->id();
            $table->unsignedBigInteger('tour_id');
            $table->unsignedBigInteger('price_package_id');
            $table->date('date_start');
            $table->date('date_end');
            $table->timestamps();
        });

        // Itineraries
        Schema::create('noren_booking_itineraries', function ($table) {
            $table->id();
            $table->unsignedBigInteger('tour_id');
            $table->string('name');
            $table->decimal('price', 10, 2)->default(0);
            $table->boolean('included')->default(false);
            $table->timestamps();
        });

        // Transfer options
        Schema::create('noren_booking_transfer_options', function ($table) {
            $table->id();
            $table->unsignedBigInteger('tour_id');
            $table->enum('type', ['no_transfer', 'pickup', 'pickup_dropoff']);
            $table->decimal('price', 10, 2)->default(0);
            $table->timestamps();
        });

        // Cancel for any reason
        Schema::create('noren_booking_cancel_options', function ($table) {
            $table->id();
            $table->unsignedBigInteger('tour_id');
            $table->decimal('price_per_person', 10, 2)->default(0);
            $table->timestamps();
        });

        // Extra categories
        Schema::create('noren_booking_extra_categories', function ($table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        // Extras
        Schema::create('noren_booking_extras', function ($table) {
            $table->id();
            $table->unsignedBigInteger('tour_id');
            $table->unsignedBigInteger('category_id');
            $table->string('name');
            $table->decimal('price', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('noren_booking_extras');
        Schema::dropIfExists('noren_booking_extra_categories');
        Schema::dropIfExists('noren_booking_cancel_options');
        Schema::dropIfExists('noren_booking_transfer_options');
        Schema::dropIfExists('noren_booking_itineraries');
        Schema::dropIfExists('noren_booking_tour_price_by_dates');
        Schema::dropIfExists('noren_booking_price_package_items');
        Schema::dropIfExists('noren_booking_price_packages');
        Schema::dropIfExists('noren_booking_classes');
        Schema::dropIfExists('noren_booking_types');
        Schema::dropIfExists('noren_booking_tours');
    }
}