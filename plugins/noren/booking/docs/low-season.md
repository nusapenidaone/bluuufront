# Low Season — сезонная скидка: что сделано

Статус на 2026-10-06:
- **Бэкенд** готов. Шаг 1 (модель) уже залит на сервер. Шаги 2–5 готовы локально и **ждут FTP-заливки**.
- **Фронтенд** сделан локально (2026-10-06), `npm run build` проходит. На реальных данных не проверен. Детали — раздел 4.
- **Скидки на реальные даты не включать до выхода нового фронта.** Тестировать можно на далёких датах (например, 2029).

---

## 1. Что это

Процентная скидка на выбранные туры в заданный интервал дат. Работает на сайте (private/shared), в личном кабинете, в чатботе и в Odoo.

**Правила:**
- Скидка действует, если дата тура попадает в `[date_start, date_end]` (включительно) активного правила, привязанного к туру.
- Скидка только на тур: цена пакета за N людей (`tier_price`), плюс `boat_price` для private. Трансфер, cover и extras идут по полной цене.
- Сумма скидки = `round((tier + boat) × % / 100)`. Из неё `boat_discount = round(boat × % / 100)`, остаток снимается с tier.
- Если правил на дату несколько, берётся максимальный %.
- Депозит (30% или 100%) и остаток считаются от суммы со скидкой.
- Скидка фиксируется в момент бронирования. Если правило создано позже, старые заказы не пересчитываются, пока клиент не сменит дату или число людей в кабинете.
- Viator не участвует (там цены задаёт OTA).

---

## 2. Шаг 1 — модель и админка (залито на сервер)

| Что | Где |
|---|---|
| Таблица правил `noren_booking_lowseason`: `name`, `date_start`, `date_end`, `percent` (1–90), `is_active` | `updates/builder_table_create_noren_booking_lowseason.php` (v1.0.262) |
| Pivot `noren_booking_lowseason_tours` (`lowseason_id`, `tours_id`) | `updates/builder_table_create_noren_booking_lowseason_tours.php` (v1.0.263) |
| Модель: валидация, `belongsToMany tours`, scopes `activeOn($date)` и `upcoming()` | `models/LowSeason.php`, `models/lowseason/fields.yaml`, `columns.yaml` |
| Админка: меню Tours → Low Season | `controllers/LowSeason.php`, `controllers/lowseason/*` |
| Permission `noren.booking.access_lowseason` и пункт меню `side-menu-item22` | `plugin.yaml` |
| Связь `Tours.lowseasons` | `models/Tours.php` |
| Блок «Low season discounts» во вкладке Price формы тура | `models/tours/fields.yaml`, `controllers/tours/config_relation.yaml` |

---

## 3. Шаги 2–5 — расчёт, заказы, Odoo, API, чатбот (локально, ждёт заливки)

### 3.1 Единый расчёт цены — `classes/TourPricing.php`
- `pricelistFor($tour, $date)` — сезонный пакет (PricesByDates) или пакет по умолчанию.
- `tierPrice($pricelist, $members)` — ближайший тир с `members_count <= members`; если такого нет, самый маленький тир.
- `lowSeasonPercent`, `lowSeasonFor` — процент и правило на дату (max %).
- `lowSeasonsFor($tour)` — будущие активные правила для API. `maxUpcomingPercent($tour)` — для цены «от».
- `quote($tour, $date, $members, $isPrivate)` возвращает `tier_price`, `boat_price`, `original`, `percent`, `discount`, `tour_price`, `boat_price_final`, `total`, `low_season`.

### 3.2 Заказ — новые поля
- Миграция `updates/builder_table_update_noren_booking_order_31.php` (v1.0.264): `lowseason_percent` и `lowseason_discount` в `noren_booking_order`.
- Поля видны в админке заказа (disabled): `models/order/fields.yaml`.
- `tour_price`/`boat_price` на заказе хранятся **со** скидкой. `total_price`, `full_price` и `deposite_summ` тоже со скидкой.
- Legacy-поля `discount` и `discount_price` не используются: по старой логике в них «Total without Discount», и депозит считался бы от суммы без скидки.

