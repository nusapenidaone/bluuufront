<?php

use Noren\Booking\Odoo\OdooPayController;
use Noren\Booking\Odoo\OdooWebhookController;

// Odoo payment link
Route::get('weblink/{id}', [OdooPayController::class, 'pay']);

// Odoo webhook (create/update/delete sale.order)
Route::post('api/odoo/webhook', [OdooWebhookController::class, 'handle']);
