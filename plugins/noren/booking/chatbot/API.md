# Bluuu Chatbot API

Base URL: `https://bluuu.tours`

---

## Authentication

Все запросы требуют API ключ — передаётся заголовком или query-параметром:

```
X-Api-Key: bluuu-chatbot-2026
```

или `?api_key=bluuu-chatbot-2026`

Задаётся в `.env`: `CHATBOT_API_KEY=bluuu-chatbot-2026`

При неверном ключе → `401 { "error": "Unauthorized" }`

---

## GET /api/v2/chatbot/boats/private

Возвращает все active private charter туры (`types_id = 2`, `source_id = 1` — только туры сайта, не Viator/другие OTA).

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
  "partner": false,
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
  "perks": [
    { "text": "Free cancellation up to 24h before", "icon": "check-icon-green" }
  ],
  "included": [
    { "id": 3, "name": "Snorkeling gear", "description": "<p>Mask, fins and snorkel for the whole trip.</p>", "icon_svg": "<svg>...</svg>" }
  ],
  "includes": [
    { "id": 7, "name": "Lunch", "icon_svg": "<svg>...</svg>" }
  ],
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
| `partner` | bool | `true` — лодка партнёрская, бронируется "по запросу" (сайт показывает "On Request" вместо "Instant confirmation"). См. CLAUDE.md "Партнёрские лодки" — при `true` фактическое бронирование идёт через respond.io (TODO, ещё не готово) |
| `perks` | array | Короткий чек-лист на карточке тура — `{ text, icon }`, `icon` — один из `check-icon-green` / `none-icon-red` / `plus-icon-green` / `minis-icon-red` |
| `pricing.type` | string | Всегда `per_boat` для private |
| `pricing.boat_price` | int | Базовая доплата за лодку (IDR) |
| `pricing.packages` | array | Основной прайслист — цена за группу по кол-ву гостей |
| `pricing.seasonal_prices` | array | Сезонные переопределения (только будущие даты) |
| `pricing.low_seasons` | array | Low season скидки тура `[{id, name, date_start, date_end, percent}]` — только активные и не закончившиеся. См. раздел «Low season» ниже |
| `low_season_max_percent` | int | Максимальный % среди `pricing.low_seasons` (`0` если скидок нет) |
| `included` | array | Развёрнутый список "что включено" (карточки с описанием и иконкой) — то же самое, что показывается на детальной странице тура |
| `includes` | array | Короткий список "что включено" (только название + иконка, без описания) — чипы на карточке тура |
| `boats` | array | Физические лодки с `odoo_id` и `company.odoo_id` |

