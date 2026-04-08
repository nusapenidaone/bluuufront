# Дизайн-система проекта
*Строгие значения без диапазонов. Для ПК и Мобильных телефонов.*

## 1. Шрифты и Размеры текстов
*Шрифт: **Petrov Sans**. Начертания: Обычный (Regular) и Полужирный (SemiBold).*

**Главный заголовок сайта (H1)**
- ПК: **72px** (Полужирный)
- Мобильные: **48px** (Полужирный)

**Заголовки секций (H2)**
- ПК: **40px** (Полужирный)
- Мобильные: **32px** (Полужирный)

**Заголовки карточек туров (H3)**
- ПК: **28px** (Полужирный)
- Мобильные: **24px** (Полужирный)

**Основной текст (абзацы на страницах)**
- ПК: **16px** (Обычный)
- Мобильные: **16px** (Обычный)

**Текст внутри карточек (описание тура)**
- ПК: **14px** (Обычный)
- Мобильные: **14px** (Обычный)

**Мелкие подписи (ярлыки, метки, слово "от")**
- ПК: **12px** (Все заглавные)
- Мобильные: **11px** (Все заглавные)

---

## 2. Закругления (Радиусы)

- **Кнопки и круглые метки:** Полностью круглые (Пилюля / `9999px`)
- **Главные карточки (внешняя рамка тура):** `32px`
- **Фотографии внутри карточек:** `26px`
- **Серые инфо-плашки (внутри карточек):** `24px`
- **Поля ввода и выпадающие списки:** `18px`

---

## 3. Отступы и Поля

**Боковые отступы экрана (слева и справа)**
- ПК: **32px**
- Мобильные: **16px**

**Внутренние отступы в карточках туров (Padding)**
- ПК: **24px**
- Мобильные: **16px**

---

## 4. Цвета (HEX)

**Акценты (синие оттенки)**
- Главный синий (основные кнопки): `#0073E0`
- Синий при наведении на кнопку: `#007FFF`
- Нежный голубой фон (плашки, теги): `#E6F4FF`
- Темно-синий текст: `#003459`

**Фоны**
- Основной фон сайта: `#FAFBFB`
- Фон карточек туров (белый): `#FFFFFF`
- Светло-серые плашки: `#F3F5F6`

**Тексты**
- Заголовки (почти черный): `#020202`
- Тексты описаний (темно-серый): `#0D0D0D`
- Второстепенные тексты и подписи (серый): `#607077`

**Границы (бордеры)**
- Обводка всех карточек: Светло-серая `#E6EAEC`
- Толщина всех линий (карточки, кнопки): **1px**

---

## 5. Тени карточек

- У карточек есть широкая, очень мягкая и почти прозрачная тень.
- Цвет тени: `#061228` (Темно-синий, прозрачность 8%).
- Резкие и черные тени **запрещены**.

---

## 6. Иконки
- **Библиотека:** `lucide-react` (Lucide Icons)
- **Стиль:** Контурные (Outline), толщина линий `strokeWidth={2}` (по умолчанию)
- **Цвета иконок:**
  - Акцентные: `#0073E0`
  - Серые/Второстепенные: `#607077` или `#99A5AE`
- **Типичные размеры:**
  - Мелкие (в тексте): `16px` или `18px`
  - Основные (в кнопках/списках): `20px` или `24px`

---

# HOME2 — Темная тема (Dark Theme)
*Расширение базовой системы для страницы `/home2`. Применяется поверх Petrov Sans и токенов выше.*

## H2.1 Шрифты и размеры (Home2)

| Элемент | ПК | Мобильные | Начертание |
|---|---|---|---|
| **H1 (Hero)** | `72px` (line-height 1.05) | `48px` | SemiBold 600 |
| **H2 (секции)** | `40px` (line-height 1.1) | `32px` | SemiBold 600 |
| **H3 (карточки)** | `28px` (line-height 1.2) | `24px` | SemiBold 600 |
| **Body** | `16px` / `lh 24px` | `16px` | Regular |
| **Overline / Caps метки** | `13px` / letter-spacing `2.4px` | `12px` | Bold uppercase |

**Важно:** Tailwind утилита `.overline` (text-decoration: overline) перебивается через `text-decoration: none` в `.home2-wrapper .overline`.

## H2.2 Italic Accent в заголовках

