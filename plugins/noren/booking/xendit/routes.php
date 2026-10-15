<?php

// Подключается строкой в plugins/noren/booking/routes.php: require __DIR__ . '/xendit/routes.php';
// Даже подключённый, сайт работает на старом Xendit (classes/XenditService + api/verify/xendit),
// пока контроллеры заказов/кабинета/check-in не переключены на новый сервис.

use Noren\Booking\Xendit\XenditWebhookController;
use Noren\Booking\Xendit\XenditPayController;
use Noren\Booking\Xendit\XenditTestController;

// Xendit invoice callback (новый). Старый — api/verify/xendit — продолжает работать.
Route::post('api/xendit/webhook', [XenditWebhookController::class, 'handle']);

// Оплата остатка по ссылке из Odoo, с проверкой x_studio_unique_key.
// {id} только цифры — иначе int-аргумент контроллера бросит TypeError вместо 404.
Route::get('xendit-weblink/{id}/{key}', [XenditPayController::class, 'pay'])->where('id', '[0-9]+');
Route::get('xendit-weblink/{id}/{key}/callback', [XenditPayController::class, 'callback'])->where('id', '[0-9]+');

// TEMP: ручной тест — удалить после проверки
Route::get('api/xendit/test', [XenditTestController::class, 'test']);
Route::get('api/xendit/status/{invoice_id}', [XenditTestController::class, 'status']);