### 3.3 Где подключено
| Файл | Что изменено |
|---|---|
| `api/PrivateOrderController.php` | `applyLowSeason()`. При активной скидке сервер перезаписывает tour/boat price и переносит разницу в total/full. Без скидки цена от фронта сохраняется как раньше. Ветка партнёрской лодки переведена на хелпер |
| `api/SharedOrderController.php` | То же для shared (`boat_price = 0`) |
| `api/AccountController.php` (`updateProducts`) | Цена через `TourPricing::quote` + поля `lowseason_*`. В ответе `prices` добавлены `lowseason_percent` и `lowseason_discount` |
| `api/CabinetController.php` (`performUpdate`) | Строка тура в Odoo: `price_unit` = цена со скидкой, `discount` = 0. % скидки: активная на новую дату → она; перенос даты без скидки → 0; смена только людей → % заказа (`Order.lowseason_percent`). Локальный `Order.lowseason_*` обновляется. В GET добавлены `local.lowseason_percent` и `local.tour_odoo_id` |
| `api/CabinetController.php` (`buildPricelist`/`buildPricing`) | В `options.pricing` добавлены `boat_price` и `low_seasons` (pricelist отдаётся **без** скидки) |
| `odoo/OdooService.php` (`addOrderLines`) | Строка тура: `price_unit` = цена со скидкой (`tour_price + boat_price` с ордера), `discount` = 0. **Изменено 2026-10-08** по решению пользователя (было: полная цена + `discount` = %) |
| `odoo/OdooService.php` (`syncOrderLineQuantities`) | Shared: хелпер + `discount` |
| `odoo/OdooService.php` (`getFullOrder`) | Строки читаются вместе с `discount` и `price_subtotal` |
| `odoo/OdooService.php` (заметка к ордеру) | Строка «Low season −X% (−сумма IDR)» |
| `api/FullController.php` | `low_seasons[]` в `tours/private`, `tours/shared`, `tour/{slug}` |
| `chatbot/ChatbotControllerV2.php`, `chatbot/routes.php` | См. 3.4 |

### 3.4 Чатбот
- `GET boats/private` и `boats/shared`: `pricing.low_seasons[]`, `low_season_max_percent`. У shared ещё `pricing.default_price_discounted`.
- `POST quote`: в `breakdown` (IDR и USD) появились `original_boat_base_price`, `low_season_percent`, `low_season_discount`. `boat_base_price`, `total_price` и `price_per_pax` уже со скидкой. В `meta` добавлен `low_season`. В `odoo_data.lines[tour]`: `price` = цена со скидкой, `discount` = 0.
- `GET availability`: `low_season_percent` у каждого элемента `available[]`.
- **Новый** `GET /api/v2/chatbot/low-season`: активные и будущие скидки с турами сайта.
- Документация: `chatbot/API.md`, `chatbot/API.en.md`. Раздел «Low season» также добавлен в `CLAUDE.md`.

### 3.5 Совместимость со старым фронтом
- В API только добавлены новые поля, старые не менялись.
- Без активной скидки всё считается как раньше: при создании заказа сервер цену не трогает, а пересчёт в кабинете и Odoo даёт ту же цифру.
- Если включить скидку на реальные даты до выхода нового фронта, клиент увидит на сайте полную цену, а в заказе и счёте будет цена со скидкой. Поэтому скидки создавать выключенными (`Active = off`) или только на далёкие даты.

### 3.6 Проверено
- `php -l` всех изменённых PHP-файлов — без ошибок. YAML-файлы корректны.
- Скрипт с заглушками прогнал настоящий `TourPricing.php`: **29/29 проверок прошли**. Проверены: без скидки, 20%, пересечение правил (max), границы интервала, неактивное правило, shared, сезонный пакет, округление 7% и совпадение с подсчётом Odoo.
- На реальном сайте **не проверено** (локально нет vendor-пакетов Laravel).

### 3.7 Что залить по FTP (всё внутри `plugins/noren/booking/`)
- **Новые:** `classes/TourPricing.php`, `updates/builder_table_update_noren_booking_order_31.php`.
- **Изменённые:**
  - `updates/version.yaml`
  - `models/order/fields.yaml`
  - `api/PrivateOrderController.php`, `api/SharedOrderController.php`, `api/AccountController.php`, `api/CabinetController.php`, `api/FullController.php`
  - `odoo/OdooService.php`
  - `api/CabinetController.php` — также поле `local.tour_odoo_id` для фронта кабинета (добавлено на шаге 6)
  - `chatbot/ChatbotControllerV2.php`, `chatbot/routes.php`
  - `chatbot/API.md`, `chatbot/API.en.md`
