# Bluuu Chatbot API

Базовый URL: `https://bluuu.tours`

---

## Аутентификация

Все запросы требуют API-ключ — передаётся заголовком или query-параметром:

```
X-Api-Key: bluuu-chatbot-2026
```

или `?api_key=bluuu-chatbot-2026`

Задаётся в `.env`: `CHATBOT_API_KEY=bluuu-chatbot-2026`

При неверном ключе → `401 { "error": "Unauthorized" }`

---

## Версии

| Версия | Префикс | odoo_id |
|--------|---------|---------|
| v1 | `/api/chatbot/...` | нет |
| v2 | `/api/v2/chatbot/...` | везде |

---

## GET /api/v2/chatbot/boats/private

Возвращает все активные туры типа «приватная аренда» (classes_id = 8).

```
GET https://bluuu.tours/api/v2/chatbot/boats/private
X-Api-Key: bluuu-chatbot-2026
```

### Ответ

```json
{
  "boats": [...],
  "routes": [...],
  "extras": [...],
  "transfers": [...],
  "covers": [...],
  "updated_at": "2026-04-06T07:12:00.000000Z"
}
```

### boats[]

```json
{
  "id": 54,
  "odoo_id": 1935,
  "name": "Classic Boat",
  "slug": "standard-boats",
  "description": "<p>...</p>",
  "size": 12,
  "capacity": 13,
  "currency": "IDR",
  "status": "ready",
  "categories": [],
  "features": {
    "shade": "Partial shade",
    "cabin": false,
    "ac": false,
    "sound": null,
    "toilet": true
  },
  "best_for": "budget-friendly groups",
  "boat_type": "Speedboat",
  "pricing": {
    "type": "per_boat",
    "boat_price": 2250000,
    "packages": [
      {
        "name": "Private Tour Default Pricelist",
        "pricelist": [
          { "members_count": "1", "price": "12295000" },
          { "members_count": "2", "price": "12585000" }
        ]
      }
    ],
    "seasonal_prices": [
      {
        "date_start": "2026-04-01",
        "date_end": "2026-05-15",
        "low_price": false,
        "flash_sale": false,
        "packages": {
          "name": "Private Tour Mid Season Prices",
          "pricelist": [
            { "members_count": "1", "price": "13025000" }
          ]
        }
      }
    ]
  },
  "boats": [
    {
      "id": 15,
      "odoo_id": 71,
      "name": "Riki J",
      "company": { "id": 18, "odoo_id": 26, "name": "PT Riki J Boat Charters" }
    },
    {
      "id": 18,
      "odoo_id": 85,
      "name": "Jayanadi",
      "company": { "id": 8, "odoo_id": 15, "name": "Jayanadi" }
    }
  ],
  "images": [
    "https://bluuu.tours/storage/app/uploads/public/.../thumb_600_400.webp"
  ]
}
```

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | int | ID тура |
| `odoo_id` | int\|null | Odoo product ID тура |
| `status` | string | `ready` / `busy` / `maintenance` |
| `pricing.type` | string | Всегда `per_boat` для приватных туров |
| `pricing.boat_price` | int | Базовая доплата за лодку (IDR) |
| `pricing.packages` | array | Основной прайслист — цена за группу по количеству гостей |
| `pricing.seasonal_prices` | array | Сезонные переопределения (только будущие даты) |
| `boats` | array | Физические лодки с `odoo_id` и `company.odoo_id` |

**Логика расчёта цены:** из `packages[0].pricelist` берётся запись с `members_count == guests`. Если дата попадает в `seasonal_prices` — используется тот прайслист. `total = tier_price + boat_price`.

### routes[]

```json
{
  "id": 3,
  "odoo_id": null,
  "title": "Classic route",
  "slug": "classic-route",
  "description": "A comfortable one-day journey...",
  "map": "https://bluuu.tours/storage/app/uploads/public/.../map.jpg",
  "restaurant": {
    "id": 1,
    "odoo_id": 65,
    "name": "Amarta Penida",
    "menu": "<div>...</div>"
  }
}
```

### extras[]

```json
{
  "id": 52,
  "odoo_id": 571,
  "name": "Beginner Diver 1-Pax Pack",
  "description": "<p>...</p>",
  "price": "2420000.00",
  "currency": "IDR",
  "category": "Tour Add-ons",
  "has_options": false,
  "options": []
}
```

С вариантами (`has_options: true`):

