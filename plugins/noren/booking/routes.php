<?php 
use Noren\Booking\Routes\OrderController;
use Noren\Booking\Routes\EditController;
use Noren\Booking\Routes\ConfirmController;
use Noren\Booking\Routes\PromoController;
use Noren\Booking\Routes\VerifyController;
use Noren\Booking\Routes\ClosedController;
use Noren\Booking\Routes\ToursController;
use Noren\Booking\Routes\ToursController1;
use Noren\Booking\Routes\RatesController;
use Noren\Booking\Routes\WebhookController;
use Noren\Booking\Routes\QrController;
use Noren\Booking\Routes\PaylinkController;
use Fruitcake\Cors\HandleCors;

use Noren\Booking\Models\Tours;
use Noren\Booking\Models\Types;
use Noren\Bluuu\Models\Tourspage;
use Noren\Bluuu\Models\Blog;

//get rates
Route::post('api/rates', [RatesController::class, 'getRates']);

//create order
Route::post('api/order/create', [OrderController::class, 'createOrder'])->middleware('web');
//update order
Route::post('api/order/update', [EditController::class, 'updateOrder'])->middleware('web');
//cancel order
Route::post('api/order/cancel', [EditController::class, 'cancelOrder'])->middleware('web');

//registration
Route::post('api/registration', [ConfirmController::class, 'setConfirm'])->middleware('web');
//payment verification
Route::post('api/verify/xendit', [VerifyController::class, 'VerifyXendit']);
Route::post('api/verify/paypal', [VerifyController::class, 'VerifyPayPal']);

//check promocode
Route::get('api/checkpromo/{id}/{code}', [PromoController::class, 'checkPromo']);


//get filtered tour list
Route::get('api/t', [ToursController::class, 'getTours']);

Route::get('api/tt', [ToursController1::class, 'getTours']);




//get tour closed dates
Route::get('api/t/closed/{id}', [ToursController::class, 'getTourClosedDates']);

//get all closed dates
Route::get('api/boats/closed', [WebhookController::class, 'getAllDates']);
// close all dates
Route::post('api/boats/close', [WebhookController::class, 'closeCalendar']);
// add closed date
Route::post('api/closeddates/create', [WebhookController::class, 'createBoatStatus']);
// remove closed date
Route::post('api/closeddates/delete/{id}', [WebhookController::class, 'deleteBoatStatus']);
//kommo webhook close or open boat
Route::post('api/kommo/webhook', [WebhookController::class, 'getData']);


//test page
Route::get('api/tours', [ClosedController::class, 'getTours']);
Route::get('api/tours/closed/{id}', [ClosedController::class, 'getTourClosedDates']);

//generate paylink
//Route::get('api/paylink/xendit', [PaylinkController::class, 'generate']);

//get qr code
Route::get('api/qr', [QrController::class, 'generate']);
//sitemap
Route::get('sitemap.xml', function () {
    return Response::view('noren.booking::sitemap', [
    	
    	'blog' => Blog::get(),
        'pages' => Tourspage::where('id', '>', 1)->get(),
        'types' => Types::where('id', '<', 4)->get(),
        'tours' => Tours::with('types')->where('types_id', '<', 4)->get(),
    ])->header('Content-Type', 'text/xml');
});
//robots
Route::get('robots.txt', function(){
    return Response::view('noren.booking::robots')->header('Content-Type','text/plain');
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
