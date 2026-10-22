<?php

// Ключи скопированы из старого кода (classes/XenditService.php, routes/VerifyController.php).
// callback_token — "Verification token" из дашборда Xendit (Settings → Webhooks),
// приходит в заголовке X-Callback-Token каждого вебхука.
return [
    'mode' => 'production', // 'test' | 'production'

    'test' => [
        'secret_key'     => 'xnd_development_MfMTAhXjKtwnrxuRR4HvQrLu2WQwtVIcD1fvleCwGWtBWH4KG8W9jtXD1GCsx',
        'callback_token' => '1jF15MFikGHE8hCtbMrgHhAgTyfFq0n45UOXpB19C4AtaXKX',
    ],
    'production' => [
        'secret_key'     => 'xnd_production_LkmE9Ubr5KAQsNwQK29UuZz0jwHVGDTZ3Q7rtHxQOIjcxOM8DQd7jL44IL9y9Dmr', // real db
        'callback_token' => 'ALNVbGJkkmPWsiymxDm9FRlM7Y8dzK8BZDiWHbznbOHDfx99',                                   // live db
    ],

    'base_url'         => 'https://api.xendit.co',
    'invoice_duration' => 3600,            // секунд до EXPIRED
    'payment_methods'  => ['CREDIT_CARD'],
    'currency'         => 'IDR',
];
