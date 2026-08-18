<?php

use Noren\Booking\Doku\DokuWebhookController;
use Noren\Booking\Doku\DokuPayController;
use Noren\Booking\Doku\DokuTestController;

// Doku payment notification webhook
Route::post('api/doku/webhook', [DokuWebhookController::class, 'handle']);

// Doku weblink — like odoo/weblink/{id}, but also requires x_studio_unique_key
Route::get('doku-weblink/{id}/{key}', [DokuPayController::class, 'pay']);

// TEMP: ручной тест создания checkout-сессии — удалить после проверки
Route::get('api/doku/test', [DokuTestController::class, 'test']);
