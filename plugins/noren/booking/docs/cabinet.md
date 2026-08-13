# Личный кабинет — полная логика

URL: `/cabinet/{odooId}/{key}`

---

## Доступ и авторизация

Кабинет открывается по двум параметрам из URL:
- `odooId` — числовой ID ордера в Odoo (`sale.order.id`)
- `key` — уникальный ключ (`x_studio_unique_key` из Odoo = `Order.external_id` с сайта, формат `bluuu<timestamp>`)

При каждом запросе (GET show, PATCH update, POST pay):
1. Делается `OdooService::getFullOrder($odooId)` — запрос в Odoo
2. Проверяется `order['x_studio_unique_key'] === $key` — если не совпадает → 404
3. Если `state === 'cancel'` → 404

Ключ попадает в письмо клиенту при создании заказа. Без правильного ключа ничего не открывается.

---

## Определение типа тура (private / shared)

**Метод `detectTourType(array $odooOrder)`:**

1. Берёт `product_id` из каждой строки Odoo ордера
2. Ищет тур в локальной БД: `Tours::whereIn('odoo_id', $productIds)->first()`
3. Если тур **не найден** → возвращает `null` → `show()` отдаёт 404
4. Проверяет `$tour->types_id`:
   - `types_id = 2` → **private** (`classesId = 8`)
   - `types_id = 1` → **shared** (`classesId = 9`)

Результат `$classesId` используется для фильтрации трансферов и страховок.

---

## GET /api/new/cabinet/{odooId}/{key}

Возвращает полный снимок ордера для отображения в кабинете.

### Сборка ответа

**`local` — из каких именно таблиц берётся каждое поле:**

**Из Odoo (`sale.order` / `x_studio_*`):**
| Поле | Odoo поле |
|---|---|
| `travel_date` | `rental_start_date` (UTC) → конвертируется в дату Asia/Makassar |
| `adults` | `x_studio_adults` |
| `kids` | `x_studio_kids` |
| `members` | `x_studio_count_of_people` |
| `pickup_address` | `x_studio_pickup_address` |
| `dropoff_address` | `x_studio_drop_off_address` |
| `boat_name` | `x_studio_boat_name` |
| `name` | `partner_id[1]` (имя клиента из Odoo) |
| `route_name` (shared) | `x_studio_route_new` |

**Из таблицы `noren_booking_tours` (по `Tours.odoo_id` = `product_id` из строк ордера):**
| Поле | Откуда |
|---|---|
| `tour_name` | `Tours.name` |
| `tour_image` | `Tours.images_with_thumbs[0]` |
| `tours_id` | `Tours.id` |
| `tour_odoo_type` | `Tours.odoo_type` |
| `is_private` | `Tours.types_id` (2=private, 1=shared) |
| `source_id` | `Tours.source_id` (1=website, 2=Viator) |

**Из таблицы `noren_booking_boat` (по `Boat.name` или `Boat.amo_name` = `x_studio_boat_name`):**
| Поле | Откуда |
|---|---|
| `boat_capacity` | `Boat.capacity` |

**Из таблицы `noren_booking_transfer` (по `Transfer.odoo_id` = `product_id` в строках ордера):**
| Поле | Откуда |
|---|---|
| `transfer_id` | `Transfer.id` |

**Из таблицы `noren_booking_cover` (по `Cover.odoo_id` = `product_id` в строках ордера):**
| Поле | Откуда |
|---|---|
| `cover_id` | `Cover.id` |

**Из таблицы `noren_booking_route` (только private, по ecategories):**
| Поле | Откуда |
|---|---|
| `route_id` | `Route.id` |
| `route_name` | `Route.title` |

**Локальная таблица `noren_booking_order` НЕ используется.** Все данные берутся из Odoo или локальных справочников (Tours, Boat, Transfer, Cover, Route).

**Вычисляется:**
| Поле | Как |
|---|---|
| `odoo_id` | параметр URL |

**Поиск локального ордера** (`$localOrder`):
1. По `Order.external_id = odooOrder['client_order_ref']`
2. Fallback: `Order.odoo_id = $odooId`

Используется для `extras` (private) и `source_id` (все типы).

**`odoo` — данные напрямую из Odoo:**
- `order_number` (`name`, напр. `S40185`)
- `state` (`draft` / `sale` / `cancel`)
- `source` (`x_studio_source`)
- `boat_name`, `route`
- `rental_start_date` / `rental_return_date` (UTC)
- `deposit_paid` (`x_studio_deposit`)
- `collect` (`x_studio_collect`) — остаток к оплате
- `partner_name`
- `lines` — полный список строк ордера
- `online_checked_in`

**`options` — каталог для редактирования:**

