<?php

use Noren\Booking\Doku\DokuWebhookController;
use Noren\Booking\Doku\DokuPayController;
use Noren\Booking\Doku\DokuTestController;

// Doku payment notification webhook
Route::post('api/doku/webhook', [DokuWebhookController::class, 'handle']);

// Doku weblink — like odoo/weblink/{id}, but also requires x_studio_unique_key
// Constrain {id} to digits so garbage requests 404 instead of hitting the
// int-typed controller argument and throwing a TypeError with a full stack trace.
Route::get('doku-weblink/{id}/{key}', [DokuPayController::class, 'pay'])->where('id', '[0-9]+');

// Where DOKU redirects the customer's browser back after payment (auto_redirect)
Route::get('doku-weblink/{id}/{key}/callback', [DokuPayController::class, 'callback'])->where('id', '[0-9]+');

// TEMP: ручной тест создания checkout-сессии — удалить после проверки
Route::get('api/doku/test', [DokuTestController::class, 'test']);
