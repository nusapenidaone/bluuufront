# Booking Page URL Parameters

The `/new/private` and `/new/shared` pages support pre-filling the booking form via GET query parameters.

## Parameters

### Shared `/new/shared`

| Parameter | Type   | Required | Description                        |
|-----------|--------|:--------:|------------------------------------|
| `date`    | string | ❌       | Date in `YYYY-MM-DD` format        |
| `adults`  | int    | ❌       | Number of adults (default: 1)      |
| `kids`    | int    | ❌       | Number of children (default: 0)    |
| `tour`    | int    | ❌       | Tour ID — pre-selects the boat     |
| `transfer`| int    | ❌       | Transfer ID — pre-selects transfer |
| `cover`   | int    | ❌       | Insurance ID — pre-selects cover   |

### Private `/new/private`

| Parameter | Type   | Required          | Description                                   |
|-----------|--------|:-----------------:|-----------------------------------------------|
| `date`    | string | ❌                | Date in `YYYY-MM-DD` format                   |
| `adults`  | int    | ❌                | Number of adults (default: 1)                 |
| `kids`    | int    | ❌                | Number of children (default: 0)               |
| `tour`    | int    | ❌                | Tour ID — pre-selects the boat                |
| `route`   | int    | ⚠️ if `tour` set | Route ID — required when `tour` is provided   |
| `transfer`| int    | ❌                | Transfer ID — pre-selects transfer option     |
| `cover`   | int    | ❌                | Insurance ID — pre-selects insurance option   |

## Examples

### Shared
```
https://bluuu.tours/new/shared?date=2026-07-01&adults=2&kids=1
https://bluuu.tours/new/shared?date=2026-07-01&adults=2&kids=1&tour=20
```

### Private
```
https://bluuu.tours/new/private?date=2026-07-01&adults=2&kids=1
https://bluuu.tours/new/private?date=2026-07-01&adults=2&kids=1&tour=1&route=5
```

## Behavior

- If `date` is provided — the page opens in **exact date** mode (not flexible), with the calendar positioned on the correct month.
- If `date` is omitted — default state ("pick later").
- `tour` corresponds to `id` from `/api/chatbot/boats/private` or `/api/chatbot/boats/shared`.
- `route` corresponds to `id` from the `routes` array in `/api/chatbot/boats/private`.
- Private only: if `tour` is passed without `route` — the boat is pre-selected but no route is chosen.

## Chatbot integration

The `POST /api/chatbot/quote` endpoint automatically returns a `booking_url` field with all available parameters pre-filled:

```json
{
  "booking_url": "https://bluuu.tours/new/private?date=2026-06-15&adults=4&tour=1&route=5&transfer=3&cover=2"
}
```

Pass `route_id` in the quote request to include the route in the generated URL (private tours only).