Все цветные акценты внутри H1/H2/H3:

```css
.accent {
  color: #0073E0;
  font-style: italic;
}
```

- Цвет: **`#0073E0`** (фирменный синий)
- Стиль: **italic** (курсив)
- Применяется через `<span className="accent">` или к `.sku-section h2 .accent` → `#60A5FA` italic (на тёмных секциях)

---

## H2.3 Цветовая палитра (расширенная)

### Темные фоны
| Назначение | HEX |
|---|---|
| Главный dark-bg | `#0A1628` |
| Dark секции (sku, hero overlay) | `#0D1F3C` |
| Footer | `#070F1F` |
| Highlighted card gradient | `linear-gradient(160deg, #0D2151, #0A1A3E, #091628)` |

### Акцентные синие (dark)
| Назначение | HEX |
|---|---|
| Primary blue (CTA) | `#0073E0` |
| Hover blue | `#007FFF` |
| Light blue (текст/иконки на dark) | `#60A5FA` |
| Pale blue (текст вторичный) | `#BFDBFE` |

### Текст на тёмном фоне
| Уровень | rgba |
|---|---|
| Основной (heading) | `#FFFFFF` |
| Вторичный (body) | `rgba(255, 255, 255, 0.78)` |
| Muted (labels, descr) | `rgba(255, 255, 255, 0.5)` |
| Subtle (disclaimer) | `rgba(255, 255, 255, 0.3)` |

### Бордеры на dark
| Назначение | rgba |
|---|---|
| Card border (default) | `rgba(255, 255, 255, 0.1)` |
| Card border (subtle) | `rgba(255, 255, 255, 0.08)` |
| Footer top divider | `rgba(255, 255, 255, 0.07)` |
| Footer bottom divider | `rgba(255, 255, 255, 0.06)` |

### Зелёный (success / inclusive)
- Чек-марки и теги: `#34D399`
- Светлый: `#6EE7B7`
- Glass green bg: `rgba(16, 185, 129, 0.18)`
- Glass green border: `rgba(110, 231, 183, 0.4)`

---

## H2.4 Glass System (стеклянные элементы)

### Базовая стеклянная пилюля
```css
background: rgba(255, 255, 255, 0.06–0.18);
backdrop-filter: blur(10–14px);
border: 1px solid rgba(255, 255, 255, 0.18–0.45);
border-radius: 9999px;
```

### Варианты по цвету

| Вариант | Background | Border | Применение |
|---|---|---|---|
| **Белое стекло** | `rgba(255,255,255,0.18)` | `rgba(255,255,255,0.45)` | Hero rating badge |
| **Синее стекло** | `rgba(0,127,255,0.18)` | `rgba(96,165,250,0.45)` | "Best Price Guaranteed" |
| **Зелёное стекло** | `rgba(16,185,129,0.18)` | `rgba(110,231,183,0.4)` | "All Inclusive" tag |
| **Тёмное стекло** | `rgba(13,26,46,0.92)` | `rgba(255,255,255,0.08)` | Hero form card |

### Glass border через gradient mask
Для тонкой "светящейся" обводки используется `::before` с маской:

```css
::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.5px;
  background: linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.08) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  pointer-events: none;
}
```

Применяется на: glass кнопках ("See tour details", "Show all photos"), highlighted SKU card.

### Padding для glass-пилюль
- Стандарт: `8px 18px`
- Тонкий вариант (sku-glass-pill): `3px 14px` (без тени)
- Bottom-spacing у text: `font-size: 11–13px`, `letter-spacing: 1–1.6px`, uppercase

---

## H2.5 Тени и свечение (Blue Glow)

### Primary CTA glow (из tailwind.config.js)
```css
box-shadow: 0 16px 32px rgba(0, 115, 224, 0.45),
            0 0 0 1px rgba(0, 127, 255, 0.4) inset;
```
Hover:
```css
box-shadow: 0 18px 38px rgba(0, 127, 255, 0.55),
            0 0 0 1px rgba(0, 127, 255, 0.6) inset;
```

### Highlighted card multi-layer glow (Private Charter)
```css
box-shadow:
  0 0 0 1px rgba(59, 130, 246, 0.5),
  0 8px 40px rgba(59, 130, 246, 0.2),
  0 0 60px rgba(59, 130, 246, 0.08);
```

### Card shadow (default dark)
```css
box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
```

