# План: перевод фильтрации туров/трансферов/каверов с classes_id на types_id (+source_id)

> Статус: НЕ реализовано (план на будущее). Составлен 2026-07-23.

## Суть

Сейчас разделение private/shared в API держится на `classes_id` (8=private, 9=shared).
Новая схема:

- **Туры**: `classes_id=8` → `types_id=2 AND source_id=1`; `classes_id=9` → `types_id=1 AND source_id=1`
- **Transfer / Cover**: `classes_id=8` → `types_id=2`; `classes_id=9` → `types_id=1`; семантика `NULL = для обоих типов` сохраняется
- **Route (маршруты)**: НЕ трогаем — у таблицы Route нет `types_id`

Значения: `types_id = 2` → private, `types_id = 1` → shared.

## Текущее состояние (проверено по коду)

- Все нужные колонки уже существуют: `types_id` есть у Tours (миграция tours_2), Transfer (transfer_8), Cover (cover_7); `source_id` есть у Tours (tours_43). Миграции НЕ нужны.
- **CabinetController уже частично переведён** на эту схему (строки 50-63, 164-176: `types_id===2`→private, `types_id===1`→shared, `!types_id`=оба) — эталонный паттерн для остальных мест.
- Фронтенд менять не нужно: он дергает раздельные эндпоинты (`/tours/private`, `/tours/shared`, `/transfers/private`…) и `classes_id` в запросах не передаёт.

## Правила замены

1. **Выборки туров (списки)**: `->whereIn('classes_id',[8])` / `->where('classes_id',9)` → `->where('types_id', 2|1)->where('source_id', 1)`
2. **Ветвление по загруженному туру**: `$tour->classes_id == 9` → `$tour->types_id == 1`; `== 8` → `== 2` (source_id тут не нужен — тур уже выбран)
3. **Transfer/Cover**: `whereNull('classes_id')->orWhere('classes_id', 8|9)` → `whereNull('types_id')->orWhere('types_id', 2|1)`; в коллекция-фильтрах: `!$t->classes_id || (int)$t->classes_id === 8` → `!$t->types_id || (int)$t->types_id === 2` (зеркально CabinetController:167,176)
4. **Generic-эндпоинты с query-параметром** (`/api/new/transfers?classes_id=`, `/covers?classes_id=`): сохраняем имя параметра для совместимости, внутри маппим значение: `8→types_id 2`, `9→types_id 1`, иначе значение как есть

## Файлы и точки изменения (7 PHP-файлов)

### 1. plugins/noren/booking/api/FullController.php
- :79 `getPrivateTours()` — правило 1 (types_id=2, source_id=1)
- :321 `getSharedTours()` — правило 1 (types_id=1, source_id=1)
- :409 `getSharedAvailability()` — правило 1 (types_id=1, source_id=1)
- :135 `getTourDetail()` — правило 2 (`classes_id==9` → `types_id==1`; проверка slug остаётся)
- :666, :679 `getPrivateTransfers()/getSharedTransfers()` — правило 3
- :690-695 `getTransfers()` — правило 4
- :725, :736 `getPrivateCovers()/getSharedCovers()` — правило 3
- :746-751 `getCovers()` — правило 4
- НЕ трогать: :568-578 `getRoutesForClass()` (Route остаётся на classes_id)

### 2. plugins/noren/booking/api/CabinetController.php
- :718, :804 — выборки shared туров: правило 1 (types_id=1, source_id=1)
- НЕ трогать: :50-63, :164-176 (уже на types_id), :195 (Route)

### 3. plugins/noren/booking/api/AccountController.php
- :54, :185 `isPrivate = in_array(classes_id,[8])` → `(int)$order->tours?->types_id === 2` — правило 2
- :58, :67 — фильтры transfers/covers: правило 3 (коллекция-вариант); переменную `$classesId` перенаправить на types-значение (private→2, shared→1)

### 4. plugins/noren/booking/chatbot/ChatbotControllerV2.php
- :60, :125 — выборки private туров: правило 1 (types_id=2, source_id=1)
- :214 — выборка shared туров: правило 1 (types_id=1, source_id=1)
- :174, :186 — фильтры transfers/covers (private, 8→2): правило 3
- :288 — фильтр (shared, 9→1): правило 3

### 5. plugins/noren/booking/viator/ViatorController.php
- :82, :129 `$tour->classes_id == 9` → `$tour->types_id == 1` — правило 2
- :141 `classes_id == 8` → `types_id == 2` — правило 2
- :23-24 — поправить комментарии в доке-шапке

### 6. plugins/noren/booking/odoo/OdooService.php
- :518, :1042 `classes_id === 9` → `types_id === 1` — правило 2

### 7. plugins/noren/booking/odoo/OdooWebhookController.php
- :67 `$type = classes_id===9 ? 1 : 2` → `types_id===1 ? 1 : 2` — правило 2

### Не меняются
- Route-фильтрация (FullController:578, CabinetController:195)
- Фронтенд (src/*) — целиком
- `controllers/tours/config_filter.yaml` (админ-фильтр по classes_id можно оставить)
- Доки `chatbot/API.md` — при желании обновить упоминания classes_id (2 строки)

## Prerequisite (данные, вне кода)

Перед выкладкой в БД должны быть заполнены:
- у всех private туров: `types_id=2`, `source_id=1`; у shared: `types_id=1`, `source_id=1`
- у Transfer/Cover: `types_id` (2/1/NULL) в соответствии с текущими `classes_id` (8/9/NULL)

Иначе списки туров на сайте станут пустыми. CabinetController уже работает на types_id — значит для туров данные, скорее всего, заполнены; проверить transfers/covers.

## Verification

1. `php -l` на все 7 изменённых файлов (php.exe в /c/xampp/php/)
2. PHP деплоится вручную по FTP → после выкладки сравнить ответы API до/после:
   - `GET /api/new/tours/private` и `/tours/shared` — те же списки туров
   - `GET /api/new/transfers/private|shared`, `/covers/private|shared` — те же списки
   - `GET /api/new/transfers?classes_id=8` — обратная совместимость параметра
3. Прогнать страницы `/privatenew`, `/sharednew` (лодки/тиры отображаются, transfer/cover выбираются)
4. Проверить чат-бот эндпоинты и Viator (availability отвечает), ЛК открывается
