# Bluuu Chatbot API — Документация по интеграции

## 1. Эндпоинты

**Базовый URL (production):** `https://bluuu.tours`

Staging-окружения нет. API работает с живыми данными CMS.

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| GET | `/api/chatbot/boats/private` | Все активные приватные лодки + маршруты + дополнения |
| GET | `/api/chatbot/boats/shared` | Все активные лодки на групповых турах |
| POST | `/api/chatbot/quote` | Расчёт итоговой цены по выбранным параметрам |

---

## 2. Аутентификация

Все запросы требуют API-ключ. Срока действия нет — ключ статический, меняется вручную.

| Способ | Формат |
|--------|--------|
| Заголовок (рекомендуется) | `X-Api-Key: <ключ>` |
| Query-параметр | `?api_key=<ключ>` |

**Пример:**
```http
GET /api/chatbot/boats/private HTTP/1.1
Host: bluuu.tours
X-Api-Key: bluuu-chatbot-2026
```

**Смена ключа:** обновить `CHATBOT_API_KEY` в файле `.env` на сервере.

---

## 3. Логика ценообразования

### Приватные туры — цена за лодку

**Формула:**
```
итого = pricelist[N].price + boat_price
```

- `pricelist[N].price` — значение из тарифной сетки для нужного количества гостей
- `boat_price` — фиксированная надбавка за лодку (`pricing.boat_price`)

**Как рассчитать для N гостей:**
1. Проверить `pricing.seasonal_prices[]` — если дата бронирования в диапазоне `date_start`/`date_end`, использовать `pricelist` и `boat_price` этого периода
2. Иначе — использовать `pricing.packages[0].pricelist` и `pricing.boat_price`
3. Найти строку с максимальным `members_count <= N`
4. **Итого = `price` этой строки + `boat_price`**
5. Разделить на N для цены на человека

**Флаги:**
- `low_price: true` → низкий сезон
- `flash_sale: true` → акционная цена

### Групповые туры — цена за гостя

Цена берётся из `pricelist[N].price` (та же логика, без `boat_price`).

### Дополнения (extras) — только для приватных

Корневой массив `extras`. Плоская цена `price` в IDR. Если `has_options: true` — выбор из `options[]`.

### Валюта

Все цены в **IDR**. Налоги не добавляются — цены финальные.
Эндпоинт `/quote` возвращает также пересчёт в **USD** (по актуальному курсу из CMS).

---

## 4. GET `/api/chatbot/boats/private`

Возвращает все активные приватные лодки + маршруты + дополнения.

```bash
curl https://bluuu.tours/api/chatbot/boats/private \
  -H "X-Api-Key: bluuu-chatbot-2026"
```

**Ответ `200 OK`:**
```json
{
  "boats": [
    {
      "id": 1,
      "name": "Classic Boat",
      "slug": "classic-boat",
      "description": "Fast, reliable, open-deck boat.",
      "size": "11M",
      "capacity": 12,
      "currency": "IDR",
      "status": "ready",
      "categories": ["Boats", "For small group"],
      "features": {
        "shade": "Partial shade",
        "cabin": false,
        "ac": false,
        "sound": null,
        "toilet": false
      },
      "best_for": "Small groups, budget-friendly",
      "boat_type": "speedboat",
      "pricing": {
        "type": "per_boat",
        "boat_price": 200000,
        "packages": [
          {
            "name": "Standard",
            "pricelist": [
              { "members_count": 1, "price": 1550000 },
              { "members_count": 4, "price": 1750000 },
              { "members_count": 8, "price": 2100000 }
            ]
          }
        ],
        "seasonal_prices": [
          {
            "date_start": "2026-06-01",
            "date_end": "2026-08-31",
            "boat_price": 250000,
            "low_price": false,
            "flash_sale": false,
            "packages": {
              "name": "High Season",
              "pricelist": [
                { "members_count": 1, "price": 1750000 },
                { "members_count": 4, "price": 2000000 }
              ]
            }
          }
        ]
      },
      "images": ["https://bluuu.tours/storage/..."]
    }
  ],
  "routes": [
    {
      "id": 5,
      "title": "Classic Route",
      "slug": "classic-route",
      "description": "All top spots in one action-packed day.",
      "map": "https://bluuu.tours/storage/.../map.webp",
      "restaurant": {
        "id": 2,
        "name": "Amarta Penida Restaurant",
        "menu": "https://..."
      }
    }
  ],
  "extras": [
    {
      "id": 10,
      "name": "Photographer",
      "description": "Professional underwater photographer.",
      "price": 750000,
      "currency": "IDR",
      "category": "Photography",
      "has_options": false,
      "options": []
    },
    {
      "id": 11,
      "name": "Beers & Cider",
      "price": 55000,
      "currency": "IDR",
      "category": "Drinks",
      "has_options": true,
      "options": [
        { "id": 12, "name": "Bali Sip Hard Seltzer", "price": 55000 },
        { "id": 13, "name": "Bintang Beer", "price": 45000 }
      ]
    }
  ],
  "updated_at": "2026-03-18T10:00:00.000000Z"
}
```

