<?php
use Noren\Booking\Routes\VerifyController;
use Noren\Booking\Routes\RatesController;

require __DIR__ . '/redirects.php';

// get rates
Route::post('api/rates', [RatesController::class, 'getRates']);

// payment verification (called by Xendit servers)
Route::post('api/verify/xendit', [VerifyController::class, 'VerifyXendit']);


require __DIR__ . '/api/routes.php';
require __DIR__ . '/chatbot/routes.php';
require __DIR__ . '/viator/routes.php';
require __DIR__ . '/ota/routes.php';
require __DIR__ . '/odoo/routes.php';
require __DIR__ . '/doku/routes.php';
require __DIR__ . '/admin/routes.php';

require __DIR__ . '/calendar/routes.php';
