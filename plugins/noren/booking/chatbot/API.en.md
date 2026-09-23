# Bluuu Chatbot API

Base URL: `https://bluuu.tours`

---

## Authentication

All requests require an API key, passed as a header or query parameter:

```
X-Api-Key: bluuu-chatbot-2026
```

or `?api_key=bluuu-chatbot-2026`

Set in `.env`: `CHATBOT_API_KEY=bluuu-chatbot-2026`

Wrong key → `401 { "error": "Unauthorized" }`

---

## GET /api/v2/chatbot/boats/private

Returns all active private charter tours (`types_id = 2`, `source_id = 1` — website tours only, not Viator/other OTAs).

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

| Field | Type | Description |
|------|-----|----------|
| `id` | int | Tour ID |
| `odoo_id` | int\|null | Odoo product ID of the tour |
| `status` | string | `ready` / `busy` / `maintenance` |
| `partner` | bool | `true` — a partner boat, booked "on request" (the site shows "On Request" instead of "Instant confirmation"). See CLAUDE.md "Партнёрские лодки" — when `true`, the actual booking goes through respond.io (TODO, not finished yet) |
| `perks` | array | Short checklist shown on the tour card — `{ text, icon }`, `icon` is one of `check-icon-green` / `none-icon-red` / `plus-icon-green` / `minis-icon-red` |
| `pricing.type` | string | Always `per_boat` for private |
| `pricing.boat_price` | int | Base boat surcharge (IDR) |
| `pricing.packages` | array | Default pricelist — group price by guest count |
| `pricing.seasonal_prices` | array | Seasonal overrides (future dates only) |
| `included` | array | Detailed "what's included" cards (with description and icon) — same as shown on the tour detail page |
| `includes` | array | Short "what's included" chips (name + icon only, no description) — shown on the tour card |
| `boats` | array | Physical boats with `odoo_id` and `company.odoo_id` |

**Pricing logic:** the entry with `members_count == guests` is taken from `packages[0].pricelist`. If the date falls within a `seasonal_prices` range, that pricelist is used instead. `total = tier_price + boat_price`.

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

| Field | Type | Description |
|------|-----|----------|
| `restaurant.menu_sections` | array | Structured menu by category — `[{ title, items: [{ name, description }] }]`. `[]` if not filled in the admin — fall back to `restaurant.menu` (HTML) |
| `restaurant.menu_note` | string\|null | Note shown below the menu (e.g. about drinks/extra items on request) |
| `restaurant.image` / `restaurant.images_with_thumbs` | string / array | Restaurant photos. `image` is a single fallback URL, `images_with_thumbs` is an array of `{ original, hero, thumb, thumb_small }` |
| `itinerary` | array | Timeline for the day — merges the route's `schedule_before_lunch` + `schedule_after_lunch` (same data shown in the route popup on the site). Each step is `{ time, title }`. "Or" separators between alternative activities are excluded from the timeline |
| `inclusions` | array | Route highlight chips (`route.highlights[].label`) — the same items shown as chips on the route card/popup |
| `notes` | string\|null | Extra note for the route (e.g. "Diving license required"), `null` if not set |
| `extra_categories` | array | Extras categories available specifically for this route (`route.ecategories`, each with its own `extras`, same shape as top-level `extras[]`, including `qty_type` and `conflict_ids`). **Use this field, not the top-level `extras[]`**, once the customer has picked a route — the categories and extras inside them change when the route changes (see CLAUDE.md "Extras & Ecategories") |

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

With options (`has_options: true`) and a conflict with another extra:

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

