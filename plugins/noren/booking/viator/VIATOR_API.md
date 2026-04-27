# Viator Supplier API — Инструкция по интеграции

Оператор-hosted модель Viator Supplier API v2.0.  
Viator вызывает наши эндпоинты при поиске туров, проверке доступности и оформлении заказов.

---

## Конфигурация

```
VIATOR_API_KEY=TPE_6ksS7xfc47PCvbaq-8NVZtrgJGW6hwavp12dG8M
VIATOR_SUPPLIER_ID=4000500
```

Заголовок каждого запроса от Viator:

```
X-API-Key: TPE_6ksS7xfc47PCvbaq-8NVZtrgJGW6hwavp12dG8M
Content-Type: application/json
```

При неверном ключе — ответ `401 Unauthorized`.

---

## Certification Testing — Endpoints

| Endpoint | Sandbox | Production |
|----------|---------|------------|
| AVAILABILITY CHECK | `https://bluuu.tours/viator/v2/availability/check` | `https://bluuu.tours/viator/v2/availability/check` |
| CALENDAR | `https://bluuu.tours/viator/v2/availability/calendar` | `https://bluuu.tours/viator/v2/availability/calendar` |
| RESERVE | `https://bluuu.tours/viator/v2/reserve` | `https://bluuu.tours/viator/v2/reserve` |
| SPECIAL OFFERS | Unsupported | Unsupported |

Viator notification endpoints (настроить у себя):

| Endpoint | Sandbox | Production |
|----------|---------|------------|
| EVENT NOTIFICATION | `https://toursgds.sandbox.viator.com/v2/notification/events` | `https://www.toursgds.com/v2/notification/events` |
| SPECIAL OFFERS NOTIFICATION | `https://toursgds.sandbox.viator.com/v2/notification/special-offers` | `https://www.toursgds.com/v2/notification/special-offers` |

---

## Продукты и опции (реальные данные)

### Product 1: `premium-all-inclusive-nusa-penida-full-day-tour-bali-viator`
Premium All Inclusive Nusa Penida Full Day Tour from Bali — 182013P1

| productOptionId | Название | Тур ID |
|-----------------|---------|--------|
| `premium-shared-transfer-tg6-viator` | Premium Shared with Transfer (TG6) | 60 |
| `classic-shared-transfer-tg1-viator` | Classic Shared with Transfer (TG1) | 61 |
| `private-boat-no-land-tour-tg5-viator` | Private Boat (No Land Tour) (TG5) | 62 |
| `private-boat-land-tour-tg4-viator` | Private Boat with Land Tour (TG4) | 63 |

### Product 2: `bali-nusa-penida-premium-private-full-day-tour-all-inclusive-viator-182013p15`
Bali to Nusa Penida: Premium Private Full Day Tour — 182013P15

| productOptionId | Название | Тур ID |
|-----------------|---------|--------|
| `premium-land-tour-tg5-viator` | Premium with Land Tour (TG5) | 64 |
| `standard-land-tour-tg4-viator` | Standard with Land Tour (TG4) | 65 |
| `premium-without-land-tour-tg3-viator` | Premium without Land Tour (TG3) | 66 |
| `standard-without-land-tour-tg1-viator` | Standard without Land Tour (TG1) | 67 |

### Product 3: `nusa-penida-full-day-tour-riki-j-yacht-13-meters-viator-182013p21`
Nusa Penida Full Day Tour by Riki J Yacht 13 meters — 182013P21

| productOptionId | Название | Тур ID |
|-----------------|---------|--------|
| `nusa-penida-full-day-tour-riki-j-yacht-13-meters-viator` | Nusa Penida Full Day Tour by Riki J Yacht 13 meters | 68 |

### Product 4: `full-day-nusa-penida-honey-milk-yacht-13-meters-viator-182013p22`
Full Day Nusa Penida by Honey Milk Yacht 13 meters — 182013P22

| productOptionId | Название | Тур ID |
|-----------------|---------|--------|
| `full-day-nusa-penida-honey-milk-yacht-15-meters-tg1-viator` | Full Day Nusa Penida by Honey Milk Yacht 15 meters (TG1) | 69 |

---

## Certification Testing — Product Option Profiles

Все наши продукты: `LIMITED` capacity, `PER_PERSON_PRICE`, ticket types ADULT/CHILD/YOUTH/SENIOR + INFANT=0, `SHARED` quantityType, startTime `08:00`.