| Поле | Что содержит |
|---|---|
| `transfers` | Transfer из БД, отфильтрованные по `classes_id` (совпадает с типом тура или `null`) |
| `covers` | Cover из БД, отфильтрованные по `classes_id` |
| `routes` | только для private: все Route с `classes_id = 8`, каждый со своими `categories → extras` |
| `price_list` | `[{members_count, price}]` — прайслист тура на дату (из `PricesByDates` или default `Packages`) |
| `upgrade_tour` | для shared: данные об апгрейде на следующий тир (если доступен) |
| `route_schedule` | для shared: расписание маршрута |
| `tour_included` / `tour_includes` | что включено в тур |

---

## PATCH /api/new/cabinet/{odooId}/{key}

Обновляет ордер в Odoo. Принимает только те поля, которые переданы в теле запроса.

### Параметры запроса

| Поле | Тип | Описание |
|---|---|---|
| `date` | string `Y-m-d` | Новая дата тура |
| `adults` | int | Кол-во взрослых |
| `kids` | int | Кол-во детей |
| `pickup_address` | string | Адрес забора |
| `dropoff_address` | string | Адрес высадки |
| `transfer_id` | int\|null | ID трансфера (null = без трансфера) |
| `cover_id` | int\|null | ID страховки (null = без страховки) |
| `extras` | array | `[{id, name, price, qty}]` — полный список экстрас |

### Порядок операций

1. **Fetch + verify** — `fetchOdooOrder()` проверяет ключ
2. **Вычисление `$members`** — `newAdults + newKids`
3. **Разбор текущих строк ордера** — определяет `$existingTransferLine`, `$existingNoTransferLineId`, `$existingCoverLine`, `$existingRestaurantLine`, `$existingExtrasLines`
4. **Cancel → Draft** (если ордер в статусе `sale`) — нужно для редактирования строк
5. **Обновление строк:**

#### Transfer
| Ситуация | Действие |
|---|---|
| Запрос `null` (без трансфера) + есть реальная строка | `writeOrderLine` → заменяем на product_id=23 (No Transfer), qty=1, price=0 |
| Запрос реальный + та же строка | `writeOrderLine` только qty (кол-во машин) |
| Запрос реальный + другая строка | `writeOrderLine` → меняем product_id на новый |
| Запрос реальный + нет строки + есть No Transfer (id=23) | `unlinkOrderLines([noTransferLineId])` → `addOrderLine` |
| Запрос реальный + нет строки вообще | `addOrderLine` |
| Кол-во людей изменилось (без transfer_id в запросе) | пересчитываем кол-во машин на существующей строке |

Кол-во машин: `ceil($members / 5)` для transfer_id 1 и 2 (Private Pick Up).

#### Cover
| Ситуация | Действие |
|---|---|
| Запрос `null` | `unlinkOrderLines` |
| Тот же cover | `writeOrderLine` qty (если изменилось) |
| Другой cover | `writeOrderLine` с новым product_id |
| Нет строки | `addOrderLine` |
| Кол-во людей изменилось (без cover_id) + `!per_boat` | пересчитываем qty |

Qty cover: `per_boat = true` → qty=1; `per_boat = false` → qty=members.

#### Restaurant
Если изменилось кол-во людей → `writeOrderLine` qty на строке ресторана.

#### Extras
1. Строится `$requestedExtrasMap` (odoo product_id → {extra, qty})
2. Строки, которых нет в запросе → `unlinkOrderLines` (удаляем)
3. Строки, которые есть:
   - уже есть в ордере → `writeOrderLine` qty (если изменилось)
   - новые → `bulkAddOrderLines`

6. **Header fields** — `updateOrderHeaderFields($odooId, $fields)` записывает дату, кол-во людей, адреса, pickup/dropoff cars, car_type
7. **Re-confirm** — если был `sale` → `confirmOrder()`
8. **Rollback** — если ошибка и был `sale` → пытается `confirmOrder()` обратно

---

## POST /api/new/cabinet/{odooId}/{key}/pay

Создаёт платёжную ссылку Xendit для оплаты остатка.

1. Берёт `x_studio_collect` из Odoo — если ≤ 0 → ошибка
2. Читает email клиента через `OdooService::readPartners($partnerId)`
3. Создаёт ссылку: `XenditService::createPaymentLink(external_id='odoo_{odooId}', amount, email, ...)`
4. `success_url` = `/cabinet/{odooId}/{key}?paid=1`
5. Возвращает `{payment_url}`

`external_id = 'odoo_{odooId}'` — при успешной оплате Xendit webhook вызывает `OdooService::registerPayment()` который записывает `x_studio_collected_by_xendit` в Odoo.

