<?php namespace Noren\Booking\Classes;

class PaymentMethod
{
    // id записей в noren_booking_method; name записи уходит в Odoo как
    // x_studio_payment_source (selection — значение должно существовать в Odoo).
    const XENDIT  = 1;
    const DOKU    = 3;
    const CASHLEZ = 4;

    // Single source of truth for which gateway is currently the site default
    // (3 = DOKU, 1 = Xendit, 4 = Cashlez). Backed by payment_method.config.php so it can be
    // flipped on the server without redeploying frontend or other PHP files.
    public static function default(): int
    {
        $config = require __DIR__ . '/../payment_method.config.php';

        return (int) ($config['default'] ?? 3);
    }
}
