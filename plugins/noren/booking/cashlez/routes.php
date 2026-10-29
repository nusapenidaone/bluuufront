<?php

use Noren\Booking\Cashlez\CashlezWebhookController;
use Noren\Booking\Cashlez\CashlezTestController;
use Noren\Booking\Cashlez\CashlezPayController;

// Cashlez payment notification callback — реальные заказы (odoo_*) пишутся в Odoo
Route::post('api/cashlez/webhook', [CashlezWebhookController::class, 'handle']);

// Ручная оплата остатка по ссылке, которую сотрудник формирует в Odoo — см.
// CashlezPayController. {id} только цифры — иначе int-типизированный аргумент
// контроллера бросит TypeError на мусорный запрос вместо аккуратного 404.
Route::get('cashlez-weblink/{id}/{key}', [CashlezPayController::class, 'pay'])->where('id', '[0-9]+');
Route::get('cashlez-weblink/{id}/{key}/callback', [CashlezPayController::class, 'callback'])->where('id', '[0-9]+');

// Возврат клиента после оплаты на сайте/в кабинете/на чек-ине — см. CashlezService::returnUrl
Route::get('cashlez-return/{target}', [CashlezPayController::class, 'back'])->where('target', '[A-Za-z0-9_-]+');

// TEMP: ручной тест генерации ссылки и проверки статуса — удалить после проверки
Route::get('api/cashlez/test', [CashlezTestController::class, 'test']);
Route::get('api/cashlez/status/{order_id}', [CashlezTestController::class, 'status']);
