<?php namespace Noren\Booking\Classes;

class PaymentMethod
{
    // Single source of truth for which gateway is currently the site default
    // (3 = DOKU, 1 = Xendit). Backed by payment_method.config.php so it can be
    // flipped on the server without redeploying frontend or other PHP files.
    public static function default(): int
    {
        $config = require __DIR__ . '/../payment_method.config.php';

        return (int) ($config['default'] ?? 3);
    }
}
