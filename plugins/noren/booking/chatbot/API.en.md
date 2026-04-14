# Bluuu Chatbot API — Integration Reference

## 1. Endpoint Details

**Production base URL:** `https://bluuu.tours`

No staging environment. The production API reads live CMS data.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chatbot/boats/private` | All active private boats + itinerary routes + add-on extras |
| GET | `/api/chatbot/boats/shared` | All active shared tour boats |

No query parameters — each endpoint returns a full snapshot of all active products.

---

## 2. Authentication

All endpoints require an API key on every request. No token expiry — the key is static and rotated manually in `.env`.

| Method | Format |
|--------|--------|
| Header (preferred) | `X-Api-Key: <key>` |
| Query param | `?api_key=<key>` |

**Header example:**
```http
GET /api/chatbot/boats/private HTTP/1.1
Host: bluuu.tours
X-Api-Key: bluuu-chatbot-2026
```

**Key rotation:** update `CHATBOT_API_KEY` in `.env` on the server, then notify integration partners. No expiry timer.

---

## 3. Request Schema

Both endpoints are `GET` with no required parameters.

| Parameter | Required | Description |
|-----------|----------|-------------|
| — | — | No request parameters |

---

## 4. Pricing Logic

### Private tours — price per boat

**Formula:**
```
total = pricelist[N].price + boat_price
```

- `pricelist[N].price` — the tier value for the matching guest count (from `pricing.packages[].pricelist`)
- `boat_price` — fixed boat surcharge (`pricing.base_price`)

Both values can be overridden by a seasonal period (see below).

**How to quote for N guests:**
1. Check `pricing.seasonal_prices[]` — if the booking date falls within a `date_start`/`date_end` range, use that period's `packages.pricelist` as the active pricelist, and its `boat_price` if present
2. Otherwise use `pricing.packages[0].pricelist` as the active pricelist, and `pricing.base_price` as `boat_price`
3. Find the highest `members_count` tier where `members_count <= N`
4. **Total = that tier's `price` + `boat_price`**
5. Divide by N to show per-person cost if needed

**Seasonal pricing flags:**
- `low_price: true` → low season rate
- `flash_sale: true` → promotional rate (display badge)

### Shared tours — price per guest

`pricing.base_price` = price per person. Same seasonal override logic applies.

### Add-ons (extras) — private only

Returned in the top-level `extras` array. Each extra has a flat `price` in IDR. If `has_options: true`, the guest selects from `options[]` (each option has its own price).

### Currency

All prices are in **IDR (Indonesian Rupiah)**. No taxes or fees are added on top — prices shown are final.

---

## 5. Response Format

### GET `/api/chatbot/boats/private` — `200 OK`

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
        "base_price": 1550000,
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
      "images": ["https://bluuu.tours/storage/app/uploads/public/..."]
    }
  ],
  "routes": [
    {
      "id": 5,
      "title": "Classic Route",
      "slug": "classic-route",
      "description": "All top spots in one action-packed day.",
      "map": "https://bluuu.tours/storage/app/uploads/public/.../map.webp",
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
      "description": "Cold drinks on board.",
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

### GET `/api/chatbot/boats/shared` — `200 OK`

```json
{
  "boats": [
    {
      "id": 20,
      "name": "Classic shared tour",
      "slug": "classic-shared",
      "description": "All the top spots in one action-packed day.",
      "size": "12M",
      "capacity": 14,
      "currency": "IDR",
      "status": "ready",
      "categories": ["Shared"],
      "features": { "shade": "Partial shade", "cabin": false, "ac": false, "sound": null, "toilet": false },
      "pricing": {
        "type": "per_guest",
        "base_price": 1390000,
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

### Field definitions

#### Boat

| Field | Type | Description |
|-------|------|-------------|
| `id` | int | Unique boat/tour ID |
| `name` | string | Product name |
| `slug` | string | URL identifier |
| `description` | string | Short description |
| `size` | string | Boat length e.g. `"12M"` |
| `capacity` | int | Max guests |
| `currency` | string | Always `"IDR"` |
| `status` | string | `"ready"` or `"soon"` |
| `categories` | string[] | Category labels |
| `features.shade` | string | `"Full shade + flybridge"` or `"Partial shade"` |
| `features.cabin` | bool | Private cabin onboard |
| `features.ac` | bool | Air conditioning |
| `features.sound` | string\|null | `"Bose sound"` or `null` |
| `features.toilet` | bool | Toilet onboard |
| `best_for` | string\|null | Recommended guest type |
| `boat_type` | string\|null | e.g. `"speedboat"`, `"yacht"` |
| `pricing` | object | See pricing fields below |
| `images` | string[] | Up to 3 image URLs (absolute) |

#### Pricing

| Field | Type | Description |
|-------|------|-------------|
| `pricing.type` | string | `"per_boat"` (private) or `"per_guest"` (shared) |
| `pricing.boat_price` | int | Fixed boat surcharge in IDR — added on top of `pricelist[N].price` |
| `pricing.packages[].name` | string | Package label |
| `pricing.packages[].pricelist` | array | `[{members_count, price}]` tiers |
| `pricing.seasonal_prices[].date_start` | string | `"YYYY-MM-DD"` |
| `pricing.seasonal_prices[].date_end` | string | `"YYYY-MM-DD"` |
| `pricing.seasonal_prices[].boat_price` | int\|null | Override `boat_price` for this period (`null` = use `pricing.base_price`) |
| `pricing.seasonal_prices[].low_price` | bool | Low season flag |
| `pricing.seasonal_prices[].flash_sale` | bool | Flash sale flag |
| `pricing.seasonal_prices[].packages` | object\|null | Override pricelist for this period |

---

## 6. Error Handling

| HTTP Code | Body | Reason |
|-----------|------|--------|
| `401` | `{"error": "Unauthorized"}` | Missing or invalid API key |
| `500` | Laravel error page | Server error — contact Bluuu |

No retry logic needed — the API has no rate limits. On `500`, wait and retry after a few seconds.

---

## 7. Rate Limits & Performance

- **No rate limits** on chatbot endpoints
- **Expected response time:** < 500 ms (data is read directly from DB, no external calls)
- No pagination — each response is a full snapshot of all active products

---

## 8. Testing Access

**Endpoint:** `https://bluuu.tours/api/chatbot/boats/private`
**API key:** `bluuu-chatbot-2026`

```bash
# Test private boats
curl https://bluuu.tours/api/chatbot/boats/private \
  -H "X-Api-Key: bluuu-chatbot-2026"

# Test shared boats
curl https://bluuu.tours/api/chatbot/boats/shared \
  -H "X-Api-Key: bluuu-chatbot-2026"

# Via query param
curl "https://bluuu.tours/api/chatbot/boats/private?api_key=bluuu-chatbot-2026"
```

No sandbox — test against production. Data is live CMS content.

---

## 9. Mapping Reference

Products are identified by `id` (int) and `slug` (string). Use `id` for reliable mapping — slugs may change if CMS content is edited.

- Private boats: `classes_id = 8` internally
- Shared tours: `classes_id = 9` internally
- Routes (itineraries) are shared across private boats — a route `id` from the `/private` response matches `route.id` on any boat

---

## 10. API Versioning

No versioning — the API is a single live endpoint. Breaking changes will be communicated directly before deployment. Non-breaking additions (new fields) may be added at any time without notice.

---

## 11. Security

- HTTPS only (TLS 1.2+)
- No IP whitelisting currently
- API key must be kept private — do not expose in client-side code
- Key rotation: contact Bluuu to request a new key

---

## 12. Scope Confirmation

| Data | Included? |
|------|-----------|
| Boat/tour info | ✅ |
| Pricing (default + seasonal) | ✅ |
| Add-ons / extras with prices | ✅ (private endpoint only) |
| Itinerary routes | ✅ (private endpoint only) |
| Restaurant info | ✅ |
| Real-time availability | ❌ Not included — prices are returned without date-based availability check |
| Taxes / fees | ❌ Not applicable — all prices are final, no taxes added |
| Order creation | ❌ Out of scope for chatbot API |

> **Note on availability:** The chatbot API returns pricing data only. To check if a specific date is available for a specific boat, use the separate availability endpoints (`/api/new/availability/private/{id}` and `/api/new/availability/shared/{id}`) — these are not API-key protected and return per-date availability.

---

## Quick reference

```bash
# Private boats (+ routes + extras + pricing)
curl https://bluuu.tours/api/chatbot/boats/private -H "X-Api-Key: bluuu-chatbot-2026"

# Shared boats (+ pricing)
curl https://bluuu.tours/api/chatbot/boats/shared -H "X-Api-Key: bluuu-chatbot-2026"
```

**Pricing logic summary:**
- Private → price is **per boat** (entire boat, split by group)
- Shared → price is **per guest**
- Check `seasonal_prices[]` first; if today is within a date range, use that period's pricelist
- All prices in IDR, taxes included, no additional fees
