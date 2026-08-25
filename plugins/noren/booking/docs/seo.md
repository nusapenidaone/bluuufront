# SEO — React (Bluuu Tours)

## Стек

- **react-helmet-async** — управление тегами `<head>` из React-компонентов
- **`<HelmetProvider>`** — добавлен в `src/main.jsx`, покрывает всё приложение
- **`<SEO>`** — компонент `src/components/SEO.jsx`, используется на каждой странице
- **`src/lib/schemas.js`** — константы Schema.org JSON-LD

---

## Компонент SEO

**Файл:** `src/components/SEO.jsx`

```jsx
<SEO
  title="..."
  description="..."
  image="..."        // необязательно — URL картинки для OG/Twitter
  canonical="..."    // необязательно — вычисляется из window.location.pathname
  type="website"     // необязательно — "website" | "article"
  schema={...}       // необязательно — объект или массив Schema.org JSON-LD
/>
```

### Что генерирует компонент

| Тег | Описание |
|-----|----------|
| `<title>` | Заголовок вкладки и поисковой выдачи |
| `<meta name="description">` | Описание страницы |
| `<link rel="canonical">` | Канонический URL без GET-параметров |
| `<meta property="og:type">` | Тип страницы: `website` или `article` |
| `<meta property="og:title">` | Заголовок для соцсетей |
| `<meta property="og:description">` | Описание для соцсетей |
| `<meta property="og:image">` | Картинка для превью |
| `<meta property="og:url">` | URL страницы |
| `<meta property="og:site_name">` | `Bluuu Tours` |
| `<meta name="twitter:card">` | `summary_large_image` |
| `<meta name="twitter:title">` | Заголовок для Twitter/X |
| `<meta name="twitter:description">` | Описание для Twitter/X |
| `<meta name="twitter:image">` | Картинка для Twitter/X |
| `<script type="application/ld+json">` | Schema.org разметка (если передан `schema`) |

Дефолтная OG-картинка (если `image` не передан):
```
https://bluuu.tours/storage/app/media/poster.webp
```

Canonical всегда указывает на **чистый URL без GET-параметров** — `?adults=`, `?kids=`, `?date=`, `?transfer=`, `?pickup=` не попадают в canonical.

---

## Schema.org JSON-LD

**Файл:** `src/lib/schemas.js`

Три типа разметки, каждый передаётся через `schema` prop компонента `<SEO>`.

---

### 1. WebSite

Только на главной странице (`/`). Говорит поисковикам, что это сайт, и позволяет добавить поиск в Rich Results.

```js
import { schemaWebSite } from "./lib/schemas";

<SEO ... schema={schemaWebSite} />
```

```json
{
  "@type": "WebSite",
  "name": "Bluuu Tours",
  "url": "https://bluuu.tours"
}
```

---

### 2. LocalBusiness → TravelAgency

На главной и странице About. Говорит Google, что это реальный бизнес с адресом, рейтингом, типом услуги.

```js
import { schemaLocalBusiness } from "./lib/schemas";

<SEO ... schema={schemaLocalBusiness} />
```

```json
{
  "@type": "TravelAgency",
  "name": "Bluuu Tours",
  "url": "https://bluuu.tours",
  "address": {
    "addressLocality": "Sanur",
    "addressRegion": "Bali",
    "addressCountry": "ID"
  },
  "aggregateRating": {
    "ratingValue": "4.9",
    "reviewCount": "8500"
  }
}
```

На главной передаётся массив `[schemaWebSite, schemaLocalBusiness]` — оба блока рендерятся в одном `<script>`.

---

### 3. Article

Только на страницах статей блога (`/blog/:slug`). Данные динамические — берутся из API.

```js
import { schemaArticle } from "./lib/schemas";

<SEO ... schema={post ? schemaArticle(post, slug) : undefined} />
```

```json
{
  "@type": "Article",
  "headline": "post.seo_title || post.title",
  "description": "post.seo_description || post.description",
  "image": "post.cover",
  "datePublished": "post.created_at",
  "dateModified": "post.updated_at",
  "author": { "@type": "Organization", "name": "Bluuu Tours" },
  "publisher": {
    "@type": "Organization",
    "name": "Bluuu Tours",
    "logo": { "@type": "ImageObject", "url": "...logo.svg" }
  },
  "mainEntityOfPage": "https://bluuu.tours/blog/{slug}"
}
```

Schema рендерится только когда `post` загружен — пока идёт загрузка, JSON-LD не выводится.

---

## Где что подключено

| Страница | `og:type` | Schema.org |
|----------|-----------|------------|
| `/` | `website` | `WebSite` + `TravelAgency` |
| `/about` | `website` | `TravelAgency` |
| `/private-tour-to-nusa-penida` | `website` | — |
| `/shared-tour-to-nusa-penida` | `website` | — |
| `/blog` | `website` | — |
| `/blog/:slug` | `article` | `Article` (динамически) |
| `/reviews`, `/gallery`, `/faq`, `/policy/*` | `website` | — |

---

## SEO данных для блога (с бекенда)

Для страницы статьи `/blog/:slug` SEO берётся динамически из API:

```
post.seo_title       → <title>, og:title, schema headline
post.seo_description → meta description, og:description, schema description
post.cover           → og:image, twitter:image, schema image
post.created_at      → schema datePublished
post.updated_at      → schema dateModified
```

Fallback-цепочка:
```
seo_title       → title       → "Blog | Bluuu Tours"
seo_description → description → ""
cover           → poster.webp
```

Поля `seo_title` и `seo_description` заполняются в OctoberCMS в разделе Blog.

---

## Как обновить SEO страницы

Найти `<SEO>` в файле страницы и обновить props:

```jsx
// src/AboutPage.jsx
<SEO
  title="About Bluuu Tours | Nusa Penida Yacht Experts"
  description="Bluuu is Bali's #1 yacht tour company..."
  canonical="https://bluuu.tours/about"
  schema={schemaLocalBusiness}
/>
```

Для блога — редактировать поля `seo_title` и `seo_description` в OctoberCMS.

---

## Следующие этапы

### Prerender.io / SSR

React генерирует корректные теги, но поисковики видят их только при Server-Side Rendering или Prerender.io. Подключение Prerender.io на уровне Nginx — следующий независимый этап.

### TourPackage Schema для туров

Для `/private-tour-to-nusa-penida` и `/shared-tour-to-nusa-penida` можно добавить `@type: TourPackage` или `Product` с ценой и рейтингом для Rich Results в Google.
