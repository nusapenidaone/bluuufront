# Viator Supplier API — Инструкция по интеграции

Эти эндпоинты реализуют **Operator-Hosted** модель Viator Supplier API v2.0.  
Viator вызывает наши эндпоинты при поиске туров, проверке доступности и оформлении заказов.

---

## Настройка

Добавить в `.env`:

```
VIATOR_API_KEY=your_secret_key_from_viator
VIATOR_SUPPLIER_ID=12345
```

- `VIATOR_API_KEY` — ключ, который Viator будет передавать в заголовке каждого запроса
- `VIATOR_SUPPLIER_ID` — числовой ID оператора в системе Viator

---

## Аутентификация

Каждый запрос от Viator должен содержать заголовок:

```
X-API-Key: <VIATOR_API_KEY>
Content-Type: application/json
```

При неверном ключе — ответ `401 Unauthorized`.

---

## Эндпоинты

### 1. Tour List
**`POST /viator/tourlist`**

Возвращает каталог туров для маппинга в системе Viator.  
Viator вызывает этот эндпоинт при первоначальной настройке интеграции.

**Запрос:** тело не требуется.

**Ответ:**
```json
{
  "supplierId": 12345,
  "products": [
    {
      "supplierProductCode": "42",
      "supplierOptionCode": "nusa-penida-private",
      "productOptionId": "nusa-penida-private",
      "name": "Nusa Penida Private Tour",
      "type": "PRIVATE",
      "capacity": 8,
      "duration": "8 hours",
      "active": true
    }
  ]
}
```

---

### 2. Availability Check
**`POST /viator/v2/availability/check`**

Проверяет доступность и цену для конкретной даты и числа туристов.

**Запрос:**
```json
{
  "supplierId": 12345,
  "productOptions": [
    {
      "productOptionId": "nusa-penida-private",
      "startTimes": ["08:00"]
    }
  ],
  "travelDate": "2026-05-15",
  "tickets": [
    { "type": "ADULT", "quantity": 2 }
  ],
  "totalTravelers": 2
}
```

**Ответ (доступно):**
```json
{
  "supplierId": 12345,
  "travelDate": "2026-05-15",
  "productOptions": [
    {
      "productOptionId": "nusa-penida-private",
      "status": "AVAILABLE",
      "capacity": { "type": "LIMITED", "remaining": 6 },
      "bookingCutoff": "2026-05-14T23:59:59+00:00",
      "price": {
        "type": "PER_PERSON_PRICE",
        "types": [
          { "type": "ADULT",  "retailPrice": 850000, "netPrice": 850000 },
          { "type": "CHILD",  "retailPrice": 850000, "netPrice": 850000 },
          { "type": "INFANT", "retailPrice": 0,      "netPrice": 0 }
        ],
        "currency": "IDR"
      },
      "startTimes": ["08:00"]
    }
  ]
}
```

**Статусы:** `AVAILABLE` / `UNAVAILABLE`  
**Причины недоступности:** `PRODUCT_NOT_FOUND`

---

### 3. Availability Calendar
**`POST /viator/v2/availability/calendar`**

Доступность на диапазон дат (максимум 92 дня).

**Запрос:**
```json
{
  "supplierId": 12345,
  "productOptionIds": ["nusa-penida-private"],
  "startDate": "2026-05-01",
  "endDate": "2026-07-31"
}
```

**Ответ:**
```json
{
  "supplierId": 12345,
  "startDate": "2026-05-01",
  "endDate": "2026-07-31",
  "products": [
    {
      "productOptionId": "nusa-penida-private",
      "calendar": [
        {
          "date": "2026-05-01",
          "available": true,
          "vacancies": 8,
          "price": { "type": "PER_PERSON_PRICE", "amount": 850000, "currency": "IDR" }
        },
        {
          "date": "2026-05-02",
          "available": false,
          "vacancies": 0,
          "price": { "type": "PER_PERSON_PRICE", "amount": 850000, "currency": "IDR" }
        }
      ]
    }
  ]
}
```

---

### 4. Reserve
**`POST /viator/v2/reserve`**

Холд мест на 20 минут пока клиент оформляет заказ на стороне Viator.

**Запрос:**
```json
{
  "supplierId": 12345,
  "productOptionId": "nusa-penida-private",
  "startTime": "08:00",
  "travelDate": "2026-05-15",
  "tickets": [
    { "type": "ADULT", "quantity": 2 }
  ],
  "totalTravelers": 2
}
```

