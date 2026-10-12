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
- В `updated` есть `old_price` и `price` (новая)

### Логирование

Отдельный файл `storage/logs/odoo-product-price.log` — по одной JSON-строке на запись
(время Asia/Makassar):
- `request` — **до** проверки ключа: IP, URL, User-Agent, Content-Type, сырое тело
  (`raw_body`) и распарсенный input (без `key`)
- `unauthorized` — неверный/отсутствующий ключ
- на каждый item: модель, ключ цены и значение, ID-кандидаты, найденный extra
  (`extra_id`, `extra_name`, `odoo_id`), `old_price` → `new_price`, решение
  (`updated` / `skip: ...`)
- warning-записи дублируются в стандартный системный лог

### Защита

- **`zero_price_guard`** — если пришла цена `<= 0`, а у extra сейчас цена `> 0`,
  ничего не пишется (только warning в лог). Причина: Automation Rule на ptav срабатывает
  на любое изменение записи, и часто прилетает `price_extra: 0.0`. Если extra
  действительно должен стать бесплатным — менять цену вручную в админке
- **`unchanged`** — цена совпадает с текущей → не сохраняется

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

Бэкенд (`extractCandidateOdooIds`) ищет `Extras` по ID-кандидатам, первое совпадение
выигрывает. Набор кандидатов зависит от модели:

- **ptav** (`_model = product.template.attribute.value`, либо в item есть
  `ptav_product_variant_ids` / `price_extra`): **только** `ptav_product_variant_ids` —
  ID вариантов `product.product`, тот же ID, что в строках заказа. Цена — только `price_extra`
- **прочее** (вебхук прямо на `product.product`): `id` / `product_id` / `odoo_id`, затем
  `product_tmpl_id`. Цена — `lst_price` → `list_price` → `price` (`price` последним: в Odoo
  он вычисляется по контексту прайслиста и без него обычно 0)

Собственный `id` записи ptav (`428` в примере) и `product_tmpl_id` для ptav **не
участвуют** в поиске — это другие ID-пространства, они могут случайно совпасть с
`Extras.odoo_id` чужого extra и перезаписать ему цену (так раньше и обнулялись цены).

## Odoo automation — встроенный Webhook action

Кастомный Python-код не нужен — Odoo умеет слать вебхук нативным действием
**Send Webhook Notification**. Настройка (Settings → Technical → Automation Rules):

1. **Automation Rule**
   - Model: **Attribute Value** (`product.template.attribute.value`)
   - Trigger: **On Update**
   - "When updating" (Trigger Field(s)) — **указать `Extra Price` (`price_extra`)**.
     Пустое значение = срабатывание на любое изменение записи (пересортировка, правка
     атрибутов шаблона, пересоздание вариантов), часто с `price_extra: 0.0`
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