**Логика прайса:** из `packages[0].pricelist` берётся запись с `members_count == guests`. Если дата попадает в `seasonal_prices` — берётся тот прайслист. `total = tier_price + boat_price`.

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
    "description": "<p>Cliffside restaurant with ocean views.</p>",
    "menu": "<div>...</div>",
    "menu_sections": [
      { "title": "Main Course", "items": [ { "name": "Grilled fish", "description": "Fresh catch of the day" } ] }
    ],
    "menu_note": "Should you desire cocktails, wine or other selections, please ask for the restaurant's general menu...",
    "image": "https://bluuu.tours/storage/app/uploads/public/.../restaurant.jpg",
    "images_with_thumbs": [
      { "original": "https://.../original.webp", "hero": "https://.../hero.webp", "thumb": "https://.../thumb.webp", "thumb_small": "https://.../thumb_small.webp" }
    ]
  },
  "itinerary": [
    { "time": "08:00", "title": "Meeting point" },
    { "time": "08:30", "title": "Departure" },
    { "time": "09:00", "title": "Snorkeling" },
    { "time": "12:00", "title": "Lunch" },
    { "time": "13:30", "title": "Land tour to Kelingking Cliff" },
    { "time": "17:00", "title": "Cruise back to Bali" }
  ],
  "inclusions": [
    "Swim with mantas",
    "4 snorkeling spots"
  ],
  "notes": "Diving license required",
  "extra_categories": [
    {
      "id": 4,
      "name": "Tour Add-ons",
      "extras": [
        { "id": 52, "odoo_id": 571, "name": "Beginner Diver 1-Pax Pack", "price": "2420000.00", "qty_type": "manual", "conflict_ids": [], "has_options": false, "options": [] }
      ]
    }
  ]
}
```

| Поле | Тип | Описание |
|------|-----|----------|
| `restaurant.menu_sections` | array | Структурированное меню по категориям — `[{ title, items: [{ name, description }] }]`. Если не заполнено в админке — `[]`, используйте `restaurant.menu` (HTML) как фолбэк |
| `restaurant.menu_note` | string\|null | Примечание под меню (например про напитки/доп. позиции по запросу) |
| `restaurant.image` / `restaurant.images_with_thumbs` | string / array | Фото ресторана. `image` — одна ссылка (фолбэк), `images_with_thumbs` — массив `{ original, hero, thumb, thumb_small }` |
| `itinerary` | array | Таймлайн дня — слияние `schedule_before_lunch` + `schedule_after_lunch` маршрута (те же данные, что в попапе маршрута на сайте). Каждый шаг — `{ time, title }`. Разделители "или" между альтернативными активностями в таймлайн не попадают |
| `inclusions` | array | Список фишек/хайлайтов маршрута (`route.highlights[].label`) — то, что показывается чипами на карточке/попапе маршрута |
| `notes` | string\|null | Доп. примечание к маршруту (например "Diving license required"), `null` если не заполнено |
| `extra_categories` | array | Категории extras, доступные именно для этого route (`route.ecategories`, у каждой — свои `extras`, формат как в топ-level `extras[]`, включая `qty_type` и `conflict_ids`). **Используйте это поле, а не топ-level `extras[]`**, когда клиент уже выбрал route — при смене route набор категорий и extras внутри них меняется (см. CLAUDE.md "Extras & Ecategories") |

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
  "qty_type": "manual",
  "conflict_ids": [],
  "has_options": false,
  "options": []
}
```

С вариантами (`has_options: true`) и конфликтом с другим extra:

```json
{
  "id": 10,
  "odoo_id": 870,
  "name": "Snorkeling Equipment",
  "qty_type": "manual",
  "conflict_ids": [52],
  "has_options": true,
  "options": [
    { "id": 11, "odoo_id": 871, "name": "Adult set", "price": "150000.00", "conflict_ids": [] },
    { "id": 12, "odoo_id": 872, "name": "Kids set",  "price": "100000.00", "conflict_ids": [] }
  ]
}
```

| Поле | Описание |
|------|----------|
| `qty_type` | Как считается количество, если бы этот extra бронировался (см. таблицу qty_type в CLAUDE.md): `manual` (клиент вводит сам), `per_car` (`ceil(guests/5)`), `per_14_guests` (`ceil(guests/14)`), `per_person` (`= guests`), `fixed` (всегда `1`). **Этот эндпоинт и `/quote` не принимают и не считают extras** — см. примечание в разделе `routes[]` и в `POST /quote` |
| `conflict_ids` | ID других extras, которые **нельзя выбрать вместе с этим** (в админке — поле "Conflicts with (cannot be selected together)" на модели Extras). Список симметричный — не важно, с какой стороны настроен конфликт в БД, `conflict_ids` покажет его в обе стороны. Есть и у `options[]` (у вариантов своя таблица конфликтов). **Проверка только на фронтенде** — сайт не даёт добавить второй конфликтующий extra в корзину, но бэкенд это не валидирует. Раз этот эндпоинт — просто каталог (без бронирования), это поле для бота: не предлагайте клиенту одновременно два extras, если один из них в `conflict_ids` другого |

**Важно:** этот список — общий каталог всех extras сайта, без привязки к route. Он **не отфильтрован** под конкретный маршрут — для этого использовать `routes[].extra_categories` (см. ниже). `/quote` extras не поддерживает (см. примечание в том разделе).

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
| `bus_price` | Цена для >5 гостей (автобус), `null` если нет |

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

