<?php

use Noren\Booking\Api\FullController;
use Noren\Booking\Api\PrivateOrderController;
use Noren\Booking\Api\SharedOrderController;
use Noren\Booking\Api\ChatbotController;

// Tours
Route::get('api/new/tours/private', [FullController::class, 'getPrivateTours']);
Route::get('api/new/tours/shared',  [FullController::class, 'getSharedTours']);
Route::get('api/new/tour/{slug}',   [FullController::class, 'getTourDetail']);

// Availability
Route::get('api/new/availability/private/{id}', [FullController::class, 'getPrivateAvailability']);
Route::get('api/new/availability/shared/{id}',  [FullController::class, 'getSharedAvailability']);

// Orders
// TODO: restore ->middleware('web') before production (re-enables CSRF)
Route::options('api/new/order/{any}', function () {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        ->header('Access-Control-Allow-Headers', '*');
})->where('any', '.*');
Route::post('api/new/order/private', [PrivateOrderController::class, 'createOrder']);
Route::post('api/new/order/shared',  [SharedOrderController::class, 'createOrder']);

// Routes
Route::get('api/new/routes/private', [FullController::class, 'getPrivateRoutes']);
Route::get('api/new/routes/shared',  [FullController::class, 'getSharedRoutes']);
Route::get('api/new/route/{id}',     [FullController::class, 'getRouteById']);

// Extras
Route::get('api/new/extras',            [FullController::class, 'getExtras']);
Route::get('api/new/extras-categories', [FullController::class, 'getExtrasCategories']);

// Options
Route::get('api/new/transfers/private', [FullController::class, 'getPrivateTransfers']);
Route::get('api/new/transfers/shared',  [FullController::class, 'getSharedTransfers']);
Route::get('api/new/transfers',         [FullController::class, 'getTransfers']);
Route::get('api/new/covers/private', [FullController::class, 'getPrivateCovers']);
Route::get('api/new/covers/shared',  [FullController::class, 'getSharedCovers']);
Route::get('api/new/covers',         [FullController::class, 'getCovers']);
Route::get('api/new/rates',     [FullController::class, 'getRates']);

// Restaurants
Route::get('api/new/restaurants',      [FullController::class, 'getRestaurants']);
Route::get('api/new/restaurants/{id}', [FullController::class, 'getRestaurant']);

// Blog
Route::get('api/new/blog',        [FullController::class, 'getBlog']);
Route::get('api/new/blog/{slug}', [FullController::class, 'getBlogPost']);

// FAQ
Route::get('api/new/faq', [FullController::class, 'getFaq']);

// Gallery
Route::get('api/new/gallery', [FullController::class, 'getGallery']);

// Categories
Route::get('api/new/categories', [FullController::class, 'getCategories']);

// Rules and settings
Route::get('api/new/rules',    [FullController::class, 'getRules']);
Route::get('api/new/settings', [FullController::class, 'getSettings']);
Route::get('api/new/contacts', [FullController::class, 'getContacts']);

// Chatbot (API key required)
Route::get('api/chatbot/boats/private', [ChatbotController::class, 'getPrivateBoats']);
Route::get('api/chatbot/boats/shared',  [ChatbotController::class, 'getSharedBoats']);
Route::post('api/chatbot/quote',        [ChatbotController::class, 'getQuote']);

