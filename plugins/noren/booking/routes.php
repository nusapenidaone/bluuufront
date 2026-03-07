<?php

use Fruitcake\Cors\HandleCors;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;
use Noren\Bluuu\Models\Blog;
use Noren\Bluuu\Models\Tourspage;
use Noren\Booking\Models\Tours;
use Noren\Booking\Models\Types;
use Noren\Booking\Routes\ClosedController;
use Noren\Booking\Routes\ConfirmController;
use Noren\Booking\Routes\EditController;

use Noren\Booking\Routes\OrderController;
use Noren\Booking\Routes\PaylinkController;

use Noren\Booking\Routes\PromoController;
use Noren\Booking\Routes\QrController;
use Noren\Booking\Routes\RatesController;

use Noren\Booking\Routes\ToursController;
use Noren\Booking\Routes\ToursController1;
use Noren\Booking\Routes\VerifyController;
use Noren\Booking\Routes\WebhookController;

// Legacy API: rates
Route::post('api/rates', [RatesController::class, 'getRates']);

// Legacy API: order
Route::post('api/order/create', [OrderController::class, 'createOrder'])->middleware('web');
Route::post('api/order/update', [EditController::class, 'updateOrder'])->middleware('web');
Route::post('api/order/cancel', [EditController::class, 'cancelOrder'])->middleware('web');

// Legacy API: registration and payment verification
Route::post('api/registration', [ConfirmController::class, 'setConfirm'])->middleware('web');
Route::post('api/verify/xendit', [VerifyController::class, 'VerifyXendit']);
Route::post('api/verify/paypal', [VerifyController::class, 'VerifyPayPal']);

// Legacy API: promo and tours
Route::get('api/checkpromo/{id}/{code}', [PromoController::class, 'checkPromo']);
Route::get('api/t', [ToursController::class, 'getTours']);
Route::get('api/tt', [ToursController1::class, 'getTours']);
Route::get('api/t/closed/{id}', [ToursController::class, 'getTourClosedDates']);

// Legacy API: closed dates and webhooks
Route::get('api/boats/closed', [WebhookController::class, 'getAllDates']);
Route::post('api/boats/close', [WebhookController::class, 'closeCalendar']);
Route::post('api/closeddates/create', [WebhookController::class, 'createBoatStatus']);
Route::post('api/closeddates/delete/{id}', [WebhookController::class, 'deleteBoatStatus']);
Route::post('api/kommo/webhook', [WebhookController::class, 'getData']);

// Legacy test routes
Route::get('api/tours', [ClosedController::class, 'getTours']);
Route::get('api/tours/closed/{id}', [ClosedController::class, 'getTourClosedDates']);

// Legacy paylink route (kept disabled)
// Route::get('api/paylink/xendit', [PaylinkController::class, 'generate']);

// Utility routes
Route::get('api/qr', [QrController::class, 'generate']);
Route::get('sitemap.xml', function () {
    return Response::view('noren.booking::sitemap', [
        'blog' => Blog::get(),
        'pages' => Tourspage::where('id', '>', 1)->get(),
        'types' => Types::where('id', '<', 4)->get(),
        'tours' => Tours::with('types')->where('types_id', '<', 4)->get(),
    ])->header('Content-Type', 'text/xml');
});
Route::get('robots.txt', function () {
    return Response::view('noren.booking::robots')->header('Content-Type', 'text/plain');
});


use Noren\Booking\Routes\FullController;
use Noren\Booking\Routes\PrivateOrderController;
use Noren\Booking\Routes\SharedOrderController;
// New API: tours
Route::get('api/new/tours/private', [FullController::class, 'getPrivateTours']);
Route::get('api/new/tours/shared', [FullController::class, 'getSharedTours']);
Route::get('api/new/tour/{slug}', [FullController::class, 'getTourDetail']);

// New API: availability
Route::get('api/new/availability/private/{id}', [FullController::class, 'getPrivateAvailability']);
Route::get('api/new/availability/shared/{id}', [FullController::class, 'getSharedAvailability']);

// New API: orders
// TODO: restore ->middleware('web') before production (re-enables CSRF)
Route::options('api/new/order/{any}', function () {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        ->header('Access-Control-Allow-Headers', '*');
})->where('any', '.*');
Route::post('api/new/order/private', [PrivateOrderController::class, 'createOrder']);
Route::post('api/new/order/shared', [SharedOrderController::class, 'createOrder']);

// New API: routes
Route::get('api/new/routes/private', [FullController::class, 'getPrivateRoutes']);
Route::get('api/new/routes/shared', [FullController::class, 'getSharedRoutes']);
Route::get('api/new/route/{id}', [FullController::class, 'getRouteById']);

// New API: extras
Route::get('api/new/extras', [FullController::class, 'getExtras']);
Route::get('api/new/extras-categories', [FullController::class, 'getExtrasCategories']);

// New API: options
Route::get('api/new/transfers', [FullController::class, 'getTransfers']);
Route::get('api/new/covers', [FullController::class, 'getCovers']);
Route::get('api/new/rates', [FullController::class, 'getRates']);

// New API: restaurants
Route::get('api/new/restaurants', [FullController::class, 'getRestaurants']);
Route::get('api/new/restaurants/{id}', [FullController::class, 'getRestaurant']);

// New API: blog
Route::get('api/new/blog', [FullController::class, 'getBlog']);
Route::get('api/new/blog/{slug}', [FullController::class, 'getBlogPost']);

// New API: FAQ
Route::get('api/new/faq', [FullController::class, 'getFaq']);

// New API: gallery
Route::get('api/new/gallery', [FullController::class, 'getGallery']);

// New API: rules and settings
Route::get('api/new/rules', [FullController::class, 'getRules']);
Route::get('api/new/settings', [FullController::class, 'getSettings']);
Route::get('api/new/contacts', [FullController::class, 'getContacts']);