```json
{
  "id": 10,
  "odoo_id": 870,
  "name": "Snorkeling Equipment",
  "has_options": true,
  "options": [
    { "id": 11, "odoo_id": 871, "name": "Adult set", "price": "150000.00" },
    { "id": 12, "odoo_id": 872, "name": "Kids set",  "price": "100000.00" }
  ]
}
```

### transfers[]

```json
{
  "id": 1,
  "odoo_id": 22,
  "name": "Private Pick up",
  "price": 300000,
  "bus_price": 600000,
  "currency": "IDR",
  "description": "<p>Pick-up or drop-off.</p>"
}
```

| Поле | Описание |
|------|----------|
| `price` | Цена для ≤5 гостей |
| `bus_price` | Цена для >5 гостей (автобус), `null` если не предусмотрен |

### covers[]

```json
{
  "id": 2,
  "odoo_id": 1523,
  "name": "Fully Flexible Booking (Private)",
  "price": 1000000,
  "currency": "IDR",
  "description": "<p>100% Refund Cancellation Protection</p>"
}
```

---

## GET /api/v2/chatbot/boats/shared

Возвращает все активные групповые туры (classes_id = 9).

```
GET https://bluuu.tours/api/v2/chatbot/boats/shared
X-Api-Key: bluuu-chatbot-2026
```

### Ответ

```json
{
  "boats": [...],
  "transfers": [...],
  "covers": [...],
  "updated_at": "2026-04-06T07:12:00.000000Z"
}
```

> Групповые туры не содержат отдельный массив `routes[]` и `extras[]` — маршрут и ресторан вложены прямо в объект тура.

### boats[]

```json
{
  "id": 57,
  "odoo_id": 1933,
  "name": "Classic Shared Tour",
  "slug": "classic-shared-tour",
  "description": "<p>...</p>",
  "size": 12,
  "capacity": 14,
  "currency": "IDR",
  "status": "ready",
  "categories": [],
  "features": {
    "shade": "Partial shade",
    "cabin": false,
    "ac": false,
    "sound": null,
    "toilet": false
  },
  "pricing": {
    "type": "per_guest",
    "packages": [
      {
        "name": "Standard Shared Default Prices",
        "pricelist": [
          { "members_count": "1", "price": "1390000" },
          { "members_count": "2", "price": "2780000" },
          { "members_count": "13", "price": "18070000" }
        ]
      }
    ],
    "seasonal_prices": [
      {
        "date_start": "2026-01-01",
        "date_end": "2026-12-31",
        "low_price": false,
        "flash_sale": false,
        "packages": {
          "name": "Standard Shared Tier 2",
          "pricelist": [
            { "members_count": "1", "price": "1550000" },
            { "members_count": "13", "price": "20150000" }
          ]
        }
      }
    ]
  },
  "route": {
    "id": 9,
    "odoo_id": null,
    "title": "Classic shared tour",
    "slug": "classic"
  },
  "restaurant": {
    "id": 1,
    "odoo_id": 65,
    "name": "Amarta Penida",
    "menu": "<div>...</div>"
  },
  "boats": [
    { "id": 15, "odoo_id": 71,  "name": "Riki J",         "company": { "id": 18, "odoo_id": 26, "name": "PT Riki J Boat Charters" } },
    { "id": 17, "odoo_id": 90,  "name": "Standard Boat",   "company": { "id": 10, "odoo_id": 17, "name": "Weda Dharma" } },
    { "id": 21, "odoo_id": 88,  "name": "Sweetheart 4",    "company": { "id": 9,  "odoo_id": 16, "name": "PT Bali Boat Tour - Sweetheart 4" } },
    { "id": 25, "odoo_id": 73,  "name": "Big Sweetheart",  "company": { "id": 5,  "odoo_id": 12, "name": "Sweetheart Nyoman" } },
    { "id": 27, "odoo_id": 141, "name": "Sanjaya",         "company": { "id": 7,  "odoo_id": 14, "name": "Sanjaya" } },
    { "id": 28, "odoo_id": 243, "name": "Big Little Star",  "company": { "id": 6,  "odoo_id": 13, "name": "Small Little Star" } },
    { "id": 34, "odoo_id": 83,  "name": "Sea Dragon",      "company": { "id": 7,  "odoo_id": 14, "name": "Sanjaya" } },
    { "id": 53, "odoo_id": 355, "name": "Lady Manta",      "company": { "id": 3,  "odoo_id": 3,  "name": "Lady Manta" } }
  ],
  "images": [...]
}
```

