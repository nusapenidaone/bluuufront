# Project: Bluuu.tours

## Stack

- **Backend**: OctoberCMS (Laravel-based PHP), plugin `Noren.Booking` at `plugins/noren/booking/`
- **Frontend**: React + Vite at `src/`, proxied to `https://bluuu.tours` in dev (`vite.config.js`)
- **Deploy**: PHP файлы деплоятся вручную по FTP на `bluuu.tours`. Frontend собирается `npm run build` → выходит в `themes/bluuu/assets/home/`
- **DB**: MySQL, OctoberCMS migrations

## Key models (`plugins/noren/booking/models/`)

| Model | Table | Поля odoo_id |
|-------|-------|-------------|
| `Order` | `noren_booking_order` | `odoo_id`, `tours_id`, `boat_id`, `transfer_id`, `cover_id`, `external_id` |
| `Tours` | `noren_booking_tours` | `odoo_id`, `name` |
| `Boat` | `noren_booking_boat` | `odoo_id`, `name` |
| `Transfer` | `noren_booking_transfer` | `odoo_id`, `name` |
| `Cover` | `noren_booking_cover` | `odoo_id`, `name` |

Order relationships (belongsTo): `tours`, `boat`, `transfer`, `cover`, `route`, `program`, `restaurant`, `status`, `source`

## Odoo integration

- Сервис: `plugins/noren/booking/odoo/OdooService.php`
- Config: `plugins/noren/booking/odoo/services.config.php` (содержит `url`, `db`, `api_key`, `admin_token`)
- Odoo — это `sale.order`. Кастомные поля: `x_studio_boat_name`, `x_studio_route`, `x_studio_deposit`, `x_studio_collect`, `x_studio_adults`, `x_studio_kids`, `x_studio_count_of_people`, `x_studio_pickup_address`, `x_studio_drop_off_address`, `x_studio_pickup_cars`, `x_studio_drop_off_cars`, `x_studio_payment_source`
- `x_studio_free_shuttle_bus` — устарело, не используется
- `x_studio_payment_source` = `order->method->name` (берётся с модели `Method`, не хардкодится)
- Связь: `Order.odoo_id` ↔ `sale.order.id` в Odoo
- В Odoo несколько компаний. `Boat.company.odoo_id` → `sale.order.company_id` (компания владельца лодки)
- Все продукты имеют `odoo_id` для маппинга в order lines: `Tours`, `Boat`, `Transfer`, `Cover`, `Extras`

**Odoo поля:**
- `x_studio_route` = `route.name` если есть, иначе `program.name`
**Transfer types (таблица `noren_booking_transfer`):**
| id | odoo_id | name | pickup_cars | drop_off_cars |
|----|---------|------|-------------|---------------|
| 1 | 22 | Private Pick up | 1 | 0 |
| 2 | 21 | Private Pick up & Drop off | 1 | 1 |
| 3 | 2456 | Free shuttle bus | 0 | 0 |
| — | — | No transfer | 0 | 0 |

- `x_studio_pickup_cars` = 1 если `transfer_id=1` или `transfer_id=2`, иначе 0
- `x_studio_drop_off_cars` = 1 если `transfer_id=2`, иначе 0
- `x_studio_car_type`:
  - `transfer_id=1` или `2` + `members <= 5` → "Private Car"
  - `transfer_id=1` или `2` + `members > 5` → "Private Hi-Ace"
  - `transfer_id=3` → "Free Shuttle Bus"
  - no transfer → `false`
- `x_studio_boat_name` = `boat.name` (текстовое поле, дублирует product line)

**Odoo order lines логика:**

| Line | Private | Shared |
|------|---------|--------|
| Boat | qty=1, price=0 | qty=1, price=0 |
| Tour | qty=1, price=`tour_price + boat_price` | qty=`members`, price=`tour_price / members` |
| Transfer | qty=cars, price=transfer.price (или bus_price если >5 чел) | аналогично |
| Cover | qty=1 (per_boat) или qty=people, price=cover.price | аналогично |
| Restaurant | qty=members, price=0 | qty=members, price=0 |
| Extras | qty=выбранное кол-во, price=extra.price | только для private |
- `rental_start_date` = `order.travel_date` + `route.start` (время), timezone Asia/Makassar → UTC
- `rental_return_date` = `order.travel_date` + `route.end` (время), timezone Asia/Makassar → UTC
- Shared: время берётся с route по умолчанию привязанного к туру
- Private: время берётся с route выбранного клиентом
- Когда меняются продукты (boat/tour/transfer/cover) — старый Odoo ордер **отменяется** и создаётся новый через `OdooService::recreateLead()`
- Когда меняются только поля (даты, адреса, люди, депозит) — используется `OdooService::updateOrderFields()` напрямую без пересоздания
- **Odoo → сайт webhook** (`POST /api/odoo/webhook`, `OdooWebhookController`):
  - `state=sale` → создаёт/обновляет `closeddates`
  - `state=cancel` → удаляет `closeddates` (пока DRY-RUN, закомментировано)
  - Лодка ищется по `Boat.amo_name` = `x_studio_boat_name` из payload
  - Тур определяется по `product_id` из order lines → `Tours.odoo_id`
  - Тип closeddate: `tour.types_id=1` → type=1 (shared), иначе type=2 (private)
  - **ВНИМАНИЕ**: весь webhook сейчас в DRY-RUN (только логирует, не пишет в БД)
  - **TODO**: активировать когда перейдём с Kommo на Odoo для закрытия календаря

