# Viator Supplier API — Integration Guide

These endpoints implement the **Operator-Hosted** model of Viator Supplier API v2.0.  
Viator calls our endpoints when searching for tours, checking availability, and creating bookings.

---

## Configuration

Add to `.env`:

```
VIATOR_API_KEY=your_secret_key_from_viator
VIATOR_SUPPLIER_ID=12345
```

- `VIATOR_API_KEY` — the key Viator sends in the header of every request
- `VIATOR_SUPPLIER_ID` — your numeric operator ID in the Viator system

---

## Authentication

Every request from Viator must include the header:

```
X-API-Key: <VIATOR_API_KEY>
Content-Type: application/json
```

If the key is invalid — response is `401 Unauthorized`.

---

## Endpoints

### 1. Tour List
**`POST /viator/tourlist`**

Returns the tour catalog for mapping in the Viator system.  
Viator calls this endpoint during the initial integration setup.

**Request:** no body required.

**Response:**
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

Checks availability and price for a specific date and number of travelers.

**Request:**
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

**Response (available):**
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

**Statuses:** `AVAILABLE` / `UNAVAILABLE`  
**Unavailability reasons:** `PRODUCT_NOT_FOUND`

---

### 3. Availability Calendar
**`POST /viator/v2/availability/calendar`**

Availability over a date range (maximum 92 days).

**Request:**
```json
{
  "supplierId": 12345,
  "productOptionIds": ["nusa-penida-private"],
  "startDate": "2026-05-01",
  "endDate": "2026-07-31"
}
```

**Response:**
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

Holds spots for 20 minutes while the customer completes checkout on the Viator side.

**Request:**
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

**Response (success):**
```json
{
  "status": "RESERVED",
  "reference": "BLU-RES-6823a1f4b3e2a",
  "expiration": "2026-04-02T12:20:00+00:00",
  "price": {
    "type": "PER_PERSON_PRICE",
    "pricePerPerson": 850000,
    "total": 1700000,
    "currency": "IDR"
  }
}
```

**Response (no availability):**
```json
{
  "status": "NOT_RESERVED",
  "reason": "INSUFFICIENT_AVAILABILITY",
  "available": 1
}
```

> `reference` must be passed to `/booking` as `availabilityHoldReference`.

---

### 5. Booking
**`POST /viator/v2/booking`**

Creates a confirmed order after payment on the Viator side.

**Request:**
```json
{
  "supplierId": 12345,
  "productOptionId": "nusa-penida-private",
  "travelDate": "2026-05-15",
  "startTime": "08:00",
  "viatorConfirmationNumber": "VTR-123456789",
  "availabilityHoldReference": "BLU-RES-6823a1f4b3e2a",
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

**Response:**
```json
{
  "status": "CONFIRMED",
  "supplierConfirmationNumber": "BLU-187",
  "viatorConfirmationNumber": "VTR-123456789",
  "bookingId": 187
}
```

> `supplierConfirmationNumber` is our order identifier (format: `BLU-{id}`). Used in all subsequent requests.

**Traveler types:**
| Type | Description |
|------|-------------|
| `ADULT` | Adult |
| `SENIOR` | Senior (counted as adult) |
| `CHILD` / `YOUTH` | Child 3–11 (kids) |
| `INFANT` | Infant 0–2 (children, price 0) |

---

### 6. Booking Amendment
**`POST /viator/v2/booking-amendment`**

Modifies an existing booking.

**Request:**
```json
{
  "supplierId": 12345,
  "supplierConfirmationNumber": "BLU-187",
  "amendment": {
    "travelDate": "2026-05-20",
    "leadTravelerName": "John Smith",
    "totalTravelers": 3
  }
}
```

All fields in `amendment` are optional. Only send what is changing.

**Response:**
```json
{
  "status": "AMENDED",
  "supplierConfirmationNumber": "BLU-187"
}
```

---

### 7. Booking Cancellation
**`POST /viator/v2/booking-cancellation`**

Cancels a booking.

**Request:**
```json
{
  "supplierId": 12345,
  "supplierConfirmationNumber": "BLU-187",
  "reason": "Customer requested cancellation"
}
```

**Response:**
```json
{
  "status": "CANCELLED",
  "supplierConfirmationNumber": "BLU-187"
}
```

---

### 8. Redemption
**`POST /viator/v2/redemption`**

Checks whether a booking was used (on the day of the tour during boarding).

**Request:**
```json
{
  "supplierId": 12345,
  "supplierConfirmationNumber": "BLU-187",
  "viatorConfirmationNumber": "VTR-123456789"
}
```

**Response:**
```json
{
  "supplierConfirmationNumber": "BLU-187",
  "status": "REDEEMED",
  "travelDate": "2026-05-15",
  "tourId": 42
}
```

**Statuses:** `REDEEMED` (status_id 5) / `NOT_REDEEMED`

---

## Error Codes

| HTTP | Description |
|------|-------------|
| 200 | Success |
| 400 | Missing required fields |
| 401 | Invalid API key |
| 404 | Tour or order not found |
| 422 | Validation error |
| 500 | Internal server error |

---

## Data Storage

Viator orders are stored in the standard `noren_booking_order` table.  
The `requests` field (JSON) holds additional information:

```json
{
  "source": "viator",
  "viatorConfirmationNumber": "VTR-123456789",
  "holdReference": "BLU-RES-...",
  "startTime": "08:00",
  "currency": "IDR",
  "travelers": [...]
}
```

Orders are looked up by the `external_id` field or by order ID via the `BLU-{id}` format.

---

## Files

```
plugins/noren/booking/viator/
├── ViatorController.php   — logic for all endpoints
├── routes.php             — route registration
├── VIATOR_API.md          — this guide (Russian)
└── VIATOR_API_EN.md       — this guide (English)
```