**Логика расчёта цены:** `pricing.type = per_guest`. Из `pricelist` берётся запись с `members_count == guests`. Если дата попадает в `seasonal_prices` — используется тот прайслист. `total = tier_price` (без `boat_price`).

---

## POST /api/v2/chatbot/quote

Рассчитывает стоимость и возвращает готовые данные для создания заказа в Odoo.

```
POST https://bluuu.tours/api/v2/chatbot/quote
X-Api-Key: bluuu-chatbot-2026
Content-Type: application/json
```

### Параметры запроса

| Поле | Тип | Обязательный | Описание |
|------|-----|:---:|----------|
| `tour_id` | int | ✓ | ID тура (из `boats[].id`) |
| `date` | string | — | Дата в формате `YYYY-MM-DD` |
| `adults` | int | — | Количество взрослых (по умолчанию: `1`) |
| `kids` | int | — | Количество детей (по умолчанию: `0`) |
| `guests` | int | — | Альтернатива adults+kids — используется если `adults` не передан |
| `route_id` | int | — | ID маршрута (только для приватных туров, из `routes[].id`) |
| `transfer` | int | — | ID трансфера (из `transfers[].id`) |
| `insurance` | int | — | ID страховки/покрытия (из `covers[].id`) |
| `boat_id` | int | — | ID физической лодки (из `boats[].boats[].id`). Если не передан — выбирается автоматически |
| `pickup_address` | string | — | Адрес подачи |
| `dropoff_address` | string | — | Адрес высадки |
| `cars` | int | — | Количество машин |
| `name` | string | — | Имя клиента |
| `email` | string | — | Email клиента |
| `whatsapp` | string | — | WhatsApp клиента |
| `external_id` | string | — | Внешний ID (ссылка на лид в CRM) |
| `extras` | array | — | `[{ "extra_id": int, "quantity": int }]` |

### Пример запроса

```json
{
  "tour_id": 54,
  "date": "2026-05-20",
  "adults": 4,
  "kids": 0,
  "route_id": 3,
  "transfer": 1,
  "insurance": 2,
  "boat_id": 15,
  "pickup_address": "Seminyak",
  "dropoff_address": "",
  "cars": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "whatsapp": "+1234567890",
  "external_id": "",
  "extras": [
    { "extra_id": 52, "quantity": 1 }
  ]
}
```

### Пример ответа

```json
{
  "success": true,
  "booking_url": "https://bluuu.tours/new/private?date=2026-05-20&adults=4&tour=54&route=3&transfer=1&cover=2",
  "odoo_data": {
    "order": {
      "is_rental_order": true,
      "rental_start_date": "2026-05-20 01:00:00",
      "rental_return_date": "2026-05-20 09:00:00",
      "company_id": 26,
      "x_studio_boat_name": "Riki J",
      "x_studio_adults": 4,
      "x_studio_kids": 0,
      "x_studio_count_of_people": 4,
      "x_studio_route": "Classic route",
      "x_studio_pickup_address": "Seminyak",
      "x_studio_drop_off_address": "",
      "x_studio_pickup_cars": 1,
      "x_studio_drop_off_cars": 1,
      "x_studio_deposit": 0,
      "x_studio_collect": 20452000,
      "client_order_ref": "",
      "partner_name": "John Doe",
      "partner_email": "john@example.com",
      "partner_phone": "+1234567890"
    },
    "lines": [
      { "label": "boat",                            "product_id": 71,   "qty": 1, "price": 0 },
      { "label": "tour",                            "product_id": 1935, "qty": 1, "price": 16732000 },
      { "label": "transfer",                        "product_id": 22,   "qty": 1, "price": 300000 },
      { "label": "cover",                           "product_id": 1523, "qty": 1, "price": 1000000 },
      { "label": "extra:Beginner Diver 1-Pax Pack", "product_id": 571,  "qty": 1, "price": 2420000 }
    ]
  },
  "currency_idr": {
    "total_price": 20452000,
    "price_per_pax": 5113000,
    "breakdown": {
      "boat_base_price": 16732000,
      "transfer": 300000,
      "insurance": 1000000,
      "extras_total": 2420000,
      "extras": [
        {
          "extra_id": 52,
          "odoo_id": 571,
          "name": "Beginner Diver 1-Pax Pack",
          "qty": 1,
          "unit_price_idr": 2420000,
          "subtotal_idr": 2420000
        }
      ],
      "final_total": 20452000
    }
  },
  "currency_usd": {
    "rate": 0.00005878,
    "total_price": 1202,
    "price_per_pax": 301,
    "breakdown": {
      "boat_base_price": 984,
      "transfer": 18,
      "insurance": 59,
      "extras_total": 142,
      "final_total": 1202
    }
  },
  "meta": {
    "tour_id": 54,
    "tour_name": "Classic Boat",
    "tour_type": "private",
    "date": "2026-05-20",
    "adults": 4,
    "kids": 0,
    "guests": 4
  }
}
```