## Admin panel

- PHP: `plugins/noren/booking/admin/AdminController.php` + `routes.php`
- Frontend: `src/LeadAdmin.jsx`
- Auth: Bearer токен из `services.config.php` → `admin_token`
- Маршруты начинаются с `/api/admin/`
- Список ордеров тянется из **Odoo** (не из локальной БД), затем обогащается данными из локальной БД (тур, local_id)
- Детальная страница показывает Odoo данные + linked local order

## API endpoints (admin)

```
GET  /api/admin/boats        — список лодок {id, name, odoo_id}
GET  /api/admin/tours        — список туров
GET  /api/admin/transfers    — список трансферов
GET  /api/admin/covers       — список covers
GET  /api/admin/odoo/orders  — список ордеров из Odoo (с enrichment)
GET  /api/admin/odoo/order/{id}       — один ордер Odoo + linked local
PATCH /api/admin/odoo/order/{id}      — обновить поля в Odoo напрямую
PATCH /api/admin/odoo/order/{id}/products — сменить boat/tour/transfer/cover → recreate
POST /api/admin/odoo/order/{id}/recreate  — полное пересоздание из local order
```

## Order statuses (`status_id`)

| ID | Name | Поведение |
|----|------|-----------|
| 1 | New | Письмо "created" на info@bluuu.tours |
| 2 | Confirmed | Оплата получена → dispatch в Odoo (source=1) или Kommo (source=2), письмо клиенту |
| 3 | Deleted | — |
| 4 | Pending Request | Не используется в текущей версии |
| 5 | Canceled by user | — |

Активные статусы в текущей версии: **1 и 2**

## Order flow

1. Клиент бронирует → ордер в **локальной БД** (`status_id = 1`, New)
2. Клиент может редактировать заказ (дата, люди, трансфер) пока не нажал "оплатить"
3. Нажал "оплатить" → открывается страница оплаты (Xendit/PayPal), редактирование закрыто
4. Оплата подтверждена → `status_id = 2` → **создаётся ордер в Odoo**
5. После оплаты клиент ничего не может менять до появления ЛК

## Payment flow

- Депозит (`deposite_summ`) = 50% или 100% от суммы — платится онлайн (Xendit / PayPal)
- Остаток (`x_studio_collect`) = `total_price - deposite_summ` — оплачивается позже
- **Личный кабинет** (в разработке): клиент заходит по ссылке из письма (по `key` / `external_id`), без логина
- Данные берутся из **Odoo** (не локальной БД) — чтобы работало для всех источников (сайт, Viator, ручные заказы)
- Клиент может менять детали заказа и оплатить collect онлайн — всё сохраняется в Odoo
- **Check-in** (в разработке): оплата на месте

## Pricing

- `boat_price` — аренда лодки, используется **только для private**
- `tour_price` — цена программы/тура, берётся из пакета цен привязанного к туру:
  1. Сначала ищется пакет по дате (`PricesByDates`) — если есть совпадение на дату
  2. Если нет — берётся дефолтный пакет (`Packages`)
  3. У каждого количества людей своя цена (price per pax)
  4. Каждый тур имеет свой прайс-лист
- В Odoo уходит: `tour_price + boat_price` как цена строки тура

## Tours & Boats

- Тур и лодка — всегда пара, без лодки тура нет
- 2 типа туров: **private** (`classes_id = 8`) и **shared** (`classes_id = 9`)
- Страницы на сайте: `/private` и `/shared`
- У каждого тура свой список лодок (связь `noren_booking_tours_boat`)
- **Private**: клиент выбирает лодку сам на сайте
- **Shared**: система автоматически подбирает лодку при бронировании по доступности и приоритету (`sort_order` на модели `Boat` — чем меньше, тем выше приоритет). Несколько shared заказов могут попасть на одну лодку до заполнения вместимости

