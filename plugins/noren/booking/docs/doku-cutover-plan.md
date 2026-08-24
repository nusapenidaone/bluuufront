# DOKU — основная система оплаты, Xendit — резервная

> **Переключено (2026-08-20).** DOKU — дефолт везде, жёстко (`method: 3`), без URL-флага. Xendit остаётся в коде как экстренный резерв, но включить его с фронтенда через URL больше нельзя (флаг `?m=xendit` убран 2026-08-20 по просьбе пользователя) — только прямой вызов API с `{"method": 1}` в теле запроса (вручную, curl/Postman). PayPal полностью удалён из проекта (2026-08-20). Составлен 2026-08-18, обновлён 2026-08-20.

## Текущая архитектура

- **DOKU** — основная система оплаты, жёстко закодированный `method = 3` везде: новое бронирование, личный кабинет (и старый по `key`, и новый Odoo-based), веб-чекин.
- **Xendit** — резервная, но без удобного переключателя с фронтенда. Бэкенд по-прежнему принимает `method: 1` в теле запроса (все контроллеры не трогали), так что в экстренном случае можно вызвать `.../pay` эндпоинт напрямую с `{"method": 1}` — сайт сам туда больше не поведёт.
- Xendit-код **не удалён и не будет удаляться** — `XenditService.php`, `VerifyController::VerifyXendit()`, роут `api/verify/xendit` остаются рабочими постоянно.
- `doku/services.config.php` — `mode: production`.

## Где это реализовано

**Фронтенд (жёстко `method: 3`, без флагов):**
- `src/Payment.jsx` — новое бронирование private/shared
- `src/cabinet.jsx` — личный кабинет (Odoo-based, `/cabinet/{odooId}/{key}`)
- `src/AccountPage.jsx` — личный кабинет (легаси, по `key`)
- `themes/bluuu/pages/checkin/checkin.htm` — веб-чекин

**Бэкенд (дефолт `method = 3`, читается из тела/параметра запроса):**
- `PrivateOrderController.php` / `SharedOrderController.php` — `method_id` берётся из заказа, сохранённого при бронировании (значение пришло с фронта)
- `CabinetController.php::createPayment()` — `$request->input('method', 3)`
- `CheckinController.php::pay()` — `$request->input('method', 3)`
- `AccountController.php::createPayment()` — `$request->input('method', 3)` (раньше DOKU здесь вообще не было — добавлено при переключении)

**DOKU-инфраструктура (без изменений с момента интеграции):**
- `plugins/noren/booking/doku/DokuService.php` — создание checkout-сессии, `auto_redirect: true`, санитизация текста
- `plugins/noren/booking/doku/DokuWebhookController.php` — `POST /api/doku/webhook`, live-обработка: подтверждает заказ (`bluuu...`) или обновляет `x_studio_collected_by_doku` + `x_studio_payment_reference` в Odoo (`odoo_...`)
- `plugins/noren/booking/doku/DokuPayController.php` — `GET doku-weblink/{id}/{key}` (weblink) + `GET doku-weblink/{id}/{key}/callback` (страница "Спасибо", `odoo_pay_success.htm`)
- `OdooService::getOrderInfo()` — ищет заказ строго по `id`
- `OdooService::registerPayment($id, $amount, $field, $invoiceNumber)` — `$field` = `x_studio_collected_by_xendit` или `x_studio_collected_by_doku`; `$invoiceNumber` накопительно пишется в `x_studio_payment_reference`
- `noren_booking_method` — `{id: 3, name: 'DOKU'}`, `{id: 2, name: 'Paypal'}` (не удалять — старые записи)
- `plugins/noren/booking/doku/DokuTestController.php` + роут `GET api/doku/test` — временный, для ручных проверок

## Если Xendit понадобится вернуть дефолтом

Все изменения переключения — это буквально значение `3` (было `1`) в перечисленных выше местах на фронте. Откат — поменять `method: 3` обратно на `method: 1` (или `method_id ?? 1`) в тех же 4 фронтенд-файлах.

## Verification

1. `php -l` на все изменённые PHP-файлы (php.exe в `/c/xampp/php/`)
2. Полный цикл (дефолт DOKU): бронирование/доплата → редирект на DOKU → оплата → авто-редирект на callback → вебхук → `status_id`/`Payment.method=3`/`x_studio_payment_source=DOKU`/`x_studio_collected_by_doku`/`x_studio_payment_reference` в Odoo
