<?php
// OLD ROUTES — not used by the new site (bluuu.tours React frontend).
// Kept here for reference. These were part of the legacy OctoberCMS-rendered site.

use Noren\Booking\Routes\OrderController;
use Noren\Booking\Routes\EditController;
use Noren\Booking\Routes\ConfirmController;
use Noren\Booking\Routes\PromoController;
use Noren\Booking\Routes\ClosedController;
use Noren\Booking\Routes\ToursController;
use Noren\Booking\Routes\ToursController1;
use Noren\Booking\Routes\RatesController;
use Noren\Booking\Routes\QrController;
use Noren\Booking\Routes\PaylinkController;
use Fruitcake\Cors\HandleCors;


// create order (replaced by api/new/order/private and api/new/order/shared)
Route::post('api/order/create', [OrderController::class, 'createOrder'])->middleware('web');
// update order
Route::post('api/order/update', [EditController::class, 'updateOrder'])->middleware('web');
// cancel order
Route::post('api/order/cancel', [EditController::class, 'cancelOrder'])->middleware('web');

// registration / confirmation (old flow)
Route::post('api/registration', [ConfirmController::class, 'setConfirm'])->middleware('web');

// check promocode
Route::get('api/checkpromo/{id}/{code}', [PromoController::class, 'checkPromo']);

// get filtered tour list (old)
Route::get('api/t', [ToursController::class, 'getTours']);
Route::get('api/tt', [ToursController1::class, 'getTours']);

// get tour closed dates (old)
Route::get('api/t/closed/{id}', [ToursController::class, 'getTourClosedDates']);

// test / legacy tour pages
Route::get('api/tours', [ClosedController::class, 'getTours']);
Route::get('api/tours/closed/{id}', [ClosedController::class, 'getTourClosedDates']);

// generate paylink (was commented out)
// Route::get('api/paylink/xendit', [PaylinkController::class, 'generate']);

// get qr code
Route::get('api/qr', [QrController::class, 'generate']);

// boat availability / calendar management (was used by manage.nusapenida.one)
Route::get('api/boats/closed',             [WebhookController::class, 'getAllDates']);
Route::post('api/closeddates/create',      [WebhookController::class, 'createBoatStatus']);
Route::post('api/closeddates/delete/{id}', [WebhookController::class, 'deleteBoatStatus']);

// cron: closes all boats for tomorrow (runs daily at 21:30 Bali time)
Route::post('api/boats/close', [WebhookController::class, 'closeCalendar']);

// Kommo CRM webhook (source_id = 2 orders)
Route::post('api/kommo/webhook', [WebhookController::class, 'getData']);
