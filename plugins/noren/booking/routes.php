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


require __DIR__ . '/api/routes.php';
require __DIR__ . '/chatbot/routes.php';
require __DIR__ . '/viator/routes.php';
require __DIR__ . '/odoo/routes.php';
