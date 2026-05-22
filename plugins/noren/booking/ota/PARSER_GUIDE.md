# OTA Parser API — Guide

**Base URL:** `https://bluuu.tours`  
**Auth:** header `Authorization: Bearer ota_bluuu_k9x2m7p4n1q8r3s6`

---

## Source IDs

| source_id | System |
|-----------|--------|
| 1 | Website (internal) |
| 2 | TripAdvisor |
| 3 | Airbnb |
| 4 | GetYourGuide |
| 9 | Klook |

---

## Parser Flow

```
1. Parser receives a booking email
2. Identifies the OTA system → gets source_id
3. GET /api/ota/tours?source_id={n}  → get list of tours for this OTA
4. Match the correct tour (by name and/or class_name)
5. GET /api/ota/tour/{id}/availability?date=...&members=...&amount=... → get ready-to-use Odoo payload
6. Create the order in Odoo using the odoo.* fields from the response
```

---

## Endpoint 1 — Tour List

```
GET /api/ota/tours?source_id={n}
```

### Example request

```bash
curl -H "Authorization: Bearer ota_bluuu_k9x2m7p4n1q8r3s6" \
     "https://bluuu.tours/api/ota/tours?source_id=4"
```

### Response

```json
[
  {
    "id": 60,
    "name": "Premium Shared Tour",
    "class_name": "Shared",
    "source_id": 4,
    "source": "GetYourGuide",
    "availability_url": "/api/ota/tour/60/availability"
  }
]
```

| Field | Description |
|-------|-------------|
| `id` | Tour ID — pass to endpoint 2 |
| `name` | Tour name — use to match against the booking email |
| `class_name` | Tour class (`"Shared"` or `"Private"`) |
| `source_id` | Source ID (same as the filter parameter) |
| `source` | Source name (e.g. `"GetYourGuide"`, `"Klook"`) |
| `availability_url` | Ready-made URL for endpoint 2 — append `?date=...&members=...&amount=...` |

---

## Endpoint 2 — Availability + Odoo Payload

```
GET /api/ota/tour/{id}/availability?date=YYYY-MM-DD&members={n}&amount={total}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | int | Tour ID from endpoint 1 |
| `date` | string | Tour date `YYYY-MM-DD` |
| `members` | int | Total number of people (adults + kids) |
| `amount` | float | Total price from OTA email (before any deductions) |

### Example request

```bash
curl -H "Authorization: Bearer ota_bluuu_k9x2m7p4n1q8r3s6" \
     "https://bluuu.tours/api/ota/tour/60/availability?date=2026-06-15&members=8&amount=10000000"