| Test # | Профиль | productOptionId |
|--------|---------|-----------------|
| 2 | LIMITED, PER_PERSON_PRICE, AVAILABLE, ADULT+CHILD, SHARED, MULTIPLE startTimes | `classic-shared-transfer-tg1-viator` |
| 11 | LIMITED, PER_PERSON_PRICE, AVAILABLE, MULTIPLE types, MULTIPLE startTimes, RRP>0 | `classic-shared-transfer-tg1-viator` |
| 16 | LIMITED, PER_PERSON_PRICE, UNAVAILABLE (SOLD_OUT), MULTIPLE types, MULTIPLE startTimes | `premium-shared-transfer-tg6-viator` |
| 20 | LIMITED, PER_PERSON_PRICE, UNAVAILABLE, MULTIPLE types, MULTIPLE startTimes | `nusa-penida-full-day-tour-riki-j-yacht-13-meters-viator` |
| 12 | LIMITED, PER_PERSON_PRICE, AVAILABLE, MULTIPLE types, SHARED, NO startTimes | Unsupported — у нас всегда есть startTime |
| 21–29 | PER_UNIT_PRICE | Unsupported |
| 31–40 | TIERED_PER_PERSON_PRICE | Unsupported |
| 41–42 | UNSUPPORTED_PRICE | Unsupported |
| 43–56 | UNLIMITED capacity | Unsupported — все туры LIMITED |
| 59 | SPECIAL OFFERS | Unsupported |

> Для AVAILABLE сценариев (профили 2, 11) нужно привязать лодки к турам ID 60–69 в admin panel.

---

## Проблема: туры без привязанных лодок

Все Viator-туры (ID 60–69) возвращают `original: 0, remaining: 0` → SOLD_OUT.  
Причина: в таблице `noren_booking_tours_boat` нет записей для этих туров.

**Проверить:**
```sql
SELECT t.id, t.name, COUNT(tb.boat_id) as boats_count
FROM noren_booking_tours t
LEFT JOIN noren_booking_tours_boat tb ON tb.tour_id = t.id
WHERE t.id IN (60, 61, 62, 63, 64, 65, 66, 67, 68, 69)
GROUP BY t.id, t.name;
```

**Исправить:** admin → Booking → Tours → каждый Viator-тур → вкладка Boats → прикрепить нужную лодку.

Логика расчёта вместимости (shared туры):
- `available` = сумма `boat.capacity` по всем привязанным лодкам без closeddates на дату
- `original` = сумма `boat.capacity` по всем лодкам

---

## Пример реального ответа — Availability Check

```
POST https://bluuu.tours/viator/v2/availability/check
X-API-Key: TPE_6ksS7xfc47PCvbaq-8NVZtrgJGW6hwavp12dG8M

{
  "travelDate": "2026-05-15",
  "totalTravelers": 2,
  "productOptions": [
    { "productOptionId": "classic-shared-transfer-tg1-viator" }
  ]
}
```

```json
{
  "productOptions": [
    {
      "productOptionId": "classic-shared-transfer-tg1-viator",
      "currency": "IDR",
      "events": [
        {
          "status": "UNAVAILABLE",
          "unavailableReason": "SOLD_OUT",
          "startTime": "08:00",
          "capacity": {
            "type": "LIMITED",
            "vacancies": [
              {
                "types": ["ADULT", "CHILD", "YOUTH", "SENIOR", "INFANT"],
                "quantity": 0,
                "quantityType": "SHARED"
              }
            ],
            "original": 0,
            "remaining": 0
          },
          "bookingCutoff": "2026-05-14T23:59:59+00:00"
        }
      ]
    }
  ]
}
```

Когда лодки будут привязаны и доступны — `status` станет `AVAILABLE`, добавится `price`:

```json
{
  "status": "AVAILABLE",
  "startTime": "08:00",
  "capacity": {
    "type": "LIMITED",
    "vacancies": [{ "types": ["ADULT","CHILD","YOUTH","SENIOR","INFANT"], "quantity": 20, "quantityType": "SHARED" }],
    "original": 20,
    "remaining": 20
  },
  "bookingCutoff": "2026-05-14T23:59:59+00:00",
  "price": {
    "type": "PER_PERSON_PRICE",
    "prices": [
      { "types": ["ADULT","CHILD","YOUTH","SENIOR"], "retailPrice": 2090000 },
      { "types": ["INFANT"], "retailPrice": 0 }
    ]
  }
}
```

---

## Пример реального ответа — Calendar

