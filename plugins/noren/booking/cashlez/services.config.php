<?php

// Cashlez Link (cashUP) — реквизиты доступа.
// ВНИМАНИЕ: sandbox-окружения у Cashlez нет (в TSD v1.1 "Dev: N/A"),
// base_url всегда боевой — любой тест списывает реальные деньги.
return [
    'base_url' => 'https://api-link.cashup.id',

    // Выдаёт Cashlez. Тестовые креды (получены 2026-09-23).
    'username'  => 'tyo',
    'password'  => '123456', // plaintext, хешируется в CashlezService::login()
    'device_id' => 'ZEL20AA006AB92O1M8L68OIZV',

    // Выдаёт Cashlez — для проверки подписи входящего callback.
    // api-secret = sha512(partner_code . api_key)
    //
    // ИСТОРИЯ: изначально выданный partner_code (ZEL1A0A331A3651BKXGZW0ICR1A0A331A376)
    // не совпадал с фактическим в заголовке callback'а — исправлено на
    // подтверждённое реальное значение 2026-09-28. api_key обновлён
    // повторно 2026-09-29 (первый выданный a8c5a319b5c34085b3b06a6ae4c63024
    // тоже не давал совпадения по формуле) — ещё не подтверждён реальным callback'ом.
    'partner_code' => 'ZEL19A4D174255O5H2KAARF3Q19A4D175AD4',
    'api_key'      => '02d4859d824e4da9853f35bae562ec9a',

    // Наш собственный секрет: закрывает временные тест-эндпоинты
    // /api/cashlez/test и /api/cashlez/status от посторонних (?t=...).
    'test_token' => 'bluuu-cashlez-test-2026',
];