### Поля лодки

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | int | Уникальный ID |
| `name` | string | Название |
| `slug` | string | URL-идентификатор |
| `size` | string | Длина, напр. `"12M"` |
| `capacity` | int | Максимум гостей |
| `currency` | string | Всегда `"IDR"` |
| `status` | string | `"ready"` или `"soon"` |
| `categories` | string[] | Категории |
| `features.shade` | string | `"Full shade + flybridge"` или `"Partial shade"` |
| `features.cabin` | bool | Каюта |
| `features.ac` | bool | Кондиционер |
| `features.sound` | string\|null | `"Bose sound"` или `null` |
| `features.toilet` | bool | Туалет |
| `best_for` | string\|null | Рекомендуемый тип группы |
| `boat_type` | string\|null | Тип лодки |
| `pricing` | object | Ценообразование |
| `images` | string[] | До 3 URL изображений |

### Поля pricing

| Поле | Тип | Описание |
|------|-----|----------|
| `pricing.type` | string | `"per_boat"` |
| `pricing.boat_price` | int | Надбавка за лодку в IDR |
| `pricing.packages[].name` | string | Название пакета |
| `pricing.packages[].pricelist` | array | `[{members_count, price}]` |
| `pricing.seasonal_prices[].date_start` | string | `"YYYY-MM-DD"` |
| `pricing.seasonal_prices[].date_end` | string | `"YYYY-MM-DD"` |
| `pricing.seasonal_prices[].low_price` | bool | Низкий сезон |
| `pricing.seasonal_prices[].flash_sale` | bool | Акция |
| `pricing.seasonal_prices[].packages` | object\|null | Переопределённый пакет |

---

## 5. GET `/api/chatbot/boats/shared`

Возвращает все активные групповые туры.

```bash
curl https://bluuu.tours/api/chatbot/boats/shared \
  -H "X-Api-Key: bluuu-chatbot-2026"
```

**Ответ `200 OK`:**
```json
{
  "boats": [
    {
      "id": 20,
      "name": "Classic shared tour",
      "slug": "classic-shared",
      "size": "12M",
      "capacity": 14,
      "currency": "IDR",
      "status": "ready",
      "categories": ["Shared"],
      "features": { "shade": "Partial shade", "cabin": false, "ac": false, "sound": null, "toilet": false },
      "pricing": {
        "type": "per_guest",
        "boat_price": 0,
        "packages": [
          { "name": "Standard", "pricelist": [{ "members_count": 1, "price": 1390000 }] }
        ],
        "seasonal_prices": []
      },
      "route": { "id": 5, "title": "Classic Route", "slug": "classic-route" },
      "restaurant": { "id": 2, "name": "Amarta Penida Restaurant", "menu": "https://..." },
      "images": ["https://bluuu.tours/storage/..."]
    }
  ],
  "updated_at": "2026-03-18T10:00:00.000000Z"
}
```

Поля те же, что у приватных, кроме:

| Поле | Описание |
|------|----------|
| `pricing.type` | `"per_guest"` — цена за человека |
| `route` | Привязанный маршрут |
| `restaurant` | Ресторан для обеда |

---

## 6. POST `/api/chatbot/quote`

Расчёт итоговой стоимости по выбранным параметрам. Возвращает цены в **IDR и USD**.

```bash
curl -X POST https://bluuu.tours/api/chatbot/quote \
  -H "X-Api-Key: bluuu-chatbot-2026" \
  -H "Content-Type: application/json" \
  -d '{
    "tour_id": 1,
    "date": "2026-06-15",
    "guests": 4,
    "transfer": 2,
    "insurance": null,
    "extras": [
      { "extra_id": 10, "quantity": 1 }
    ]
  }'
```