## Transfer

- Трансфер = из отеля/дома до офиса (где лодки) и обратно
- `transfer_id = 3` = free shuttle bus (бесплатный, не требует адреса и машин)
- `cars` = количество машин
- `x_studio_pickup_cars` / `x_studio_drop_off_cars` — в Odoo
- `classes_id` на любой сущности = тип тура (8 = private, 9 = shared)

**Фильтрация Transfer и Cover по `classes_id`:**
- `classes_id = 8` → только для private
- `classes_id = 9` → только для shared
- `classes_id = null` (или `false`) → отображается на **обоих** типах туров

## Extras & Ecategories

- `Ecategory` → `Extras`: pivot `noren_booking_ecategories_extras`
- `Route` → `Ecategories`: pivot `noren_booking_route_ecategories`
- Цепочка: Route → Ecategories → Extras
- При выборе route на сайте показываются только extras из категорий привязанных к этому route

- Дополнительные услуги (снаряжение, фото и т.д.) — только для **private** туров
- Хранятся на ордере как JSON: `Order.extras = [{id, name, qty, price}, ...]`
- `Extras` модель имеет `odoo_id` — каждый экстра уходит отдельной строкой в Odoo order lines

## Cover (страховка)

- Cover = страховка для участников тура
- `classes_id = 8` → только private, `classes_id = 9` → только shared, `null` → оба типа
- `per_boat = true` → цена за всю группу (1 шт на лодку)
- `per_boat = false` → цена за каждого человека (`qty = adults + kids`)

## Route vs Program

- `program` — старая версия сайта, имеет свою цену
- `route` — новая версия сайта (текущая)
- Каждый `route` привязан к `program` (для совместимости)
- В Odoo уходит `route.name` или `program.name` как `x_studio_route`
- Время тура (`start`, `end`) берётся с `route`
- К каждому `route` прикреплён `restaurant` (питание включено в маршрут, не выбирается отдельно)

## Private booking logic — frontend naming conventions

В коде `private.jsx` используются специфические названия:
- **"style"** = route (маршрут) → `selectedStyleId`, `styles` array, `style.program_id`
- **"vibe"** = лодка (yacht) → `activeVibeId`, `vibes` array
- **"extras"** = дополнительные услуги → `selectedExtras` (объект `{id: qty}`)

## Private booking logic

- Клиент выбирает: тур + дату + лодку → трансфер + cover + extras
- Лодки отфильтрованы по туру и доступности на дату
- Клиент выбирает: тур → дату → route (маршрут) → лодку → трансфер + cover + extras
- Порядок route→лодка можно изменить — прямой связки между ними нет
- Route определяет: ресторан, список категорий экстрасов (`ecategories` привязаны к route через pivot `noren_booking_route_ecategories`)
- При смене route — список доступных extras меняется (фильтруется по `selectedStyleId`), но уже выбранные extras из корзины автоматически НЕ сбрасываются
- На странице есть кнопка "показать все лодки" (включая недоступные)
- `boat_id` всегда сохраняется в ордер (клиент сам выбирает)
- `boat_price` — поле на модели `Tours`, не у всех туров есть. Только для private

**Партнёрские лодки (`is_partner = true` на `Boat`):**
- Отображаются в списке как доступные "по запросу"
- При бронировании партнёрской лодки → запрос отправляется в respond.io
- **TODO**: интеграция с respond.io ещё не завершена

**Доступность лодки для private:**
- Нет записей в `closeddates` на дату → доступна
- Есть запись с `type = 2, 3, 4` → недоступна
- Есть только записи с `type = 1` (shared) → **недоступна** для private (лодка со shared заказами не может быть взята для private)

## Shared booking logic

- На странице `/shared` несколько shared туров, у каждого своя страница
- Каждый shared тур имеет: один route (зафиксирован), ресторан (через route), свои лодки
- Пользователь выбирает: тур (опцию) + дату → трансфер + cover (отфильтрованы по `classes_id = 9`)
- Цена: из `PricesByDates` → если нет совпадения → из `Packages` (по количеству людей)
- Route и ресторан не выбираются — уже привязаны к туру

**Логика доступности лодок для shared:**
1. Берём все лодки тура, сортируем по `sort_order` (ASC = приоритет)
2. Для каждой лодки проверяем `closeddates` на выбранную дату:
   - Нет записей → лодка свободна (все `capacity` мест доступны)
   - Есть записи с `type = 1` → частично занята, доступно = `capacity - SUM(members)`
   - Есть запись с `type = 2, 3, 4` → полностью закрыта, 0 мест