### Запреты
- Резкие чёрные тени **запрещены**
- На glass-пилюлях `box-shadow: none` (только gradient border)

---

## H2.6 Радиусы (Home2)

| Элемент | Радиус |
|---|---|
| Pill / кнопка / метка | `9999px` (`var(--radius-full)`) |
| SKU карточка (Choose your tour type) | `24px` |
| Highlighted SKU card glow border | `25px` (на 1px больше для outset эффекта) |
| Hero form card | `var(--radius-lg)` |
| Inputs (форма) | `10px` |
| FAQ items | без обёртки (фон transparent) |

---

## H2.7 Hero (особенности)

- **Высота:** `100dvh` (полный экран)
- **Hero-content:** `align-items: flex-end`, `padding-bottom: 40px`
- **Overlay gradient:** `linear-gradient(180deg, rgba(0,52,89,0.05) 0%, rgba(0,52,89,0.18) 30%, rgba(0,52,89,0.55) 70%, rgba(0,37,66,0.85) 100%)` — синий, не чёрный
- **Price-strip:** прозрачный поверх видео, белый текст, бордеры `rgba(255,255,255,0.15)`
- **Иконки в price-strip:** `#BFDBFE`

---

## H2.8 Hero Form (Plan your adventure)

```css
.hero-form {
  background: rgba(13, 26, 46, 0.92);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  padding: 28px;
  width: 380px;
}
```

- **Inputs:** `rgba(255,255,255,0.04)` фон, `rgba(255,255,255,0.16)` бордер, белый текст, placeholder `rgba(255,255,255,0.42)`
- **Focus:** бордер `rgba(128,148,245,0.7)` + ring `rgba(128,148,245,0.18)`
- **Кнопка:** primary blue `#0073E0` + blue glow, height `52px`, **margin-top: 28px** (увеличенный отступ от последнего поля)
- **Поля:** объединены в одно "Email or WhatsApp Number" вместо двух

---

## H2.9 SKU карточки (Choose your tour type)

### Контейнер секции
```css
.sku-section { background: #0D1F3C; }
```

### Базовая карточка
```css
.sku-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
}
```

### Highlighted (Private Charter, 2-я карточка)
- Градиентный фон: `linear-gradient(160deg, #0D2151, #0A1A3E, #091628)`
- `::before` с gradient-glow border (см. H2.4)
- `::after` верхняя свечащаяся линия `linear-gradient(90deg, transparent, rgba(96,165,250,0.8), transparent)`
- Multi-layer blue glow (см. H2.5)

### Кнопки SKU
- **Outline (1-я карточка)** — стеклянная без бордера, gradient mask `::before` (см. H2.4)
- **Filled (2-я карточка)** — `linear-gradient(90deg, #3B82F6, #6366F1)` + `0 4px 20px rgba(59,130,246,0.45)`

### Glass pill в price-box
- "All Inclusive" — зелёное стекло, position: absolute top-right (14px, 14px)
- Padding: `3px 14px`, без тени

---

## H2.10 Footer (Dark)

```css
.footer { background: #070F1F; }
```

| Элемент | Цвет |
|---|---|
| Logo svg path | `#FFFFFF` |
| H4 заголовок колонки | `rgba(255, 255, 255, 0.9)` |
| Ссылки | `rgba(255, 255, 255, 0.5)` |
| Hover ссылок | `#60A5FA` |
| Описание | `rgba(255, 255, 255, 0.5)` |
| Footer-bottom текст | `rgba(255, 255, 255, 0.3)` |
| Top divider | `rgba(255, 255, 255, 0.07)` |
| Bottom divider | `rgba(255, 255, 255, 0.06)` |

- **Margin-bottom логотипа:** `20px` (для выравнивания первой строки описания с первой ссылкой соседних колонок)
- **Padding-right footer-bottom:** `220px` (USD не перекрывается фиксированной "Chat with us" кнопкой)

---

## H2.11 Скоупинг

Все стили Home2 обёрнуты в `.home2-wrapper { ... }` чтобы не протекать на другие страницы. Корневой компонент:

```jsx
<div className="home2-wrapper">
  ...
</div>
```

Шрифт подключается через глобальный `var(--font-body)` / `var(--font-heading)` из `src/index.css` (Petrov Sans). Локальный `@font-face` в Home2.css **запрещён**.