| Field | Description |
|------|----------|
| `qty_type` | How quantity would be computed if this extra were booked (see the qty_type table in CLAUDE.md): `manual` (customer enters it), `per_car` (`ceil(guests/5)`), `per_14_guests` (`ceil(guests/14)`), `per_person` (`= guests`), `fixed` (always `1`). **Neither this endpoint nor `/quote` accepts or prices extras** — see the note under `routes[]` and under `POST /quote` |
| `conflict_ids` | IDs of other extras that **cannot be selected together with this one** (in the admin, the field is "Conflicts with (cannot be selected together)" on the Extras model). Symmetric — it doesn't matter which side the conflict was configured on in the DB, `conflict_ids` shows it both ways. `options[]` (variants) have their own too. **Enforced client-side only** — the website blocks adding a second conflicting extra to the cart, but the backend doesn't validate it. Since this endpoint is just a catalog (no booking), use this field so the bot never recommends two extras to a customer when one is in the other's `conflict_ids` |

**Note:** this is the site's full extras catalog, not filtered by route. It is **not** scoped to any particular route — use `routes[].extra_categories` for that (see above). `/quote` does not support extras (see the note in that section).

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
|------|----------|
| `price` | Price for ≤5 guests |
| `bus_price` | Price for >5 guests (bus), `null` if not applicable |

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

Returns all active shared tours (`types_id = 1`, `source_id = 1` — website tours only, not Viator/other OTAs).

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

`itinerary`, `inclusions`, `notes` — same fields and logic as `routes[]` in the private endpoint (see table above), sourced from the route attached to this shared tour (`tour.route`). Shared tours have a single fixed route the customer doesn't pick, so these fields live directly on `boats[]` instead of a separate `routes[]` list.

`included`/`includes` — same fields and logic as the private endpoint (see table above): `included` is the detailed "what's included" cards with a description, `includes` is the short chip list. Don't confuse with `inclusions`, which is about the route, not the tour.

`perks` — same shape as the private endpoint (see table above).

`badge_name`/`badge_color` — promo ribbon on the tour card (e.g. "Best value"), `null` if no badge is set. Shared tours only — the site doesn't currently use this for private.

`headline` — short subtitle under the tour name, `""` if not set.

**Pricing logic:** `pricing.type = per_guest`. The entry with `members_count == guests` is taken from `pricelist`. If the date falls within a `seasonal_prices` range, that pricelist is used instead. `total = tier_price` (no boat_price). `pricing.default_price` is the "default" per-guest price shown on the tour card **before** a date/guest count is picked (`show_price` → `gross_price` → `price`, first non-zero); use `/quote` or `pricing.packages` for the actual calculation, not `default_price`.

---

## GET /api/v2/chatbot/policies

Site-wide policies (not tied to a specific tour) — the same texts shown in the policy popups on the site (`FullController::getRules()`, `src/contexts/RulesContext.jsx`).

```
GET https://bluuu.tours/api/v2/chatbot/policies
X-Api-Key: bluuu-chatbot-2026
```

### Example response

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

### Fields

| Field | Description |
|------|----------|
| `payment` | Payment terms (deposit/collect, payment methods) |
| `cancellation` | Cancellation and refund policy. The DB field is named `return` — renamed here for clarity |
| `privacy` | Privacy policy |
| `health` | Health/safety standards |
| `liability` | Liability waiver / guest acknowledgment. The DB field is named `release` — renamed here |

Each policy is `{ title, text }`, where `text` is HTML (same as the richeditor fields elsewhere in this API). These are **site-wide** policies — not tour/route-specific; for a specific route's notes, see `routes[].notes`.

---

## POST /api/v2/chatbot/quote

Calculates the total price and returns ready-to-use data for creating an order in Odoo.

```
POST https://bluuu.tours/api/v2/chatbot/quote
X-Api-Key: bluuu-chatbot-2026
Content-Type: application/json
```

### Request parameters

