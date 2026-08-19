# План: полный переход оплаты с Xendit на DOKU

> Статус: DOKU подключён и работает параллельно с Xendit, но только за флагом `?m=test` (`src/Payment.jsx`). Xendit остаётся дефолтом для всех обычных клиентов. Этот файл описывает, что нужно сделать, когда будет принято решение переключиться на DOKU полностью. Составлен 2026-08-18.

## Текущее состояние (проверено по коду)

**Уже подключено к DOKU:**
- `plugins/noren/booking/doku/DokuService.php` — создание checkout-сессии (`createPaymentLink`/`createLink`), санитизация текста под ограничения DOKU
- `plugins/noren/booking/doku/DokuWebhookController.php` — `POST /api/doku/webhook`, реальная обработка (не DRY-RUN): подтверждает заказ (`bluuu...`) или обновляет `x_studio_collected_by_doku` в Odoo (`odoo_...`)
- `plugins/noren/booking/doku/DokuPayController.php` — `GET doku-weblink/{id}/{key}`, weblink-аналог с проверкой `x_studio_unique_key`
- `plugins/noren/booking/api/PrivateOrderController.php:209` и `SharedOrderController.php:188` — ветка `method_id == 3` → DOKU (новое бронирование)
- `src/Payment.jsx` — `?m=test` в URL форсирует `method = 3`; без флага — как раньше (Xendit)
- `OdooService::registerPayment($id, $amount, $field)` — параметризован полем, `x_studio_conpmllected_by_xendit` (по умолчанию) или `x_studio_collected_by_doku`
- `noren_booking_method` — есть строка `{id: 3, name: 'DOKU'}` (миграция `updates/seed_method_doku.php`)
- `plugins/noren/booking/doku/DokuTestController.php` + роут `GET api/doku/test` — временный, только для ручных проверок

**НЕ подключено к DOKU (сознательно отложено):**
- `plugins/noren/booking/api/CheckinController.php:103-134` (`pay()`) — читает `method` из запроса, ветвится только `2`(PayPal)/иначе Xendit. DOKU-ветки нет.
- `plugins/noren/booking/api/CabinetController.php:738-772` (`createPayment()`) — вообще не читает `method`, жёстко всегда Xendit.
- `plugins/noren/booking/api/AccountController.php:286-328` (`createPayment()`) — читает `method` с фоллбэком на `$order->method_id`, но ветвится только `2`(PayPal)/иначе Xendit — **если заказ изначально оплачен через DOKU (`method_id=3`), эта доплата всё равно уйдёт в Xendit**, а не в DOKU. Известный пробел, не критично пока фича "в разработке" (см. CLAUDE.md), но нужно закрыть до отключения Xendit.
- `src/cabinet.jsx` и `src/AccountPage.jsx` — фронтенд вообще не передаёт `method` в теле `.../pay` запроса.

## Шаги полного перехода

### 1. Добавить DOKU в оставшиеся 3 контроллера доплаты

По образцу уже сделанного в Private/SharedOrderController — везде, где сейчас `if ($method === 2) { PayPal } else { Xendit }`, добавить `elseif ($method === 3) { Doku }`:

- `CheckinController.php:125`
- `AccountController.php:315` (заодно чинит пробел выше — раз `$method` уже фоллбэчится на `order->method_id`, простое добавление ветки решает проблему)
- `CabinetController.php:767` — тут ещё нужно **добавить чтение `$method`** (сейчас его нет вообще), по образцу `AccountController.php:295`: `$method = (int) $request->input('method', 1);`

Каждому нужен `use Noren\Booking\Doku\DokuService;` в шапке файла.

### 2. Решить, откуда `CabinetController`/`AccountPage` берут `method`