- **Сразу после заливки** зайти в админку, чтобы применилась миграция v1.0.264. Иначе создание заказа упадёт с ошибкой «нет колонки lowseason_*».
- ⚠ В `FullController.php` и `OdooService.php` были незакоммиченные изменения ещё до этой задачи. Они тоже уедут на сервер.

### 3.8 Тест после заливки
1. Создать скидку на одну неделю 2029 года, один тестовый тур, −20%.
2. `POST /api/v2/chatbot/quote` на дату внутри недели: −20% только на тур (+ лодку). Трансфер и cover по полной цене.
3. То же на дату вне недели: цена как до изменений.
4. `GET /api/v2/chatbot/low-season` возвращает это правило.
5. (Опционально) тестовый заказ на сайте на эту неделю, **без оплаты**. В админке у заказа заполнены «Low season (%)» и сумма скидки.

---

## 4. Шаг 6 — фронтенд (сделан локально 2026-10-06)

**Общая логика — `src/components/booking/utils.js`:**
- `getLowSeasonForDate`, `maxLowSeasonPercent`, `applyLowSeason` (та же формула, что `TourPricing::quote`).
- `calculateBoatPriceDetailed`; `calculateBoatPrice` теперь возвращает цену **со** скидкой.
- `withBoatPrice(card, date, members, tours)` проставляет на карточку `priceValue`, `priceOriginal` и `lowSeasonPercent`.
- `useBoatPricingDetailed`.
- Компоненты `LowSeasonBadge` и `OldPrice` — в `src/components/booking/LowSeasonBadge.jsx`.

**`private.jsx` / `shared.jsx`:**
- Цена «от» уже с максимальной будущей скидкой, полная зачёркнута, бейдж «Low season up to −X%».
- После выбора даты зачёркнутая цена и бейдж показываются на карточках, в панели выбора дня и в confirm-модалке.
- Price summary: «Boat base price» (полная) → «Low season −X%» → итог со скидкой. В StepCheckout — плашка «Prices include … low season discount».
- В `/payment` уходят параметры `lsPercent`, `lsDiscount`, `lsOriginal`. Private `boatPrice` = boat − boatDiscount.
- В `shared.jsx` удалён дубликат `calculateBoatPrice`/`useBoatPricing`, теперь используется общий из `utils.js`.

**`Payment.jsx`:** в Order summary полная цена тура и строка «Low season −X%».

**`cabinet.jsx`:**
- Текущая скидка берётся из `discount` строки тура в Odoo (строка находится по `local.tour_odoo_id`, иначе — первая строка со скидкой). Показывается строкой «Low season −X%» в блоке Pricing.
- Превью при смене даты или людей учитывает `boat_price` и `low_seasons` по тем же правилам, что `performUpdate`.

**`privatenew.jsx` / `sharednew.jsx`** (стейджинг) — то же самое, что на живых страницах. В `sharednew.jsx` удалена своя копия расчёта. В компактных карточках только бейдж «−X%» (компонент `LowSeasonTag`).

**Не трогали:**
- Мёртвый код `CheckoutModal`/`ChooseBoatSection`/`renderCard`.
- Подсветка дней в календаре.

**Известное расхождение:** если у `PricesByDates` задан свой `boat_price`, фронт берёт его, а сервер — `Tours.boat_price`. Это было и до скидок; при активной скидке сервер выравнивает итог по своей цене.

## 5. Открытые вопросы и ограничения
- Коммит «до системы скидок» с пушем на GitHub заблокировал автоматический фильтр. Скорее всего, из-за нового `cashlez/services.config.php` с боевыми ключами. Сделать вручную.
- Если админ в LeadAdmin вручную правит `tour_price` у заказа со скидкой, `lowseason_*` не пересчитываются. Редкий кейс, не обработан.
- Backend-валидации, что фронт прислал ту же цену, нет: при активной скидке сервер просто перезаписывает цену своей.
