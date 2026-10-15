# Odoo Automation Rule "google maps" (Sales Order) → Execute Code
# Trigger: On create and edit, Trigger Fields = Rental Start Date, Pickup Address
# Описание и история изменений: ../eta-automation.md
#
# Скопировать целиком в поле кода действия в Odoo.


ETA_URL = "https://bluuu.tours/api/new/eta"
ACCESS_KEY = "8bbfb28fc8e76843829e8f745c6381c39021f33378a8f61d"
REQUEST_TIMEOUT = 40  # backend: geocode 15s + distance matrix 15s + запас
BALI_ROOT_COMPANY_ID = 1  # PT Day Trip Bali — считаем ETA только для неё и её дочерних компаний

for rec in records:
    # Головная компания заказа: поднимаемся по parent_id до корня.
    # Не Бали (например Bluuu Tours Phuket и её дочерние) — пропускаем.
    root = rec.company_id
    while root.parent_id:
        root = root.parent_id
    if root.id != BALI_ROOT_COMPANY_ID:
        continue

    address = (rec.x_studio_pickup_address or "").strip()

    if not address:
        # Нет адреса — не считаем, и сбрасываем возможные старые значения
        # (например, если адрес был, ETA посчитался, а потом адрес очистили)
        if rec.x_studio_estimated_pickup_time or rec.x_studio_estimated_trip_duration_google or rec.x_studio_estimated_distance:
            rec.write({
                "x_studio_estimated_pickup_time": False,
                "x_studio_estimated_trip_duration_google": False,
                "x_studio_estimated_distance": False,
            })
        continue

    if not rec.rental_start_date:
        continue

    # Пересчитываем всегда: Trigger Fields автоматизации (rental_start_date,
    # x_studio_pickup_address) уже гарантируют, что скрипт запускается только
    # при реальном изменении одного из них — доп. guard "уже посчитано →
    # пропустить" здесь не нужен и раньше был багом (блокировал пересчёт при
    # каждом повторном изменении адреса/даты после первого расчёта).

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

    distance_km = data.get("distance_km")
    if distance_km is not None:
        vals["x_studio_estimated_distance"] = distance_km

    if vals:
        rec.write(vals)
