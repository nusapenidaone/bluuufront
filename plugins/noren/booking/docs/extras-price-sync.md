# Odoo → сайт: синхронизация цены Extras

При изменении цены продукта (Extras) в Odoo сайт должен автоматически обновить
`price` у соответствующей записи `Extras` в локальной БД (по `odoo_id`).

## Backend

- Роут: `POST /api/odoo/webhook/product-price` →
  `OdooWebhookController::handleProductPrice` ([OdooWebhookController.php](../odoo/OdooWebhookController.php))
- Ищет `Extras` по `odoo_id`, обновляет `price`, сохраняет через `saveQuietly()`
  (без триггера хуков)
- Защита: query-параметр `?key=...`, сверяется с `services.config.php` →
  `odoo_webhook_key` (тот же паттерн, что у `cron_key` в `CalendarController::closeTomorrow`).
  Без ключа или с неверным — `401 Unauthorized`.

### Формат запроса

Поддерживаются три формата тела запроса:

**Один продукт:**
```json
{ "id": 123, "price": 250000 }
```

**Батч (под ключом `records`):**
```json
{ "records": [{ "id": 123, "price": 250000 }, { "id": 124, "price": 90000 }] }
```

**Голый список:**
```json
[{ "id": 123, "price": 250000 }, { "id": 124, "price": 90000 }]
```

Ключ ID продукта пробуется по приоритету — см. раздел "Важно: какой ID отправлять" ниже.
Ключ цены — любой из `price` / `lst_price` / `list_price` / `price_extra`.

Формат совпадает с тем, что Odoo сам генерирует во встроенном действии
**Send Webhook Notification** (см. ниже) — специальный парсинг под него не нужен,
лишние ключи в payload (`_action`, `_id`, `_model`) просто игнорируются.

### Ответ

```json
{
  "ok": true,
  "updated": [{ "odoo_id": 601, "extra_id": 45, "price": 250000 }],
  "skipped": [{ "candidates": [237, 201], "reason": "extra not found" }]
}
```

- Если ни один ID-кандидат не совпал ни с одной `Extras.odoo_id` — запись попадает
  в `skipped`, остальные элементы батча всё равно обрабатываются
- Пропущенные элементы логируются (`Log::warning`), успешные — тоже (`Log::info`),
  весь сырой payload от Odoo пишется в лог отдельно ещё до обработки
  (`OdooWebhookController::handleProductPrice`)

### Важно: какой ID отправлять

Extras в Odoo смоделированы как **значения атрибута** — модель
`product.template.attribute.value`, а не отдельный товар. Цена хранится в поле
`price_extra`. Проблема в том, что `id` такой записи (например `428`) — это ID
самой записи-атрибута, а не товара, и он **не совпадает** ни с ID `product.template`,
ни с ID варианта `product.product` (который использует `Extras.odoo_id`, см.
`OdooService::buildOrderLines` — там `product_id` в строке заказа берётся
напрямую из `extra->odoo_id`).

Пример реального payload от Odoo (после добавления доп. полей в Fields действия):
```json
{
  "_action": "Send Webhook Notification(#1640)",
  "_id": 428,
  "_model": "product.template.attribute.value",
  "id": 428,
  "price_extra": 0.0,
  "product_attribute_value_id": 355,
  "product_tmpl_id": 201,
  "ptav_product_variant_ids": [601]
}
```

Бэкенд (`extractCandidateOdooIds`) пробует найти `Extras` по нескольким ID-кандидатам
**в порядке приоритета**, использует первое совпадение:

1. `ptav_product_variant_ids` — ID варианта(ов) `product.product`, к которым относится
   это значение атрибута. **Основной, ожидаемый вариант** — именно такой ID используется
   в строках заказа при создании ордера в Odoo
2. `product_tmpl_id` — ID `product.template`, на случай если `Extras.odoo_id` в БД
   на самом деле был проставлен по шаблону, а не по варианту
3. `id` / `product_id` / `odoo_id` — сырой `id` верхнего уровня (покрывает случай, когда
   вебхук настроен прямо на `product.product`, без атрибутов)

Собственный `id` записи `product.template.attribute.value` (`428` в примере) **не
участвует** в поиске — он не имеет отношения ни к одной из ID-схем, которые
могут быть в `Extras.odoo_id`.

## Odoo automation — встроенный Webhook action

Кастомный Python-код не нужен — Odoo умеет слать вебхук нативным действием
**Send Webhook Notification**. Настройка (Settings → Technical → Automation Rules):

1. **Automation Rule**
   - Model: **Attribute Value** (`product.template.attribute.value`)
   - Trigger: **On Update**
   - "When updating" (Trigger Field(s)) — можно указать `Extra Price` (`price_extra`,
     это обычное хранимое поле, в отличие от `lst_price` на варианте товара, так что
     должно быть в списке выбора), либо оставить пустым (сработает на любое изменение
     записи — безопасно, т.к. синхронизация идемпотентна, см. примечания ниже)
2. **Create Actions → Send Webhook Notification**
   - Type: `Send Webhook Notification`
   - URL: `https://bluuu.tours/api/odoo/webhook/product-price?key=odoo_wh_38fe18f8b0c0ea819e118e7897b10e6a`
     (ключ берётся из `services.config.php` → `odoo_webhook_key`, без него — `401`)
   - Fields — обязательно добавить **все**, иначе бэкенд не сможет сматчить `Extras`:
     - `Extra Price` (`price_extra`) — цена
     - `Product Variants` (`ptav_product_variant_ids`) — основной ID для матчинга
     - `Product Template` (`product_tmpl_id`) — запасной вариант

### Примечания

- Вебхук идемпотентен — повторная отправка той же цены просто перезапишет то же значение,
  доп. проверок "изменилось ли значение" на стороне Odoo не требуется.
- Если продукт не смаппен ни на один `Extras` (например это лодка, тур, трансфер или cover,
  а не extras) — вебхук просто вернёт его в `skipped`, ошибкой это не считается. Можно либо
  ограничить Automation Rule доменом по категории товара (только extras), либо оставить
  как есть и полагаться на `skipped`.
- Эндпоинт делает только один `UPDATE` в локальной БД без внешних вызовов — отвечает
  практически мгновенно, отдельный таймаут в Odoo action настраивать не нужно.