---

## GET /api/new/cabinet/{odooId}/{key}/upgrade

Проверяет наличие мест на апгрейд-тур (только для shared).

- Определяет текущий тур по строкам ордера → `Tours.odoo_type`
- Карта апгрейда: `Standard Shared → Premium Shared → First Class Shared`
- Проверяет доступность через `SharedAvailability` на текущую дату и кол-во людей
- Возвращает `{available, available_seats, upgrade_tour: {name, price_diff, ...}}`

---

## Frontend: cabinet.jsx

### Ограничения редактирования

| Условие | Что блокируется |
|---|---|
| `hoursUntilTour <= 24` (`allEditLocked`) | всё редактирование |
| `local.source_id !== 1` (`!sourceIsOurs`) | только дата и кол-во гостей (source берётся из `Tours.source_id`) |

При блокировке по source (не сайтовое бронирование) показывается notice: "Date and guest count changes are managed by our team".

### Ограничения "только добавление"

**Экстрасы** (`savedExtrasMap` — минимальное qty из начальной загрузки):
- Кнопка "−" отключена если `qty <= savedQty`
- `toggleAutoExtra` не удаляет extras из `savedExtrasMap`
- `setExtraQty` зажимает qty через `Math.max(savedQty, newQty)`

**Трансфер** (`handleTransferChange`):
- Если был сохранённый трансфер (`savedTransferId !== null`) и клиент выбирает `null` → попап менеджера
- Если был сохранённый трансфер и клиент выбирает более дешёвый → попап менеджера

**Страховка** (`handleCoverChange`):
- Если была сохранённая страховка (`savedCoverId !== null`) и клиент убирает → попап менеджера

### Попап менеджера

Анимированный bottom sheet (на mobile) / центральный (на desktop). Кнопки: WhatsApp + Email.

### Pricing delta (в футере "Unsaved changes")

```
priceDelta = addonsDelta + tourPriceDelta

addonsDelta    = liveAddOns - savedAddOns
                 (transfer + cover + extras по текущим значениям vs сохранённые)

tourPriceDelta = priceList[editMembers] - priceList[savedMembers]
                 (только для shared, из options.price_list)
```

Если `priceDelta > 0` → "Additional payment required +IDR X"
Если `priceDelta < 0` → "Price difference −IDR X. Refund will be processed through Odoo"

### Countdown до check-in

`checkinOpenMs = rental_start_date (UTC) - 24h`

- `d > 0` → показываем текст "X days"
- `d === 0` → живой таймер `hh:mm:ss` (тикает каждую секунду через `setInterval`)
- После открытия check-in → editLocked = true, кнопки редактирования пропадают

### Апгрейд-баннер (только shared)

Показывается если `options.upgrade_tour` есть и `!allEditLocked`.
При изменении даты или кол-ва гостей — автоматически перепроверяется через `/upgrade` endpoint (debounce 700ms).

---

## Маршруты (routes.php)

```
GET   /api/new/cabinet/{odooId}/{key}         → CabinetController::show
PATCH /api/new/cabinet/{odooId}/{key}          → CabinetController::update
POST  /api/new/cabinet/{odooId}/{key}/pay      → CabinetController::createPayment
GET   /api/new/cabinet/{odooId}/{key}/upgrade  → CabinetController::checkUpgrade
OPTIONS /api/new/cabinet/{any}                 → CORS preflight
```

---

## Odoo fields, используемые кабинетом

**Чтение (getFullOrder):**
`id`, `name`, `state`, `partner_id`, `rental_start_date`, `x_studio_source`, `x_studio_boat_name`, `x_studio_route_new`, `x_studio_tour_type`, `x_studio_lunch`, `x_studio_car_type`, `x_studio_pickup_cars`, `x_studio_drop_off_cars`, `x_studio_pickup_address`, `x_studio_drop_off_address`, `x_studio_kids`, `x_studio_adults`, `x_studio_count_of_people`, `x_studio_payment_source`, `x_studio_collect`, `x_studio_deposit`, `x_studio_online_check_in_complete`, `x_studio_collected_by_cash`, `x_studio_collected_by_edcbank`, `x_studio_unique_key`, `client_order_ref`, `order_line`

**Запись (update):**
`rental_start_date`, `rental_return_date`, `x_studio_adults`, `x_studio_kids`, `x_studio_count_of_people`, `x_studio_pickup_address`, `x_studio_drop_off_address`, `x_studio_pickup_cars`, `x_studio_drop_off_cars`, `x_studio_car_type`

**Строки ордера (order lines):**
Transfer, Cover, Restaurant, Extras — create/update/delete через `sale.order.line` JSON-RPC
