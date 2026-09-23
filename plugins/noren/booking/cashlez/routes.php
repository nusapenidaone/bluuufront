<?php

use Noren\Booking\Cashlez\CashlezWebhookController;
use Noren\Booking\Cashlez\CashlezTestController;

// Cashlez payment notification callback (DRY-RUN: только логирует)
Route::post('api/cashlez/webhook', [CashlezWebhookController::class, 'handle']);

// TEMP: ручной тест генерации ссылки и проверки статуса — удалить после проверки
Route::get('api/cashlez/test', [CashlezTestController::class, 'test']);
Route::get('api/cashlez/status/{order_id}', [CashlezTestController::class, 'status']);