Возвращает все active shared туры (`types_id = 1`, `source_id = 1` — только туры сайта, не Viator/другие OTA).

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
  "badge_name": "Best value",
  "badge_color": "#22c55e",
  "headline": "The classic Nusa Penida day trip",
  "categories": [],
  "features": {
    "shade": "Partial shade",
    "cabin": false,
    "ac": false,
    "sound": null,
    "toilet": false
  },
  "perks": [
    { "text": "Free cancellation up to 24h before", "icon": "check-icon-green" }
  ],
  "included": [
    { "id": 3, "name": "Snorkeling gear", "description": "<p>Mask, fins and snorkel for the whole trip.</p>", "icon_svg": "<svg>...</svg>" }
  ],
  "includes": [
    { "id": 7, "name": "Lunch", "icon_svg": "<svg>...</svg>" }
  ],
  "pricing": {
    "type": "per_guest",
    "default_price": 1390000,
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
    "description": "<p>Cliffside restaurant with ocean views.</p>",
    "menu": "<div>...</div>",
    "menu_sections": [
      { "title": "Main Course", "items": [ { "name": "Grilled fish", "description": "Fresh catch of the day" } ] }
    ],
    "menu_note": "Should you desire cocktails, wine or other selections, please ask for the restaurant's general menu...",
    "image": "https://bluuu.tours/storage/app/uploads/public/.../restaurant.jpg",
    "images_with_thumbs": [
      { "original": "https://.../original.webp", "hero": "https://.../hero.webp", "thumb": "https://.../thumb.webp", "thumb_small": "https://.../thumb_small.webp" }
    ]
  },
  "itinerary": [
    { "time": "08:00", "title": "Meeting point" },
    { "time": "08:30", "title": "Departure" },
    { "time": "09:00", "title": "Snorkeling" },
    { "time": "12:00", "title": "Lunch" },
    { "time": "13:30", "title": "Land tour to Kelingking Cliff" },
    { "time": "17:00", "title": "Cruise back to Bali" }
  ],
  "inclusions": [
    "Snorkeling at 4 top spots",
    "Lunch at cliff restaurant"
  ],
  "notes": null,
  "boats": [
    { "id": 15, "odoo_id": 71,  "name": "Riki J",        "company": { "id": 18, "odoo_id": 26, "name": "PT Riki J Boat Charters" } },
    { "id": 17, "odoo_id": 90,  "name": "Standard Boat",  "company": { "id": 10, "odoo_id": 17, "name": "Weda Dharma" } },
    { "id": 21, "odoo_id": 88,  "name": "Sweetheart 4",   "company": { "id": 9,  "odoo_id": 16, "name": "PT Bali Boat Tour - Sweetheart 4" } },
    { "id": 25, "odoo_id": 73,  "name": "Big Sweetheart", "company": { "id": 5,  "odoo_id": 12, "name": "Sweetheart Nyoman" } },
    { "id": 27, "odoo_id": 141, "name": "Sanjaya",        "company": { "id": 7,  "odoo_id": 14, "name": "Sanjaya" } },
    { "id": 28, "odoo_id": 243, "name": "Big Little Star", "company": { "id": 6, "odoo_id": 13, "name": "Small Little Star" } },
    { "id": 34, "odoo_id": 83,  "name": "Sea Dragon",     "company": { "id": 7,  "odoo_id": 14, "name": "Sanjaya" } },
    { "id": 53, "odoo_id": 355, "name": "Lady Manta",     "company": { "id": 3,  "odoo_id": 3,  "name": "Lady Manta" } }
  ],
  "images": [...]
}
```

`itinerary`, `inclusions`, `notes` — те же поля и та же логика, что в `routes[]` приватного эндпоинта (см. таблицу выше), только источник — маршрут, привязанный к этому shared-туру (`tour.route`). Для shared-туров маршрут один и не выбирается клиентом, поэтому эти поля лежат прямо в `boats[]`, а не в отдельном списке `routes[]`.

`included`/`includes` — те же поля и логика, что в приватном эндпоинте (см. таблицу выше): `included` — развёрнутые карточки "что включено" с описанием, `includes` — короткие чипы. Не путать с `inclusions` (это про route/маршрут, а не про тур).

`perks` — тот же формат, что в приватном эндпоинте (см. таблицу выше).

`badge_name`/`badge_color` — промо-плашка на карточке тура (например "Best value"), `null` если бейдж не назначен. Только у shared-туров — у private это поле сайтом сейчас не используется.

`headline` — короткий подзаголовок под названием тура, `""` если не заполнен.

**Логика прайса:** `pricing.type = per_guest`. Из `pricelist` берётся запись с `members_count == guests`. Если дата в `seasonal_prices` — берётся тот прайслист. `total = tier_price` (без boat_price). `pricing.default_price` — цена "по умолчанию" за 1 гостя, которая показывается на карточке тура **до** выбора даты/кол-ва людей (`show_price` → `gross_price` → `price`, первое ненулевое); для реального расчёта используйте `/quote` или `pricing.packages`, не `default_price`.

Low season (shared): `pricing.low_seasons`, `low_season_max_percent` — как у private. Дополнительно `pricing.default_price_discounted` = `default_price` минус `low_season_max_percent` (цена «от» с максимальной будущей скидкой; равна `default_price`, если скидок нет).

---

## GET /api/v2/chatbot/policies

Общие политики сайта (не привязаны к конкретному туру) — те же тексты, что показываются во всплывающих окнах политик на сайте (`FullController::getRules()`, `src/contexts/RulesContext.jsx`).

```
GET https://bluuu.tours/api/v2/chatbot/policies
X-Api-Key: bluuu-chatbot-2026
```

### Пример ответа

```json
{
  "payment": {
    "title": "Payment",
    "text": "<p>Enjoy hassle-free bookings with trusted cloud-based payments...</p>"
  },
  "cancellation": {
    "title": "Cancelation policy",
    "text": "<ul><li>It is possible to cancel a reservation and receive a full refund...</li></ul>"
  },
  "privacy": {
    "title": "Privacy Policy",
    "text": "<p>...</p>"
  },
  "health": {
    "title": "Health, Safety & Sustainability",
    "text": "<p>...</p>"
  },
  "liability": {
    "title": "Release from Liability",
    "text": "<p>...</p>"
  },
  "updated_at": "2026-04-06T07:12:00.000000Z"
}
```

### Поля

| Поле | Описание |
|------|----------|
| `payment` | Условия оплаты (депозит/остаток, способы оплаты) |
| `cancellation` | Политика отмены и возврата средств. В БД поле называется `return` — здесь переименовано для ясности |
| `privacy` | Политика конфиденциальности |
| `health` | Стандарты здоровья/безопасности |
| `liability` | Отказ от ответственности / согласие гостя. В БД поле называется `release` — здесь переименовано |

Каждая политика — `{ title, text }`, где `text` — HTML (как в richeditor-полях остальных ответов этого API). Это **общие** политики сайта — не зависят от тура/route; для примечаний конкретного маршрута смотрите `routes[].notes`.

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
| `date` | string | — | Дата `YYYY-MM-DD` |
| `adults` | int | — | Взрослые (default: `1`) |
| `kids` | int | — | Дети (default: `0`) |
| `guests` | int | — | Альтернатива adults+kids (используется если adults не передан) |
| `route_id` | int | — | ID маршрута (только private, из `routes[].id`) |
| `transfer` | int | — | ID трансфера (из `transfers[].id`) |
| `insurance` | int | — | ID cover (из `covers[].id`) |
| `boat_id` | int | — | ID физической лодки (из `boats[].boats[].id`). Если не передан — выбирается автоматически |
| `pickup_address` | string | — | Адрес подачи |
| `dropoff_address` | string | — | Адрес высадки |
| `name` | string | — | Имя клиента |
| `email` | string | — | Email клиента |
| `whatsapp` | string | — | WhatsApp клиента |
| `external_id` | string | — | Внешний ID (ссылка на лид в CRM) |

**Extras этот эндпоинт не поддерживает.** Экстрасы бронируются только на самом сайте (клиент добирает их после перехода по `booking_url`) — не передавайте `extras`/`cars`, они не влияют на расчёт и молча отбрасываются.

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
  "name": "John Doe",
  "email": "john@example.com",
  "whatsapp": "+1234567890",
  "external_id": ""
}
```