3. Суммируем доступные места по всем лодкам → показываем на странице тура
4. При бронировании: ищем лодку где хватает мест для всей группы (по `sort_order`)
   - Нашли → назначаем `boat_id` в ордер
   - Не нашли (места есть но разбросаны) → ордер без `boat_id`, Odoo ордер НЕ создаётся
   - **TODO**: уведомление менеджеру (Telegram) + интерфейс для ручного назначения лодки и отправки в Odoo
- Группа всегда на одной лодке (не разбивается)

- Места НЕ резервируются до оплаты — два клиента могут забронировать одни и те же места одновременно

**Закрытие календаря (closeddates):**
- `closeddates` НЕ создаётся напрямую из PHP при бронировании
- Флоу: оплата подтверждена → `status_id = 2` → ордер отправляется в Odoo → **Odoo webhook** → создаётся `closeddates`
- Вебхук обрабатывается в `OdooWebhookController`

## Closed dates (`Closeddates` на лодке)

**Таблица `noren_booking_closeddates`:**
| Колонка | Тип | Nullable | Описание |
|---------|-----|----------|---------|
| `id` | Integer (PK, AUTOINCR, unsigned) | — | — |
| `created_at` | Timestamp | ✓ | — |
| `updated_at` | Timestamp | ✓ | — |
| `deleted_at` | Timestamp | ✓ | Soft deletes |
| `date` | Date | ✓ | Дата закрытия |
| `boat_id` | Integer | ✓ | FK → `noren_booking_boat` |
| `lead_id` | Integer | ✓ | Старое поле (legacy) |
| `qtty` | Integer | ✓ | Количество людей (для shared) |
| `type` | Integer | ✓ | Тип закрытия (1–4) |
| `odoo_id` | Integer | ✓ | ID sale.order в Odoo |

Типы закрытия:
| Тип | Значение |
|-----|---------|
| 1 | Shared — на одну лодку+дату может быть несколько записей (по одной на каждый shared заказ). Доступность проверяется по сумме людей vs вместимость лодки |
| 2 | Private — лодка полностью занята |
| 3 | Вручную менеджером |
| 4 | Cron — каждый день в 21:30 (Bali time, Asia/Makassar UTC+8) все лодки закрываются на **следующий день** |

## Odoo sale.order — полная структура (пример #38409)

**Основные поля:**
```
id                    — Odoo ID
name                  — номер заказа (S40185)
state                 — статус: draft / sale / cancel
client_order_ref      — external_id с сайта (bluuu1775548297)
partner_id            — [id, name] клиента
company_id            — [id, name] компании лодки (PT Eldorado Satu Charters)
is_rental_order       — true
rental_start_date     — дата+время начала (UTC)
rental_return_date    — дата+время конца (UTC)
order_line            — массив ID строк заказа
amount_total          — итоговая сумма
currency_id           — [11, "IDR"]
```

**Кастомные поля (x_studio_*):**
```
x_studio_boat_name         — название лодки (текст)
x_studio_route             — название маршрута (текст)
x_studio_adults            — количество взрослых
x_studio_kids              — количество детей
x_studio_count_of_people   — итого людей (members)
x_studio_deposit           — депозит (получено)
x_studio_collect           — остаток к оплате
x_studio_payment_source    — метод оплаты (Xendit / PayPal)
x_studio_pickup_address    — адрес pickup
x_studio_drop_off_address  — адрес dropoff
x_studio_pickup_cars       — кол-во машин pickup
x_studio_drop_off_cars     — кол-во машин dropoff
x_studio_tour_type         — берётся из Tours.odoo_type (selection в Odoo: "Standard Shared", "Premium Shared", "First Class Shared", "Standard Private", "Premium Private", "Premium for Couples", "Private Diving", "Professional Fishing")
x_studio_free_shuttle_bus  — устарело
x_studio_boat              — false (не используется)
```

**Поля которые НЕ используются с сайта:**
`x_studio_agent`, `x_studio_guide_1/2`, `x_studio_checked_in_by`, `x_studio_responsible_guide`, `x_studio_passenger_list`, `x_studio_tour_date`, `x_studio_car_type`, `x_studio_agency_code`

## Important notes

- OctoberCMS **не поддерживает** синтаксис `with('relation:id,name')` — только `with('relation')`
- `saveQuietly()` — сохранение без триггера хуков (events)
- `external_id` на ордере = `client_order_ref` в Odoo
- `members` = `adults + kids` (общее количество людей = `x_studio_count_of_people` в Odoo)
- `source_id`: `1` = сайт (→ Odoo), `2` = Viator (→ Kommo)
- **Приоритет разработки**: сначала сайт → потом Odoo правила → потом Viator
- Деплой PHP — только FTP, git push обновляет только frontend-репозиторий