```
POST https://bluuu.tours/viator/v2/availability/calendar
X-API-Key: TPE_6ksS7xfc47PCvbaq-8NVZtrgJGW6hwavp12dG8M

{
  "productOptionIds": ["classic-shared-transfer-tg1-viator"],
  "startDate": "2026-05-01",
  "endDate": "2026-05-31"
}
```

Цена `premium-shared-transfer-tg6-viator` из реального ответа: **2 090 000 IDR** per person.

---

## Эндпоинты — полный список

| Метод | Путь | Описание |
|-------|------|---------|
| POST | `/viator/tourlist` | Каталог туров (v1.0) |
| POST | `/viator/v2/availability/check` | Доступность на дату |
| POST | `/viator/v2/availability/calendar` | Доступность на диапазон (макс. 92 дня) |
| POST | `/viator/v2/reserve` | Холд мест на 20 минут |
| POST | `/viator/v2/booking` | Создание заказа |
| POST | `/viator/v2/booking-amendment` | Изменение заказа |
| POST | `/viator/v2/booking-cancellation` | Отмена заказа |
| POST | `/viator/v2/redemption` | Статус использования |

---

## Reserve

**Запрос:**
```json
{
  "productOptionId": "classic-shared-transfer-tg1-viator",
  "travelDate": "2026-05-15",
  "totalTravelers": 2,
  "tickets": [
    { "type": "ADULT", "quantity": 2 }
  ]
}
```

**Ответ (успех):**
```json
{
  "status": "RESERVED",
  "expiration": "2026-05-15T08:20:00+00:00",
  "reference": "BLU-RES-abc123",
  "currency": "IDR",
  "price": {
    "type": "PER_PERSON_PRICE",
    "prices": [
      { "types": ["ADULT","CHILD","YOUTH","SENIOR"], "retailPrice": 2090000 },
      { "types": ["INFANT"], "retailPrice": 0 }
    ]
  }
}
```

**Ответ (нет мест):**
```json
{ "status": "NOT_RESERVED", "reason": "SOLD_OUT" }
```

> `reference` передаётся в `/booking` как `availabilityHoldReference`. TTL — 20 минут.

---

## Booking

**Запрос:**
```json
{
  "productOptionId": "classic-shared-transfer-tg1-viator",
  "travelDate": "2026-05-15",
  "availabilityHoldReference": "BLU-RES-abc123",
  "viatorConfirmationNumber": "VTR-123456789",
  "travelerMix": [
    { "firstName": "John", "lastName": "Doe", "type": "ADULT", "email": "john@example.com", "phone": "+1234567890" },
    { "firstName": "Jane", "lastName": "Doe", "type": "ADULT" }
  ]
}
```

**Ответ:**
```json
{
  "status": "CONFIRMED",
  "supplierConfirmationNumber": "BLU-187",
  "viatorConfirmationNumber": "VTR-123456789",
  "bookingId": 187
}
```

Типы туристов:

| Тип | Считается как |
|-----|--------------|
| ADULT, SENIOR | adults |
| CHILD, YOUTH | kids |
| INFANT | children (цена 0) |

---

## Booking Amendment

```json
{
  "supplierConfirmationNumber": "BLU-187",
  "amendment": {
    "travelDate": "2026-05-20",
    "leadTravelerName": "John Smith",
    "totalTravelers": 3
  }
}
```
→ `{ "status": "AMENDED", "supplierConfirmationNumber": "BLU-187" }`

---

## Booking Cancellation

```json
{
  "supplierConfirmationNumber": "BLU-187",
  "reason": "Customer requested cancellation"
}
```
→ `{ "status": "CANCELLED", "supplierConfirmationNumber": "BLU-187" }` → `status_id = 3`

---

## Redemption

```json
{ "supplierConfirmationNumber": "BLU-187" }
```
→ `{ "status": "REDEEMED" / "NOT_REDEEMED", "travelDate": "...", "tourId": 61 }`

---

## Хранение заказов

Viator-заказы сохраняются в `noren_booking_order` с `source_id = 2`.  
Поле `requests` (JSON):

```json
{
  "source": "viator",
  "viatorConfirmationNumber": "VTR-123456789",
  "holdReference": "BLU-RES-abc123",
  "startTime": "08:00",
  "currency": "IDR"
}
```

`supplierConfirmationNumber` = `BLU-{order.id}`.  
Поиск заказа: по `external_id` или по `BLU-{id}`.

---

## Файлы

```
plugins/noren/booking/viator/
├── ViatorController.php   — логика всех эндпоинтов
├── routes.php             — регистрация маршрутов
└── VIATOR_API.md          — эта инструкция
```
