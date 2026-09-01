# DOKU — основная система оплаты, Xendit — резервная

> **Переключено (2026-08-20), быстрое переключение добавлено (2026-08-20).** DOKU — дефолт везде. Переключение между DOKU и Xendit теперь — одна строка в `plugins/noren/booking/payment_method.config.php`, без пересборки фронтенда и без правки других файлов. PayPal полностью удалён из проекта (2026-08-20). Составлен 2026-08-18, обновлён 2026-08-20.

## Быстрое переключение DOKU ↔ Xendit

Единственное место: **`plugins/noren/booking/payment_method.config.php`**
```php
return [
    'default' => 3, // 3 = DOKU, 1 = Xendit
];
```
Поменять `3` на `1` (или обратно) на сервере по FTP — действует сразу, без деплоя фронтенда и без правки контроллеров. Читает это значение `Noren\Booking\Classes\PaymentMethod::default()`, которую используют все точки создания платежа:
- `PrivateOrderController.php` / `SharedOrderController.php` — при сохранении `order->method_id`
- `CabinetController.php::createPayment()`
- `CheckinController.php::pay()`
- `AccountController.php::createPayment()`

Фронтенд (`Payment.jsx`, `cabinet.jsx`, `AccountPage.jsx`, `checkin.htm`) больше не решает, какой шлюз использовать — что бы он ни прислал в `method`, бэкенд теперь всегда берёт значение из `PaymentMethod::default()`. Значения `method`, которые фронтенд шлёт в теле запроса, — мёртвый код, оставлены как есть, не мешают.

## Текущая архитектура

- **DOKU** — основная система оплаты (`payment_method.config.php` → `default: 3`).
- **Xendit** — резервная. Чтобы вернуть его дефолтом — один флип в конфиге выше, откатывать код не нужно.
- Xendit-код **не удалён и не будет удаляться** — `XenditService.php`, `VerifyController::VerifyXendit()`, роут `api/verify/xendit` остаются рабочими постоянно.
- `doku/services.config.php` — `mode: production`.

## Где это реализовано

**`plugins/noren/booking/classes/PaymentMethod.php`** — читает `payment_method.config.php`, метод `PaymentMethod::default(): int`.

**DOKU-инфраструктура (без изменений с момента интеграции):**
- `plugins/noren/booking/doku/DokuService.php` — создание checkout-сессии, `auto_redirect: true`, санитизация текста
- `plugins/noren/booking/doku/DokuWebhookController.php` — `POST /api/doku/webhook`, live-обработка: подтверждает заказ (`bluuu...`) или обновляет `x_studio_collected_by_doku` + `x_studio_payment_reference` в Odoo (`odoo_...`)
- `plugins/noren/booking/doku/DokuPayController.php` — `GET doku-weblink/{id}/{key}` (weblink) + `GET doku-weblink/{id}/{key}/callback` (страница "Спасибо", `odoo_pay_success.htm`)
- `OdooService::getOrderInfo()` — ищет заказ строго по `id`
- `OdooService::registerPayment($id, $amount, $field, $invoiceNumber)` — `$field` = `x_studio_collected_by_xendit` или `x_studio_collected_by_doku`; `$invoiceNumber` накопительно пишется в `x_studio_payment_reference`
- `noren_booking_method` — `{id: 3, name: 'DOKU'}`, `{id: 2, name: 'Paypal'}` (не удалять — старые записи)
- `plugins/noren/booking/doku/DokuTestController.php` + роут `GET api/doku/test` — временный, для ручных проверок

## Verification

1. `php -l` на все изменённые PHP-файлы (php.exe в `/c/xampp/php/`)
2. Полный цикл с `default: 3`: бронирование/доплата → редирект на DOKU → оплата → авто-редирект на callback → вебхук → `status_id`/`Payment.method=3`/`x_studio_payment_source=DOKU`/`x_studio_collected_by_doku`/`x_studio_payment_reference` в Odoo
3. Переключить `default` на `1`, повторить цикл — должен полностью уйти в Xendit
