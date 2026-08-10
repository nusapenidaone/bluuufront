# ETA API + Odoo automation (pickup time)

Расчёт времени подачи (`pickup_time`) для трансфера через Google Maps, вызывается
из Odoo automation при создании/обновлении заказа.

## Backend

- Роут: `GET /api/new/eta` → `EtaController::estimate` ([EtaController.php](../api/EtaController.php))
- Реализация ETA: [GoogleMapsService.php](../maps/GoogleMapsService.php)
- Ключ доступа: `services.config.php` → `access_key` (сверяется через `hash_equals`)

### Query-параметры

| Параметр | Обязателен | Описание |
|---|---|---|
| `key` | да | access key из `services.config.php` |
| `address` | да | адрес подачи (`x_studio_pickup_address`) |
| `tour_time` | нет | `rental_start_date` заказа, **строго в UTC**, формат `Y-m-d H:i:s` |

`rental_start_date` в Odoo всегда хранится в UTC — значение можно передавать как есть,
без конвертации на стороне Odoo.

### Ответ

```json
{
  "success": true,
  "duration_seconds": 4706,
  "duration_text": "1 hour 18 mins",
  "duration_in_traffic_seconds": 6080,
  "distance_meters": 39173,
  "distance_text": "39.2 km",
  "resolved_address": "...",
  "lat": -8.46,
  "lng": 115.24,
  "pickup_time": "08:01"
}
```

- `pickup_time` считается только если передан `tour_time`:
  `tour_time − duration_seconds − 40 минут (буфер)`, формат **`H:i`**, таймзона **Asia/Makassar**
  (конвертация из UTC делается на бэкенде — Odoo ничего конвертировать не должно).
- При ошибке: `{"success": false, "error": "..."}` (`401` — не тот `key`, `422` — нет `address`,
  `500` — сбой geocoding/Distance Matrix).

### Известные ограничения

- Если передан `tour_time`, он же используется как `departure_time` для Distance Matrix —
  Google строит прогноз трафика на это время (а не на момент запроса). Если `tour_time` в
  прошлом (или параметр не передан), используется `now`. Реальный выезд происходит на
  duration+40мин раньше самого тура, так что прогноз чуть смещён относительно факта, но
  всё равно намного точнее, чем трафик "прямо сейчас".
- `pickup_time` — это только `H:i`, без даты. Если тур очень ранний и дорога длинная, расчётное
  время может "уйти" на предыдущие сутки (например `23:40`) — поле не сигнализирует о смене дня.
- Backend делает два последовательных запроса к Google (geocode + distance matrix, по 15с таймаут
  каждый) — в худшем случае ответ может занять до ~30с, учитывайте это в таймауте на стороне Odoo.

## Odoo automation script

```python
import requests

ETA_URL = "https://bluuu.tours/api/new/eta"
ACCESS_KEY = "8bbfb28fc8e76843829e8f745c6381c39021f33378a8f61d"
REQUEST_TIMEOUT = 40  # backend: geocode 15s + distance matrix 15s + запас

for rec in records:
    address = (rec.x_studio_pickup_address or "").strip()

    if not address:
        # Нет адреса — не считаем, и сбрасываем возможные старые значения
        # (например, если адрес был, ETA посчитался, а потом адрес очистили)
        if rec.x_studio_estimated_pickup_time or rec.x_studio_estimated_trip_duration_google:
            rec.write({
                "x_studio_estimated_pickup_time": False,
                "x_studio_estimated_trip_duration_google": False,
            })
        continue

    if not rec.rental_start_date:
        continue

    # не пересчитываем, если оба поля уже посчитаны
    if rec.x_studio_estimated_pickup_time and rec.x_studio_estimated_trip_duration_google:
        continue

    try:
        response = requests.get(
            ETA_URL,
            params={
                "address": address,
                "tour_time": rec.rental_start_date.strftime("%Y-%m-%d %H:%M:%S"),
                "key": ACCESS_KEY,
            },
            timeout=REQUEST_TIMEOUT,
        )
        data = response.json()
    except Exception as e:
        log("ETA request failed for order %s: %s" % (rec.id, e), level="warning")
        continue

    if not data.get("success") or not data.get("pickup_time"):
        log(
            "ETA calculation failed for order %s: %s" % (rec.id, data.get("error")),
            level="warning",
        )
        continue

    vals = {}

    try:
        time_str = data["pickup_time"]  # например "08:01", уже Asia/Makassar
        hours, minutes = time_str.split(":")
        vals["x_studio_estimated_pickup_time"] = int(hours) + int(minutes) / 60.0
    except Exception as e:
        log("Pickup time conversion failed for order %s: %s" % (rec.id, e), level="warning")

    duration_seconds = data.get("duration_seconds")
    if duration_seconds is not None:
        vals["x_studio_estimated_trip_duration_google"] = round(duration_seconds / 60.0)

    if vals:
        rec.write(vals)
```

Изменения относительно первой версии:

1. `REQUEST_TIMEOUT` поднят с `20` до `40` секунд — старый таймаут был меньше, чем возможное
   время ответа бэкенда в худшем случае (два последовательных запроса к Google по 15с).
2. Добавлена проверка `if rec.x_studio_estimated_pickup_time and rec.x_studio_estimated_trip_duration_google: continue` —
   без неё автоматизация при каждом прогоне по всем `records` заново дёргает платные Google API
   (geocode + distance matrix) для уже обработанных заказов. Если нужно пересчитывать при
   смене адреса — уберите эту проверку и фильтруйте `records` доменом по изменившимся полям
   на уровне триггера автоматизации в Odoo.
3. Пустой `x_studio_pickup_address` теперь явно сбрасывает `x_studio_estimated_pickup_time` и
   `x_studio_estimated_trip_duration_google` в `False`, а не просто пропускает запись — иначе
   при очистке адреса на заказе оставались бы старые (уже неактуальные) расчёты ETA.