| Field | Type | Required | Description |
|------|-----|:---:|----------|
| `tour_id` | int | ✓ | Tour ID (from `boats[].id`) |
| `date` | string | — | Date `YYYY-MM-DD` |
| `adults` | int | — | Adults (default: `1`) |
| `kids` | int | — | Kids (default: `0`) |
| `guests` | int | — | Alternative to adults+kids (used if adults is not passed) |
| `route_id` | int | — | Route ID (private only, from `routes[].id`) |
| `transfer` | int | — | Transfer ID (from `transfers[].id`) |
| `insurance` | int | — | Cover ID (from `covers[].id`) |
| `boat_id` | int | — | Physical boat ID (from `boats[].boats[].id`). Auto-selected if not passed |
| `pickup_address` | string | — | Pickup address |
| `dropoff_address` | string | — | Drop-off address |
| `name` | string | — | Customer name |
| `email` | string | — | Customer email |
| `whatsapp` | string | — | Customer WhatsApp |
| `external_id` | string | — | External ID (CRM lead reference) |

**This endpoint does not support extras.** Extras can only be added on the site itself (the customer adds them after following `booking_url`) — don't send `extras`/`cars`, they don't affect the calculation and are silently dropped.

### Example request

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

### Example response

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

### Response fields

#### odoo_data.order

Ready-to-use fields for `sale.order/create` in Odoo — passed directly to OdooService.

| Field | Type | Description |
|------|-----|----------|
| `is_rental_order` | bool | Always `true` |
| `rental_start_date` | string\|null | Start datetime in UTC (`YYYY-MM-DD HH:MM:SS`), computed from `date + route.start` (Asia/Makassar → UTC) |
| `rental_return_date` | string\|null | End datetime in UTC (`date + route.end`) |
| `company_id` | int\|null | Odoo company ID of the boat's owning company |
| `x_studio_boat_name` | string | Physical boat name |
| `x_studio_adults` | int | Adults |
| `x_studio_kids` | int | Kids |
| `x_studio_count_of_people` | int | Total guests |
| `x_studio_route_new` | string | Route name (`route.odoo_name`) — replaces the field `x_studio_route`, which was removed from Odoo |
| `x_studio_lunch` | string | Restaurant / meal for the route (`restaurant.odoo_name`) |
| `x_studio_pickup_address` | string | Pickup address |
| `x_studio_drop_off_address` | string | Drop-off address |
| `x_studio_pickup_cars` | int | `1` if `transfer` is 1 or 2, else `0`. The car count from the request is not used — this is an "is there a pickup" flag, not a quantity |
| `x_studio_drop_off_cars` | int | `1` only if `transfer` = 2 (Private Pick up & Drop off), else `0` |
| `x_studio_car_type` | string\|false | `"Private Car"` (`transfer` 1/2, `guests` ≤ 5) / `"Private Hi-Ace"` (`transfer` 1/2, `guests` > 5) / `"Free Shuttle Bus"` (`transfer` = 3) / `false` (no transfer) |
| `x_studio_tour_type` | string | `tour.odoo_type` |
| `x_studio_deposit` | float | Deposit — always `0` (filled in at payment time) |
| `client_order_ref` | string | External ID (CRM lead) |
| `partner_name` | string | Customer name (for `res.partner`) |
| `partner_email` | string | Customer email |
| `partner_phone` | string | Customer phone / WhatsApp |

`x_studio_collect` is intentionally not sent in this payload — it's a readonly/computed field in Odoo (`amount_total - deposit - collected_by_*`), and writing to it on create is rejected. Use `currency_idr.total_price` for the amount to collect.

#### odoo_data.lines

Order lines — ready for `sale.order.line/create`. Extras are **not** included here (see the note under request parameters above).

| Field | Type | Description |
|------|-----|----------|
| `label` | string | `boat` / `tour` / `transfer` / `cover` / `restaurant`. `restaurant` is always added when the route has a restaurant with an `odoo_id` |
| `product_id` | int | Odoo product ID |
| `qty` | int | Quantity. For cover: `1` if `per_boat`, otherwise = guest count. For a shared tour and for restaurant: guest count |
| `price` | float | Price in IDR. Always `0` for `boat` and `restaurant` |

#### currency_idr / currency_usd

