<?php

// Cashlez Link (cashUP) — реквизиты доступа.
// ВНИМАНИЕ: sandbox-окружения у Cashlez нет (в TSD v1.1 "Dev: N/A"),
// base_url всегда боевой — любой тест списывает реальные деньги.
return [
    'base_url' => 'https://api-link.cashup.id',

    // Выдаёт Cashlez. Боевой аккаунт Day Trip Bali (merchant_id 1905),
    // получен 2026-10-19 (до этого тестовый 'tyo' / ZEL20AA006AB92O1M8L68OIZV).
    'username'  => 'daytripbali',
    'password'  => '123456', // plaintext, хешируется в CashlezService::login()
    'device_id' => 'ZEL1A1444FCD30SR0VHOLX7X4',

    // Выдаёт Cashlez — для проверки подписи входящего callback.
    // api-secret = sha512(partner_code . api_key)
    //
    // ИСТОРИЯ: изначально выданный partner_code (ZEL1A0A331A3651BKXGZW0ICR1A0A331A376)
    // не совпадал с фактическим в заголовке callback'а — исправлено на
    // подтверждённое реальное значение 2026-09-28. api_key обновлён
    // повторно 2026-09-29 (первый выданный a8c5a319b5c34085b3b06a6ae4c63024
    // тоже не давал совпадения по формуле) — ещё не подтверждён реальным callback'ом.
    //
    // 2026-10-19: аккаунт Day Trip Bali шлёт partner-code
    // ZEL1A1444FCD30SR0VHOLX7X41A1444FCD4C (взят из заголовка реального callback'а;
    // у тестового 'tyo' был ZEL19A4D174255O5H2KAARF3Q19A4D175AD4).
    // 2026-10-20 Cashlez официально выдал креды Day Trip Bali: partner_code тот же,
    // api_key новый (у 'tyo' был 02d4859d824e4da9853f35bae562ec9a).
    'partner_code' => 'ZEL1A1444FCD30SR0VHOLX7X41A1444FCD4C',
    'api_key'      => '2a75cbcc652b42dd9ef9e61c59fd09ec',

    // Наш собственный секрет: закрывает временные тест-эндпоинты
    // /api/cashlez/test и /api/cashlez/status от посторонних (?t=...).
    'test_token' => 'bluuu-cashlez-test-2026',
];
