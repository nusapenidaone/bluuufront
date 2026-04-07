# Bluuu Chatbot API

Base URL: `https://bluuu.tours`

---

## Authentication

All requests require an API key — passed as a header or query parameter:

```
X-Api-Key: bluuu-chatbot-2026
```

or `?api_key=bluuu-chatbot-2026`

Configured in `.env`: `CHATBOT_API_KEY=bluuu-chatbot-2026`

Invalid key → `401 { "error": "Unauthorized" }`

---

## Versions

| Version | Prefix | odoo_id |
|---------|--------|---------|
| v1 | `/api/chatbot/...` | no |
| v2 | `/api/v2/chatbot/...` | everywhere |

---

## GET /api/v2/chatbot/boats/private

Returns all active private charter tours (classes_id = 8).

```
GET https://bluuu.tours/api/v2/chatbot/boats/private
X-Api-Key: bluuu-chatbot-2026
```

### Response

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

| Field | Type | Description |
|-------|------|-------------|
| `id` | int | Tour ID |
| `odoo_id` | int\|null | Odoo product ID of the tour |
| `status` | string | `ready` / `busy` / `maintenance` |
| `pricing.type` | string | Always `per_boat` for private tours |
| `pricing.boat_price` | int | Base boat surcharge (IDR) |
| `pricing.packages` | array | Default pricelist — group price by guest count |
| `pricing.seasonal_prices` | array | Seasonal overrides (future dates only) |
| `boats` | array | Physical boats with `odoo_id` and `company.odoo_id` |

**Pricing logic:** find the entry in `packages[0].pricelist` where `members_count == guests`. If the date falls within a `seasonal_prices` range — use that pricelist instead. `total = tier_price + boat_price`.

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

With variants (`has_options: true`):

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

| Field | Description |
|-------|-------------|
| `price` | Price for ≤5 guests |
| `bus_price` | Price for >5 guests (minibus), `null` if not available |

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

Returns all active shared tours (classes_id = 9).

```
GET https://bluuu.tours/api/v2/chatbot/boats/shared
X-Api-Key: bluuu-chatbot-2026
```

### Response

```json
{
  "boats": [...],
  "transfers": [...],
  "covers": [...],
  "updated_at": "2026-04-06T07:12:00.000000Z"
}
```

> Shared tours do not have a separate `routes[]` or `extras[]` array — route and restaurant are embedded directly in the tour object.

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

**Pricing logic:** `pricing.type = per_guest`. Find the entry in `pricelist` where `members_count == guests`. If the date falls within a `seasonal_prices` range — use that pricelist. `total = tier_price` (no `boat_price`).

---

## POST /api/v2/chatbot/quote

Calculates the price and returns ready-to-use data for creating an order in Odoo.

```
POST https://bluuu.tours/api/v2/chatbot/quote
X-Api-Key: bluuu-chatbot-2026
Content-Type: application/json
```

### Request parameters

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `tour_id` | int | ✓ | Tour ID (from `boats[].id`) |
| `date` | string | — | Date in `YYYY-MM-DD` format |
| `adults` | int | — | Number of adults (default: `1`) |
| `kids` | int | — | Number of children (default: `0`) |
| `guests` | int | — | Alternative to adults+kids — used if `adults` is not provided |
| `route_id` | int | — | Route ID (private tours only, from `routes[].id`) |
| `transfer` | int | — | Transfer ID (from `transfers[].id`) |
| `insurance` | int | — | Cover ID (from `covers[].id`) |
| `boat_id` | int | — | Physical boat ID (from `boats[].boats[].id`). If omitted — auto-selected by availability |
| `pickup_address` | string | — | Pickup address |
| `dropoff_address` | string | — | Drop-off address |
| `cars` | int | — | Number of cars |
| `name` | string | — | Client name |
| `email` | string | — | Client email |
| `whatsapp` | string | — | Client WhatsApp |
| `external_id` | string | — | External ID (CRM lead reference) |
| `extras` | array | — | `[{ "extra_id": int, "quantity": int }]` |

### Request example

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

### Response example

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

### Response fields

#### odoo_data.order

Ready-to-use fields for `sale.order/create` in Odoo — passed directly to OdooService.

| Field | Type | Description |
|-------|------|-------------|
| `is_rental_order` | bool | Always `true` |
| `rental_start_date` | string\|null | UTC start datetime (`YYYY-MM-DD HH:MM:SS`), calculated from `date + route.start` (Asia/Makassar → UTC) |
| `rental_return_date` | string\|null | UTC end datetime (`date + route.end`) |
| `company_id` | int\|null | Odoo company ID of the boat's company |
| `x_studio_boat_name` | string | Physical boat name |
| `x_studio_adults` | int | Number of adults |
| `x_studio_kids` | int | Number of children |
| `x_studio_count_of_people` | int | Total guests |
| `x_studio_route` | string | Route name |
| `x_studio_pickup_address` | string | Pickup address |
| `x_studio_drop_off_address` | string | Drop-off address |
| `x_studio_pickup_cars` | int | Cars for pickup |
| `x_studio_drop_off_cars` | int | Cars for drop-off (`0` if transfer type = `pickup`) |
| `x_studio_deposit` | float | Deposit — always `0` (filled in at payment) |
| `x_studio_collect` | float | Amount to collect = total price in IDR |
| `client_order_ref` | string | External ID (CRM lead) |
| `partner_name` | string | Client name (for `res.partner`) |
| `partner_email` | string | Client email |
| `partner_phone` | string | Client phone / WhatsApp |

#### odoo_data.lines

Order lines — ready for `sale.order.line/create`.

| Field | Type | Description |
|-------|------|-------------|
| `label` | string | `boat` / `tour` / `transfer` / `cover` / `extra:<name>` |
| `product_id` | int | Odoo product ID |
| `qty` | int | Quantity. For cover: `1` if `per_boat`, otherwise = guest count. For shared tours: guest count |
| `price` | float | Price in IDR. For `boat` always `0` |

#### currency_idr / currency_usd

| Field | Description |
|-------|-------------|
| `total_price` | Total amount |
| `price_per_pax` | Price per guest |
| `breakdown.boat_base_price` | Tour cost (tier_price + boat_price for private) |
| `breakdown.transfer` | Transfer cost. >5 guests → `bus_price` |
| `breakdown.insurance` | Cover cost |
| `breakdown.extras_total` | Total cost of all add-ons |
| `breakdown.extras[].odoo_id` | Odoo ID of each add-on |
| `currency_usd` | `null` if USD exchange rate is not set in the database |

#### meta

| Field | Description |
|-------|-------------|
| `tour_type` | `"private"` or `"shared"` |
| `adults` | Adults from request |
| `kids` | Children from request |
| `guests` | Total (adults + kids) |

---

## Errors

| HTTP | Body | Reason |
|------|------|--------|
| `401` | `{ "error": "Unauthorized" }` | Invalid API key |
| `404` | `{ "success": false, "error": "Tour not found" }` | `tour_id` not found |
| `500` | HTML | Server error |

---

## v1 vs v2 differences

| | v1 `/api/chatbot/...` | v2 `/api/v2/chatbot/...` |
|---|---|---|
| `odoo_id` in boats/routes/extras/transfers/covers | no | yes |
| `boats[].boats[]` (physical boats) | no | yes |
| `/quote` → `odoo_data` | no | yes |
| `/quote` → `adults` / `kids` | `guests` only | `adults` + `kids` (or `guests` as fallback) |
| `/quote` → boat selection | no | auto-selected by date and availability |