| Field | Description |
|------|----------|
| `total_price` | Grand total (boat + transfer + insurance, no extras — see note above) |
| `price_per_pax` | Price per guest |
| `breakdown.boat_base_price` | Tour cost (tier_price + boat_price for private) |
| `breakdown.transfer` | Transfer cost. >5 guests → `bus_price` |
| `breakdown.insurance` | Cover cost |
| `currency_usd` | `null` if no USD rate is set in the database |

#### meta

| Field | Description |
|------|----------|
| `tour_type` | `"private"` or `"shared"` |
| `adults` | Adults from the request |
| `kids` | Kids from the request |
| `guests` | Total (adults + kids) |

---

## GET /api/v2/chatbot/availability

Real-time tour availability for a specific date — what to tell a customer asking "what's available if I go tomorrow / on May 20?". Unlike `boats/private` and `boats/shared` (which just list tours and capacity regardless of date), this endpoint reads `noren_booking_closeddates` — a table kept up to date by the Odoo webhook (`OdooWebhookController`) on every order confirmation/cancellation, plus manual and cron closures. So "available" here means "no active Odoo order on this date, actually sellable" — not just "the tour exists".

Private and shared tours are returned together in one list, distinguished by the `type` field.

```
GET https://bluuu.tours/api/v2/chatbot/availability?date=2026-05-20
X-Api-Key: bluuu-chatbot-2026
```

### Request parameters

| Field | Type | Required | Description |
|------|-----|:---:|----------|
| `date` | string | ✓ | Date `YYYY-MM-DD` |
| `tour_id` | int | — | Limit the response to one tour (from `boats[].id` in `boats/private` / `boats/shared`) |
| `guests` | int | — | Group size. If passed, a tour counts as available only if the group actually fits (see below) |

### Example response

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

### Fields

| Field | Where | Description |
|------|-----|----------|
| `type` | both lists | `private` or `shared` — determines which URL param (`tour`) and which page (`/private-tour-to-nusa-penida` or `/shared-tour-to-nusa-penida`) to send the customer to when booking |
| `capacity` | `available[]` | Sum of `capacity` across all physical boats assigned to the tour, capped at the tour's officially registered `tour.capacity` (if the sum is higher, `tour.capacity` is shown instead; if lower, the sum is shown). **Not** the same as the static `capacity` field in `boats/private` / `boats/shared` |
| `slots_left` | `available[]` | **Private**: how many physical boats for this tour are still free on the date (a boat is chartered whole by one client). **Shared**: seats on the **largest still-open boat** — a group always travels on a single boat, so this is not a sum across boats but "the biggest chunk" that can actually be sold to one group |
| `reason` | `unavailable[]` | `fully_booked` — the tour is sold out by real orders (or the `guests` group doesn't fit on any boat). `blackout` — the date is closed manually by a manager, by the cron closure (21:30 daily, closing the next day), or the boat is taken by another type of booking (private / a different shared tour) |

### How `guests` affects the result

- **Private**: a boat counts as fitting if it's free **and** its `capacity` ≥ `guests`. If not passed, any free boat counts.
- **Shared**: the tour is available if a **single** free boat has ≥ `guests` seats (a group cannot be split across two boats). If not passed, availability is based on whether any seats are free at all.

### Notes

- If a tour has no boats at all, or all of them are disabled (`disabled`), the tour won't appear in the response (use `boats/private` and `boats/shared` to get the full tour list regardless of date).
- `tour_id` comes from `boats[].id` in the `boats/private` / `boats/shared` responses — it's the tour ID, not a physical boat ID.

---

## Errors

| HTTP | Body | Reason |
|------|------|---------|
| `401` | `{ "error": "Unauthorized" }` | Invalid API key |
| `404` | `{ "success": false, "error": "Tour not found" }` | `tour_id` not found |
| `422` | `{ "success": false, "error": "date (YYYY-MM-DD) is required" }` | `date` missing/invalid in `/availability` |
| `500` | HTML | Server error |