```

### Response (with transfer)

```json
{
  "tour_id": 60,
  "date": "2026-06-15",
  "members": 8,
  "available": true,
  "source": "GetYourGuide",
  "odoo": {
    "x_studio_tour_type": "Premium Shared",
    "x_studio_route_new": "Premium Shared Tour",
    "x_studio_lunch": "La Rossa Restaurant",
    "x_studio_boat_name": "Honey Milk Boat",
    "x_studio_source": "GetYourGuide",
    "x_studio_payment_source": "GetYourGuide",
    "company_id": 5,
    "rental_start_date": "2026-06-14 23:00:00",
    "rental_return_date": "2026-06-15 09:00:00",
    "x_studio_deposit": 7000000,
    "x_studio_car_type": "Private Hi-Ace",
    "x_studio_pickup_cars": 2,
    "x_studio_drop_off_cars": 2,
    "order_lines": [
      { "product_id": 505,  "name": "Premium Shared Tour",   "qty": 8, "price": 725000 },
      { "product_id": 1201, "name": "Honey Milk Boat",       "qty": 1, "price": 0 },
      { "product_id": 1524, "name": "La Rossa Restaurant",   "qty": 8, "price": 0 },
      { "product_id": 22,   "name": "Private Pick up & Drop off", "qty": 2, "price": 600000 }
    ]
  }
}
```

### Response fields

| Field | Description |
|-------|-------------|
| `available` | `true` — a boat with enough seats was found; `false` — all boats are full |
| `odoo.x_studio_deposit` | Net amount after OTA commission — send directly as deposit to Odoo |
| `odoo.x_studio_car_type` | Car type for transfer → Odoo `x_studio_car_type` *(only if tour has transfer)* |
| `odoo.x_studio_pickup_cars` | Number of pickup cars → Odoo `x_studio_pickup_cars` *(only if tour has transfer)* |
| `odoo.x_studio_drop_off_cars` | Number of drop-off cars → Odoo `x_studio_drop_off_cars` *(only if tour has transfer)* |
| `odoo.x_studio_tour_type` | Tour type → Odoo `x_studio_tour_type` |
| `odoo.x_studio_route_new` | Route name → Odoo `x_studio_route_new` |
| `odoo.x_studio_lunch` | Restaurant → Odoo `x_studio_lunch` |
| `odoo.x_studio_boat_name` | Boat name → Odoo `x_studio_boat_name` |
| `odoo.x_studio_source` | OTA source name → Odoo `x_studio_source` |
| `odoo.x_studio_payment_source` | OTA source name → Odoo `x_studio_payment_source` |
| `odoo.company_id` | Odoo company ID of the boat owner |
| `odoo.rental_start_date` | Tour start datetime in **UTC** — ready to send to Odoo |
| `odoo.rental_return_date` | Tour end datetime in **UTC** — ready to send to Odoo |
| `odoo.order_lines` | Ready-made order lines (tour, boat, restaurant, transfer if applicable) |

> `rental_start_date` / `rental_return_date` are already converted from Asia/Makassar (UTC+8) to UTC.

---

## Price calculation

### Step 1 — OTA commission

Each tour has an `ota_commission` percentage. The API deducts it from `amount` automatically:

```
net_amount = amount × (1 - ota_commission / 100)
```

`x_studio_deposit` = `net_amount`

Example: 10 000 000 with 30% commission → 7 000 000

### Step 2 — Transfer cost (if tour has a default transfer)

```
cars          = ceil(members / 5)      — 1 car per 5 passengers
transfer_cost = cars × transfer.price
tour_net      = net_amount − transfer_cost
```

Example: 8 passengers, transfer price 600 000 → 2 cars → transfer_cost 1 200 000 → tour_net 5 800 000

### Step 3 — Tour order line price

| Tour type | qty | price per unit |
|-----------|-----|----------------|
| Shared | members | `round(tour_net / members, 2)` |
| Private | 1 | `tour_net` |

### order_lines summary

| Line | qty | price |
|------|-----|-------|
| Tour | members (shared) / 1 (private) | `tour_net` per unit (see above) |
| Boat | 1 | always `0` |
| Restaurant | members | always `0` |
| Transfer | cars | `transfer.price` per car *(only if tour has transfer)* |

Transfer line is added only when the tour has a `transfer_id` configured.

### Transfer cars → Odoo fields

| Transfer type | `x_studio_pickup_cars` | `x_studio_drop_off_cars` |
|---------------|------------------------|--------------------------|
| Private Pick up (id=1) | `cars` | `0` |
| Private Pick up & Drop off (id=2) | `cars` | `cars` |
| Free shuttle bus (id=3) | `0` | `0` |

---

## Boat selection logic

Tour type is determined by `types_id`: `1` = shared, `2` = private.

**Shared (`types_id=1`)** — iterates boats by pivot `sort_order ASC`, takes the first boat that:
- is not manually closed (`boat.closed = false`)
- has no `closeddates` with `type 2/3/4` on that date
- has no `closeddates` of a **different** `tour_type` (won't mix different shared tours on the same boat)
- has enough free seats: `capacity - booked_qtty >= members`

**Private (`types_id=2`)** — iterates boats by pivot `sort_order ASC`, takes the first boat with no `closeddates` on that date.

**If no suitable boat found** — `available: false`, but `odoo.x_studio_boat_name` and `order_lines` still contain the first boat of the tour. The parser can still create the order — the manager will handle it manually.

---

## What the parser adds itself

These fields are not returned by the API — the parser extracts them from the booking email:

| Odoo field | Source |
|------------|--------|
| `partner_id` | create or find partner by customer email |
| `x_studio_adults` | number of adults from the email |
| `x_studio_kids` | number of children from the email |
| `x_studio_count_of_people` | adults + kids |
| `client_order_ref` | OTA booking reference number |

> `x_studio_deposit` is now returned by the API (net amount after commission). Do **not** use the raw payment amount from the email.

---

## Full example (Klook, shared, 8 people, 30% commission, transfer id=2)

```bash
# Step 1: get Klook tours
curl -H "Authorization: Bearer ota_bluuu_k9x2m7p4n1q8r3s6" \
     "https://bluuu.tours/api/ota/tours?source_id=9"

# Step 2: check availability and get Odoo payload
curl -H "Authorization: Bearer ota_bluuu_k9x2m7p4n1q8r3s6" \
     "https://bluuu.tours/api/ota/tour/61/availability?date=2026-06-20&members=8&amount=10000000"
```

**Calculation breakdown:**
- `ota_commission` = 30% → `net_amount` = 7 000 000
- `x_studio_deposit` = 7 000 000
- Transfer: 2 cars × 600 000 = 1 200 000
- Tour net: 7 000 000 − 1 200 000 = 5 800 000
- Tour line price (shared): 5 800 000 / 8 = 725 000 per person

**Step 2 response:**

```json
{
  "tour_id": 61,
  "date": "2026-06-20",
  "members": 8,
  "available": true,
  "source": "Klook",
  "odoo": {
    "x_studio_tour_type": "Standard Shared",
    "x_studio_route_new": "Classic Shared Tour",
    "x_studio_lunch": "Amarta Penida",
    "x_studio_boat_name": "Riki J",
    "x_studio_source": "Klook",
    "x_studio_payment_source": "Klook",
    "company_id": 3,
    "rental_start_date": "2026-06-19 23:00:00",
    "rental_return_date": "2026-06-20 09:00:00",
    "x_studio_deposit": 7000000,
    "x_studio_car_type": "Private Hi-Ace",
    "x_studio_pickup_cars": 2,
    "x_studio_drop_off_cars": 2,
    "order_lines": [
      { "product_id": 480,  "name": "Classic Shared Tour",        "qty": 8, "price": 725000 },
      { "product_id": 890,  "name": "Riki J",                     "qty": 1, "price": 0 },
      { "product_id": 1100, "name": "Amarta Penida",              "qty": 8, "price": 0 },
      { "product_id": 21,   "name": "Private Pick up & Drop off", "qty": 2, "price": 600000 }
    ]
  }
}
```

---

## Errors

| HTTP | Reason |
|------|--------|
| 401 | Invalid token |
| 422 | Missing required parameter (`source_id` or `date`) |
| 404 | Tour not found |