### Параметры запроса

| Поле | Тип | Обязательный | Описание |
|------|-----|-------------|----------|
| `tour_id` | int | ✅ | ID тура из `/boats/private` или `/boats/shared` |
| `date` | string | ✅ | Дата бронирования `"YYYY-MM-DD"` |
| `guests` | int | ✅ | Количество гостей |
| `transfer` | int\|null | ❌ | ID трансфера (из `/api/new/transfers`) |
| `insurance` | int\|null | ❌ | ID страховки (из `/api/new/covers`) |
| `extras` | array | ❌ | Дополнения `[{extra_id, quantity}]` |

### Ответ `200 OK`

```json
{
  "success": true,
  "currency_idr": {
    "total_price": 2700000,
    "price_per_pax": 675000,
    "breakdown": {
      "boat_base_price": 1950000,
      "transfer": 0,
      "insurance": 0,
      "extras_total": 750000,
      "extras": [
        { "extra_id": 10, "name": "Photographer", "qty": 1, "unit_price_idr": 750000, "subtotal_idr": 750000 }
      ],
      "final_total": 2700000
    }
  },
  "currency_usd": {
    "rate": 16200,
    "total_price": 167,
    "price_per_pax": 42,
    "breakdown": {
      "boat_base_price": 120,
      "transfer": 0,
      "insurance": 0,
      "extras_total": 46,
      "final_total": 167
    }
  },
  "meta": {
    "tour_id": 1,
    "tour_name": "Classic Boat",
    "tour_type": "private",
    "date": "2026-06-15",
    "guests": 4
  }
}
```

> `currency_usd` = `null` если курс USD не настроен в CMS.

**Формула `boat_base_price`:**
- Находим активный `pricelist` (с учётом сезонных цен по дате)
- Берём тир с максимальным `members_count <= guests`
- `boat_base_price = tir.price + boat_price`

---

## 7. Ошибки

| HTTP-код | Тело | Причина |
|----------|------|---------|
| `401` | `{"error": "Unauthorized"}` | Неверный или отсутствующий API-ключ |
| `404` | `{"success": false, "error": "Tour not found"}` | Тур не найден (только `/quote`) |
| `500` | Страница ошибки | Серверная ошибка — обратитесь в Bluuu |

---

## 8. Производительность

- **Rate limit отсутствует**
- **Время ответа:** < 500 мс
- Пагинации нет — полный снимок данных за один запрос

---

## 9. Тестирование

**API-ключ:** `bluuu-chatbot-2026`

```bash
# Приватные лодки
curl https://bluuu.tours/api/chatbot/boats/private -H "X-Api-Key: bluuu-chatbot-2026"

# Групповые туры
curl https://bluuu.tours/api/chatbot/boats/shared -H "X-Api-Key: bluuu-chatbot-2026"

# Расчёт цены
curl -X POST https://bluuu.tours/api/chatbot/quote \
  -H "X-Api-Key: bluuu-chatbot-2026" \
  -H "Content-Type: application/json" \
  -d '{"tour_id":1,"date":"2026-06-15","guests":4,"extras":[{"extra_id":10,"quantity":1}]}'
```

Sandbox отсутствует — тестирование на production. Данные живые.

---

## 10. Идентификаторы

- Используйте `id` (int) — `slug` может измениться при редактировании в CMS
- Приватные лодки: `classes_id = 8` внутри системы
- Групповые туры: `classes_id = 9`
- Маршруты общие — `id` маршрута из `/boats/private` совпадает с `route.id` у лодок

---

## 11. Безопасность

- Только HTTPS (TLS 1.2+)
- IP-вайтлистинг не применяется
- Ключ приватный — не публиковать в клиентском коде
- Смена ключа: обратитесь в Bluuu

---

## 12. Что включено

| Данные | Включено? |
|--------|-----------|
| Информация о лодках/турах | ✅ |
| Цены (стандартные + сезонные) | ✅ |
| Дополнения (extras) с ценами | ✅ (только приватный эндпоинт) |
| Маршруты (itineraries) | ✅ (только приватный эндпоинт) |
| Рестораны | ✅ |
| Расчёт итоговой цены (IDR + USD) | ✅ `/quote` |
| Доступность по датам | ❌ — используйте `/api/new/availability/private/{id}` |
| Налоги / сборы | ❌ — цены финальные |
| Создание заказов | ❌ |