Сейчас `cabinet.jsx`/`AccountPage.jsx` шлют пустое тело в `.../pay` — метод не выбирается пользователем на этих страницах вообще, просто одна кнопка "Pay". Два варианта:
- **Проще**: не трогать фронтенд, ветка DOKU просто не будет достижима без явного `method` в теле запроса (кроме случая, когда `AccountController` фоллбэчится на `order->method_id` — там сработает само).
- **Полноценно**: добавить `method` в тело запроса на `cabinet.jsx`/`AccountPage.jsx` аналогично `Payment.jsx`, если нужно тестировать эти флоу через `?m=test` до общего переключения.

Рекомендация: отложить до шага 4 (полное переключение default), не усложнять раньше времени.

### 3. Тестовый прогон каждого флоу через `?m=test`-эквивалент

Прежде чем менять дефолт — прогнать вручную:
- Чекин: `POST api/new/checkin/{odoo_id}/pay` с `{"method": 3}` в теле
- Личный кабинет: `POST api/new/cabinet/{odooId}/{key}/pay` с `{"method": 3}` в теле (после шага 1 контроллер должен принимать `method` из тела)
- Аккаунт: `POST api/new/account/{key}/pay` с `{"method": 3}` в теле

Проверить, что `x_studio_collected_by_doku` в Odoo обновляется, а не `x_studio_collected_by_xendit`.

### 4. Переключить дефолт с Xendit на DOKU

- `src/Payment.jsx:96` — вместо `testDoku ? 3 : (payMethod === "paypal" ? 2 : 1)` сделать DOKU дефолтом для `payMethod === "card"`: `payMethod === "paypal" ? 2 : 3`. Флаг `?m=test` и `methodLabel` "DOKU (test)" можно убрать/упростить.
- `CheckinController.php:107` — `$request->input('method', 1)` → `$request->input('method', 3)`
- `AccountController.php:295` — `$request->input('method', $order->method_id ?? 1)` → `... ?? 3`
- `CabinetController.php` — дефолт `method` (добавленный в шаге 1) → `3`
- `doku/services.config.php` — убедиться, что `'mode' => 'production'` (а не `sandbox`) перед реальным трафиком

### 5. Период наблюдения

Погонять на реальном трафике (дефолт уже DOKU), последить логи `[Doku]` в `storage/logs`, `noren_booking_payment` (`method=3`) и Odoo-заказы (`x_studio_payment_source = DOKU`) некоторое время, прежде чем удалять Xendit — чтобы был путь отката (просто вернуть дефолт на `1` в перечисленных выше местах).

### 6. Удалить Xendit и временный тестовый код

Когда уверены, что DOKU стабилен:
- Удалить `plugins/noren/booking/classes/XenditService.php`
- Удалить `VerifyController::VerifyXendit()` и роут `POST api/verify/xendit` (`plugins/noren/booking/routes.php`)
- Убрать ветки `method_id == 1 → Xendit` из всех 5 контроллеров (Private/Shared/Account/Cabinet/Checkin), оставить только DOKU-ветку как основную (или `else`)
- Удалить `plugins/noren/booking/doku/DokuTestController.php` и роут `api/doku/test` (`plugins/noren/booking/doku/routes.php`), если ещё не удалены
- Убрать `1: Xendit` из `plugins/noren/booking/models/payment/columns.yaml` (старые записи в БД не трогать, только опцию в UI)
- **PayPal не трогать** — это отдельный, независимый провайдер, не часть этой миграции

## Verification

1. `php -l` на все изменённые PHP-файлы (php.exe в `/c/xampp/php/`)
2. На каждом шаге — полный цикл: бронирование/доплата → редирект на DOKU → оплата тестовой картой → вебхук → проверка `status_id`/`Payment.method`/`x_studio_payment_source`/`x_studio_collected_by_doku` в Odoo
3. После шага 4 (смена дефолта) — обязательно проверить, что PayPal-ветка (`method === 2`) не задета ни в одном из контроллеров
4. После шага 6 — прогнать полный цикл ещё раз без единого упоминания Xendit в логах