### Поля ответа

#### odoo_data.order

Готовые поля для `sale.order/create` в Odoo — передаются напрямую в OdooService.

| Поле | Тип | Описание |
|------|-----|----------|
| `is_rental_order` | bool | Всегда `true` |
| `rental_start_date` | string\|null | Дата и время начала в UTC (`YYYY-MM-DD HH:MM:SS`), рассчитывается из `date + route.start` (Asia/Makassar → UTC) |
| `rental_return_date` | string\|null | Дата и время окончания в UTC (`date + route.end`) |
| `company_id` | int\|null | Odoo ID компании лодки |
| `x_studio_boat_name` | string | Название физической лодки |
| `x_studio_adults` | int | Количество взрослых |
| `x_studio_kids` | int | Количество детей |
| `x_studio_count_of_people` | int | Итого гостей |
| `x_studio_route` | string | Название маршрута |
| `x_studio_pickup_address` | string | Адрес подачи |
| `x_studio_drop_off_address` | string | Адрес высадки |
| `x_studio_pickup_cars` | int | Количество машин на подачу |
| `x_studio_drop_off_cars` | int | Количество машин на высадку (`0` если тип трансфера = `pickup`) |
| `x_studio_deposit` | float | Депозит — всегда `0` (заполняется при оплате) |
| `x_studio_collect` | float | Сумма к сбору = итоговая цена в IDR |
| `client_order_ref` | string | Внешний ID (лид из CRM) |
| `partner_name` | string | Имя клиента (для `res.partner`) |
| `partner_email` | string | Email клиента |
| `partner_phone` | string | Телефон / WhatsApp клиента |

#### odoo_data.lines

Строки заказа — готовы для `sale.order.line/create`.

| Поле | Тип | Описание |
|------|-----|----------|
| `label` | string | `boat` / `tour` / `transfer` / `cover` / `extra:<название>` |
| `product_id` | int | Odoo product ID |
| `qty` | int | Количество. Для cover: `1` если `per_boat`, иначе = количество гостей. Для групповых туров: количество гостей |
| `price` | float | Цена в IDR. Для `boat` всегда `0` |

#### currency_idr / currency_usd

| Поле | Описание |
|------|----------|
| `total_price` | Итоговая сумма |
| `price_per_pax` | Цена на 1 гостя |
| `breakdown.boat_base_price` | Стоимость тура (tier_price + boat_price для приватных туров) |
| `breakdown.transfer` | Стоимость трансфера. При >5 гостях → `bus_price` |
| `breakdown.insurance` | Стоимость страховки/покрытия |
| `breakdown.extras_total` | Суммарная стоимость всех доп. услуг |
| `breakdown.extras[].odoo_id` | Odoo ID каждой доп. услуги |
| `currency_usd` | `null` если курс USD не задан в базе данных |

#### meta

| Поле | Описание |
|------|----------|
| `tour_type` | `"private"` или `"shared"` |
| `adults` | Взрослые из запроса |
| `kids` | Дети из запроса |
| `guests` | Итого (adults + kids) |

---

## Ошибки

| HTTP | Тело | Причина |
|------|------|---------|
| `401` | `{ "error": "Unauthorized" }` | Неверный API-ключ |
| `404` | `{ "success": false, "error": "Tour not found" }` | Тур с указанным `tour_id` не найден |
| `500` | HTML | Серверная ошибка |

---

## Отличия v1 от v2

| | v1 `/api/chatbot/...` | v2 `/api/v2/chatbot/...` |
|---|---|---|
| `odoo_id` в boats/routes/extras/transfers/covers | нет | есть |
| `boats[].boats[]` (физические лодки) | нет | есть |
| `/quote` → `odoo_data` | нет | есть |
| `/quote` → `adults` / `kids` | только `guests` | `adults` + `kids` (или `guests` как запасной вариант) |
| `/quote` → выбор лодки | нет | автоматически по дате и доступности |