### Пример ответа

```json
{
  "success": true,
  "booking_url": "https://bluuu.tours/private-tour-to-nusa-penida?date=2026-05-20&adults=4&tour=54&route=3&transfer=1&cover=2",
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
      "x_studio_route_new": "Classic route",
      "x_studio_lunch": "Amarta Penida",
      "x_studio_pickup_address": "Seminyak",
      "x_studio_drop_off_address": "",
      "x_studio_pickup_cars": 1,
      "x_studio_drop_off_cars": 1,
      "x_studio_car_type": "Private Car",
      "x_studio_tour_type": "Standard Private",
      "x_studio_deposit": 0,
      "client_order_ref": "",
      "partner_name": "John Doe",
      "partner_email": "john@example.com",
      "partner_phone": "+1234567890"
    },
    "lines": [
      { "label": "boat",       "product_id": 71,   "qty": 1, "price": 0 },
      { "label": "tour",       "product_id": 1935, "qty": 1, "price": 16732000 },
      { "label": "transfer",   "product_id": 22,   "qty": 1, "price": 300000 },
      { "label": "cover",      "product_id": 1523, "qty": 1, "price": 1000000 },
      { "label": "restaurant", "product_id": 65,   "qty": 4, "price": 0 }
    ]
  },
  "currency_idr": {
    "total_price": 18032000,
    "price_per_pax": 4508000,
    "breakdown": {
      "boat_base_price": 16732000,
      "transfer": 300000,
      "insurance": 1000000,
      "final_total": 18032000
    }
  },
  "currency_usd": {
    "rate": 0.00005878,
    "total_price": 1060,
    "price_per_pax": 265,
    "breakdown": {
      "boat_base_price": 984,
      "transfer": 18,
      "insurance": 59,
      "final_total": 1060
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
| `rental_start_date` | string\|null | UTC datetime начала (`YYYY-MM-DD HH:MM:SS`), рассчитан из `date + route.start` (Asia/Makassar → UTC) |
| `rental_return_date` | string\|null | UTC datetime конца (`date + route.end`) |
| `company_id` | int\|null | Odoo company ID компании лодки |
| `x_studio_boat_name` | string | Название физической лодки |
| `x_studio_adults` | int | Взрослые |
| `x_studio_kids` | int | Дети |
| `x_studio_count_of_people` | int | Всего гостей |
| `x_studio_route_new` | string | Название маршрута (`route.odoo_name`) — заменило удалённое из Odoo поле `x_studio_route` |
| `x_studio_lunch` | string | Ресторан / обед по маршруту (`restaurant.odoo_name`) |
| `x_studio_pickup_address` | string | Адрес подачи |
| `x_studio_drop_off_address` | string | Адрес высадки |
| `x_studio_pickup_cars` | int | `1` если `transfer` = 1 или 2, иначе `0`. Число машин из запроса не используется — это флаг "есть подача", не количество |
| `x_studio_drop_off_cars` | int | `1` только если `transfer` = 2 (Private Pick up & Drop off), иначе `0` |
| `x_studio_car_type` | string\|false | `"Private Car"` (`transfer` 1/2, `guests` ≤ 5) / `"Private Hi-Ace"` (`transfer` 1/2, `guests` > 5) / `"Free Shuttle Bus"` (`transfer` = 3) / `false` (нет трансфера) |
| `x_studio_tour_type` | string | `tour.odoo_type` |
| `x_studio_deposit` | float | Депозит — всегда `0` (заполняется при оплате) |
| `client_order_ref` | string | Внешний ID (лид CRM) |
| `partner_name` | string | Имя клиента (для `res.partner`) |
| `partner_email` | string | Email клиента |
| `partner_phone` | string | Телефон / WhatsApp клиента |

`x_studio_collect` в payload не передаётся — это readonly/computed поле в Odoo (`amount_total - deposit - collected_by_*`), запись в него на create отклоняется. Сумму к сбору берите из `currency_idr.total_price`.

#### odoo_data.lines

Строки заказа — готовы для `sale.order.line/create`. Extras сюда **не попадают** (см. примечание в параметрах запроса выше).

| Поле | Тип | Описание |
|------|-----|----------|
| `label` | string | `boat` / `tour` / `transfer` / `cover` / `restaurant`. `restaurant` добавляется всегда, если у route есть ресторан с `odoo_id` |
| `product_id` | int | Odoo product ID |
| `qty` | int | Количество. Для cover: `1` если `per_boat`, иначе = кол-во гостей. Для shared tour и restaurant: кол-во гостей |
| `price` | float | Цена в IDR. Для `boat` и `restaurant` всегда `0`. Для `tour` — цена **со** скидкой low season (как уходит в Odoo) |
| `discount` | float | Только у `tour`: всегда `0` — скидка low season уже учтена в `price` |

#### currency_idr / currency_usd

| Поле | Описание |
|------|----------|
| `total_price` | Итоговая сумма (boat + transfer + insurance, без extras — см. примечание выше) |
| `price_per_pax` | Цена на 1 гостя |
| `breakdown.original_boat_base_price` | Стоимость тура **без** low season скидки (tier_price + boat_price для private) |
| `breakdown.low_season_percent` | % low season скидки на эту дату (`0` если нет) |
| `breakdown.low_season_discount` | Сумма скидки (`0` если нет) |
| `breakdown.boat_base_price` | Стоимость тура **со** скидкой = `original_boat_base_price - low_season_discount` |
| `breakdown.transfer` | Стоимость трансфера. >5 гостей → `bus_price` |
| `breakdown.insurance` | Стоимость cover |
| `currency_usd` | `null` если курс USD не задан в БД |

#### meta

| Поле | Описание |
|------|----------|
| `tour_type` | `"private"` или `"shared"` |
| `adults` | Взрослые из запроса |
| `kids` | Дети из запроса |
| `guests` | Итого (adults + kids) |
| `low_season` | `{id, name, date_start, date_end, percent}` если на дату действует low season скидка, иначе `null` |

---

## GET /api/v2/chatbot/availability

Реальная доступность туров на конкретную дату — что можно ответить клиенту, если он спрашивает "а если я поеду завтра/20 мая, что свободно?". В отличие от `boats/private` и `boats/shared` (которые просто перечисляют туры и вместимость независимо от даты), этот эндпоинт читает `noren_booking_closeddates` — таблицу, которая обновляется вебхуком из Odoo (`OdooWebhookController`) при каждом подтверждении/отмене заказа, плюс ручные и cron-закрытия. Поэтому "available" здесь означает "нет активного заказа в Odoo на эту дату, реально можно продавать", а не просто "тур существует".

Private и shared туры возвращаются вместе, одним списком, с полем `type`.

```
GET https://bluuu.tours/api/v2/chatbot/availability?date=2026-05-20
X-Api-Key: bluuu-chatbot-2026
```

### Параметры запроса

| Поле | Тип | Обязательный | Описание |
|------|-----|:---:|----------|
| `date` | string | ✓ | Дата `YYYY-MM-DD` |
| `tour_id` | int | — | Ограничить ответ одним туром (из `boats[].id` в `boats/private` / `boats/shared`) |
| `guests` | int | — | Размер группы. Если передан, тур считается доступным только если группа реально помещается (см. ниже) |

### Пример ответа

```json
{
  "success": true,
  "date": "2026-05-20",
  "available": [
    { "tour_id": 54, "odoo_id": 1935, "name": "Classic Boat", "type": "private", "capacity": 89, "slots_left": 2 },
    { "tour_id": 57, "odoo_id": 1933, "name": "Classic Shared Tour", "type": "shared", "capacity": 27, "slots_left": 6 }
  ],
  "unavailable": [
    { "tour_id": 60, "odoo_id": 1940, "name": "Luxury Boat", "type": "private", "reason": "fully_booked" },
    { "tour_id": 61, "odoo_id": 1941, "name": "Sunset Shared", "type": "shared", "reason": "blackout" }
  ],
  "updated_at": "2026-04-06T07:12:00.000000Z"
}
```

### Поля

| Поле | Где | Описание |
|------|-----|----------|
| `type` | оба списка | `private` или `shared` — влияет на то, какой параметр (`tour`) и на какую страницу (`/private-tour-to-nusa-penida` или `/shared-tour-to-nusa-penida`) вести клиента при бронировании |
| `capacity` | `available[]` | Суммарная вместимость всех лодок тура (сумма `capacity` физических лодок), но не больше официально зарегистрированного `tour.capacity` (если сумма больше — показывается `tour.capacity`, если меньше — сумма). **Не то же самое**, что статичное поле `capacity` в `boats/private` / `boats/shared` |
| `slots_left` | `available[]` | **Private**: сколько ещё физических лодок этого тура свободно на дату (лодка сдаётся целиком одному клиенту). **Shared**: сколько мест на **самой вместительной из ещё не занятых лодок** — группа всегда едет на одной лодке, поэтому это не сумма по всем лодкам, а "самый большой кусок", который реально можно продать одной группе |
| `low_season_percent` | `available[]` | % low season скидки тура на эту дату, `0` если нет |
| `reason` | `unavailable[]` | `fully_booked` — тур раскуплен реальными заказами (или группа `guests` не помещается ни на одну лодку). `blackout` — дата закрыта вручную менеджером, cron-закрытием (21:30 каждый день на завтра) или лодка занята другим типом заказа (private/другой shared-тур) |

### Как влияет `guests`

- **Private**: лодка считается подходящей, если она свободна **и** её `capacity` ≥ `guests`. Если не передан — считается любая свободная лодка.
- **Shared**: тур доступен, если на **одной** свободной лодке есть ≥ `guests` мест (группу нельзя разбить на две лодки). Если не передан — доступность считается по факту наличия любых свободных мест.

### Важно

- Если у тура вообще нет лодок или все они выключены (`disabled`), тур не попадёт в ответ (используйте `boats/private` и `boats/shared`, чтобы получить полный список туров независимо от даты).
- `tour_id` берётся из `boats[].id` в ответах `boats/private` / `boats/shared` — это ID тура, а не физической лодки.

---

## GET /api/v2/chatbot/low-season

Активные и будущие low season скидки (сезонная процентная скидка на выбранные туры в интервале дат). Для ответа на «есть ли сейчас скидки / когда дешевле?».

```
GET https://bluuu.tours/api/v2/chatbot/low-season
X-Api-Key: bluuu-chatbot-2026
```

### Пример ответа

```json
{
  "success": true,
  "low_seasons": [
    {
      "name": "Low season January",
      "date_start": "2027-01-10",
      "date_end": "2027-03-15",
      "percent": 20,
      "tours": [
        { "tour_id": 54, "name": "Classic Boat", "type": "private" },
        { "tour_id": 57, "name": "Classic Shared Tour", "type": "shared" }
      ]
    }
  ],
  "note": "Discount applies to the tour price only (tour + boat for private). Transfer, insurance and extras are full price.",
  "updated_at": "2026-10-05T07:12:00.000000Z"
}
```

### Правила low season

- Скидка действует, если дата тура попадает в `[date_start, date_end]` (включительно) активного правила, привязанного к туру.
- Скидка только на стоимость тура (`tier_price` + `boat_price` для private). Трансфер, cover (insurance) и extras — по полной цене.
- Сумма скидки = `round((tier_price + boat_price) × percent / 100)`.
- Если на дату попадает несколько правил — берётся максимальный `percent`.
- `/quote` уже возвращает цену со скидкой (`breakdown.boat_base_price`, `total_price`). Сайт по `booking_url` применит ту же скидку сам.
- В списке только туры сайта (`source_id = 1`, не `disabled`); правила без таких туров не показываются.

---

## Ошибки

| HTTP | Тело | Причина |
|------|------|---------|
| `401` | `{ "error": "Unauthorized" }` | Неверный API ключ |
| `404` | `{ "success": false, "error": "Tour not found" }` | `tour_id` не найден |
| `422` | `{ "success": false, "error": "date (YYYY-MM-DD) is required" }` | Отсутствует/невалиден `date` в `/availability` |
| `500` | HTML | Серверная ошибка |
