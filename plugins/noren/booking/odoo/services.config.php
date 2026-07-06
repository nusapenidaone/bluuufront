<?php

return [
    'url'         => 'https://pt-day-trip-bali.odoo.com',
    'db'          => 'pt-day-trip-bali',
    'api_key'     => '30f271163aac8949eeeabdd8b1810fd1928a8304',
    'admin_token'     => 'adm_bluuu_a3f9c2e1d8b74056af2c93e5',  // Bearer token for /api/admin/* and /api/new/calendar/* routes
    'cron_key'        => 'e4f3b1a9c2d8e7f6a1b2c3d4e5f67890',  // key for cron /api/boats/close
    'restaurant_token_secret' => 'rst_bluuu_7c1f9a2e5b3d8046c9f21ae7',  // HMAC secret for signing /manage/restaurant login tokens
    'admin_passwords' => [
        'manage'  => 'Bluuu2026!',
        'guides'  => 'Guides2026!',
        'drivers' => 'Drivers2026!',
        'vendors' => 'Vendors2026!',
    ],
    // Per-manager passwords for the /manage page (Login with name + password)
    'managers' => [
        'Weda'         => 'EP^OZr*ZIYMIFgnJ',
        'Ryan'         => 'e@ubs7#qVvvxrexi',
        'Widya'        => 'rQFHTCca4IaYvsj4',
        'Chida'        => '260ylBSL2aCMYn8p',
        'Jelin'        => 'F!tZncySFz8wE%^O',
        'Finance Team' => '&xcAriQ*mR%utlDC',
        'MODs'         => 'PsbYy9W!xD9Los83',
        'Management'   => 'beapkgspX%BXiF**',
        'Guides'       => 'f*ro2ft@QsZwUSZ2',
        'Porters'      => 'RLTVwlFiL!6nhXn2',
    ],
    // Per-restaurant passwords for /manage/restaurant (same structure as 'managers'
    // above — display name is the key). 'keywords' matched case-insensitively
    // (substring) against the Odoo x_studio_lunch value to scope that account's
    // bookings. 'keywords' => null means "Management" — sees every restaurant.
    'restaurant_logins' => [
        'La Rossa Restaurant'  => ['password' => 'LaRossa#2026Bx',   'keywords' => ['la rossa']],
        'Orca Beach Club'      => ['password' => 'OrcaBeach#2026Qz', 'keywords' => ['orca']],
        'Amarta Restaurant'    => ['password' => 'Amarta#2026Vn',    'keywords' => ['amarta']],
        'La Bianca Restaurant' => ['password' => 'LaBianca#2026Kt',  'keywords' => ['la bianca']],
        'Management'           => ['password' => 'RestoMgmt#2026Fp', 'keywords' => null],
    ],
];