**Ответ (успех):**
```json
{
  "status": "RESERVED",
  "reference": "viator_hold_6823a1f4b3e2a",
  "expiration": "2026-04-02T12:20:00+00:00",
  "price": {
    "type": "PER_PERSON_PRICE",
    "pricePerPerson": 850000,
    "total": 1700000,
    "currency": "IDR"
  }
}
```

**Ответ (нет мест):**
```json
{
  "status": "NOT_RESERVED",
  "reason": "INSUFFICIENT_AVAILABILITY",
  "available": 1
}
```

> `reference` нужно передать в `/booking` как `availabilityHoldReference`.

---

### 5. Booking
**`POST /viator/v2/booking`**

Создаёт подтверждённый заказ после оплаты на стороне Viator.

**Запрос:**
```json
{
  "supplierId": 12345,
  "productOptionId": "nusa-penida-private",
  "travelDate": "2026-05-15",
  "startTime": "08:00",
  "viatorConfirmationNumber": "VTR-123456789",
  "availabilityHoldReference": "viator_hold_6823a1f4b3e2a",
  "travelerMix": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "type": "ADULT",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    {
      "firstName": "Jane",
      "lastName": "Doe",
      "type": "ADULT"
    }
  ],
  "totalPrice": 1700000,
  "currency": "IDR"
}
```

**Ответ:**
```json
{
  "status": "CONFIRMED",
  "supplierConfirmationNumber": "bluuu1746352800",
  "viatorConfirmationNumber": "VTR-123456789",
  "bookingId": 187
}
```

> `supplierConfirmationNumber` — это наш `external_id` заказа. Используется во всех последующих запросах.

**Типы туристов:**
| Тип | Описание |
|-----|----------|
| `ADULT` | Взрослый |
| `SENIOR` | Пожилой (считается как adults) |
| `CHILD` / `YOUTH` | Ребёнок 3–11 (kids) |
| `INFANT` | Младенец 0–2 (children, цена 0) |

---

### 6. Booking Amendment
**`POST /viator/v2/booking-amendment`**

Изменяет существующий заказ.

**Запрос:**
```json
{
  "supplierId": 12345,
  "supplierConfirmationNumber": "bluuu1746352800",
  "amendment": {
    "travelDate": "2026-05-20",
    "leadTravelerName": "John Smith",
    "totalTravelers": 3
  }
}
```

Все поля в `amendment` — опциональные. Передавайте только то, что меняется.

**Ответ:**
```json
{
  "status": "AMENDED",
  "supplierConfirmationNumber": "bluuu1746352800"
}
```

---

### 7. Booking Cancellation
**`POST /viator/v2/booking-cancellation`**

Отменяет заказ.

**Запрос:**
```json
{
  "supplierId": 12345,
  "supplierConfirmationNumber": "bluuu1746352800",
  "reason": "Customer requested cancellation"
}
```

**Ответ:**
```json
{
  "status": "CANCELLED",
  "supplierConfirmationNumber": "bluuu1746352800"
}
```

---

### 8. Redemption
**`POST /viator/v2/redemption`**

Проверяет, был ли заказ использован (в день тура при посадке).

**Запрос:**
```json
{
  "supplierId": 12345,
  "supplierConfirmationNumber": "bluuu1746352800",
  "viatorConfirmationNumber": "VTR-123456789"
}
```

**Ответ:**
```json
{
  "supplierConfirmationNumber": "bluuu1746352800",
  "status": "REDEEMED",
  "travelDate": "2026-05-15",
  "tourId": 42
}
```

**Статусы:** `REDEEMED` (status_id 2 или 5) / `NOT_REDEEMED`

---

## Коды ошибок

| HTTP | Описание |
|------|----------|
| 200 | Успех |
| 400 | Отсутствуют обязательные поля |
| 401 | Неверный API ключ |
| 404 | Тур или заказ не найден |
| 500 | Внутренняя ошибка сервера |

---

## Хранение данных

Viator-заказы сохраняются в обычную таблицу `noren_booking_order`.  
В поле `requests` (JSON) хранится дополнительная информация:

```json
{
  "source": "viator",
  "viatorConfirmationNumber": "VTR-123456789",
  "holdReference": "viator_hold_...",
  "startTime": "08:00",
  "currency": "IDR",
  "travelers": [...]
}
```

Для поиска заказа по нашему номеру используется поле `external_id` (формат: `bluuu{timestamp}`).

---

## Файлы

```
plugins/noren/booking/viator/
├── ViatorController.php   — логика всех эндпоинтов
├── routes.php             — регистрация маршрутов
└── VIATOR_API.md          — эта инструкция
```
