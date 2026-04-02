# Bluuu UI Style Guide

This document describes the current visual system used in the Bluuu frontend.
It is based on the active tokens in `src/index.css`, `tailwind.config.js`, and the current component library in `src/`.

## 1. Brand Direction

- Clean premium travel UI.
- Bright ocean-blue accents on soft light neutrals.
- Large radii, soft borders, restrained shadows.
- Typography should feel calm, strong, and readable, not decorative.
- Default surfaces are white or very light neutral.

## 2. Source Of Truth

- Global tokens: `src/index.css`
- Tailwind theme mapping: `tailwind.config.js`
- Common section layout: `src/components/common/Section.jsx`
- Main landing patterns: `src/home.jsx`

## 3. Typography

### Font family

- Primary body font: `Petrov Sans`
- Primary heading font: `Petrov Sans`
- We currently use the same family for body and headings.

### Font weights

- Regular: `400`
- Semibold: `600`

### Recommended type scale

| Role | Typical size | Notes |
| --- | --- | --- |
| Hero H1 | `48px` to `72px` | Bold, tight tracking |
| Section H2 | `32px` to `40px` | Main section headline |
| Card H3 | `21px` to `36px` | Product or tour title |
| Body L | `16px` | Main paragraph copy |
| Body M | `14px` to `15px` | Card copy |
| Label / Eyebrow | `10px` to `12px` | Uppercase with wide tracking |
| Caption | `11px` to `12px` | Meta text, hints, small notes |

### Tracking and casing

- Eyebrows and mini labels use uppercase.
- Typical tracking values:
  - `0.18em`
  - `0.2em`
  - `0.28em`
  - `0.3em`

## 4. Color System

### Primary palette

| Token | Hex |
| --- | --- |
| `primary-50` | `#E6F4FF` |
| `primary-100` | `#CCE9FF` |
| `primary-200` | `#99D3FF` |
| `primary-300` | `#66BDFF` |
| `primary-400` | `#339FFF` |
| `primary-500` | `#007FFF` |
| `primary-600` | `#0073E0` |
| `primary-700` | `#005CB3` |
| `primary-800` | `#004786` |
| `primary-900` | `#003459` |
| `primary-950` | `#002542` |

### Secondary palette

| Token | Hex |
| --- | --- |
| `secondary-50` | `#2B2B2B` |
| `secondary-100` | `#232323` |
| `secondary-200` | `#1D1D1D` |
| `secondary-300` | `#171717` |
| `secondary-400` | `#121212` |
| `secondary-500` | `#0D0D0D` |
| `secondary-600` | `#090909` |
| `secondary-700` | `#060606` |
| `secondary-800` | `#040404` |
| `secondary-900` | `#020202` |
| `secondary-950` | `#000000` |

### Neutral palette

| Token | Hex |
| --- | --- |
| `neutral-50` | `#FAFBFB` |
| `neutral-100` | `#F3F5F6` |
| `neutral-200` | `#E6EAEC` |
| `neutral-300` | `#D9DFE2` |
| `neutral-400` | `#CBD4D8` |
| `neutral-500` | `#BEC9CF` |
| `neutral-600` | `#B1BDC6` |
| `neutral-700` | `#99A5AE` |
| `neutral-800` | `#7F8A95` |
| `neutral-900` | `#607077` |
| `neutral-950` | `#4B575F` |

### Semantic colors

| Token | Hex |
| --- | --- |
| `success` | `#10b981` |
| `error` | `#ef4444` |
| `warning` | `#f59e0b` |

### Usage rules

- Use `primary-600` for main CTAs and active states.
- Use `primary-50` to `primary-100` for soft accent backgrounds.
- Use `secondary-900` for strong text and dark emphasis.
- Use `neutral-50` to `neutral-200` for page background and card support layers.
- Keep success, error, and warning colors functional, not decorative.

## 5. Backgrounds

### Default page background

The main page background uses a layered light gradient:

```css
radial-gradient(70% 60% at 80% 10%, var(--primary-50) 0%, transparent 60%),
radial-gradient(60% 50% at 15% 95%, var(--primary-50) 0%, transparent 55%),
linear-gradient(180deg, var(--neutral-50) 0%, var(--neutral-50) 45%, var(--neutral-50) 100%)
```

### Surface rules

- Page background: `neutral-50`
- Primary cards: `white`
- Soft containers: `neutral-100`
- Highlight containers: `primary-50`

## 6. Border Radius

### Core radius tokens

| Token | Value |
| --- | --- |
| `--radius-sm` | `12px` |
| `--radius-md` | `18px` |
| `--radius-lg` | `26px` |
| `--radius-full` | `9999px` |

### Difference from Tailwind default radius scale

These project tokens are **not the same thing** as Tailwind's built-in `rounded-*` classes.

Important:

- `--radius-md` in our project is `18px`
- `rounded-md` in Tailwind is only `6px`
- The names look similar, but the values are different

### Tailwind default radius reference

| Tailwind class | Value |
| --- | --- |
| `rounded-sm` | `2px` |
| `rounded` | `4px` |
| `rounded-md` | `6px` |
| `rounded-lg` | `8px` |
| `rounded-xl` | `12px` |
| `rounded-2xl` | `16px` |
| `rounded-3xl` | `24px` |
| `rounded-full` | `9999px` |

### How our tokens compare

| Project token | Value | Closest Tailwind default |
| --- | --- | --- |
| `--radius-sm` | `12px` | `rounded-xl` |
| `--radius-md` | `18px` | no exact match, between `rounded-2xl` and custom |
| `--radius-lg` | `26px` | no exact match, slightly above `rounded-3xl` |
| `--radius-full` | `9999px` | `rounded-full` |

### Practical rule

- If you use `rounded-md`, you are using Tailwind's `6px`, not our `18px`.
- If you want the project token value exactly, use an arbitrary value like `rounded-[18px]` or map custom border radii in `tailwind.config.js`.
- Right now, the codebase mainly uses:
  - Tailwind defaults like `rounded-xl`, `rounded-2xl`, `rounded-full`
  - custom values like `rounded-[22px]`, `rounded-[24px]`, `rounded-[26px]`, `rounded-[32px]`

### Practical usage

| Element | Typical radius |
| --- | --- |
| Pills / chips | `rounded-full` |
| Inputs / tabs | `18px` to `22px` |
| Soft cards | `24px` |
| Main cards | `26px` to `32px` |
| Modal shells | `24px` to `32px` |

## 7. Layout Widths

### Containers

| Use case | Width |
| --- | --- |
| Default page container | `1280px` |
| Wide landing blocks | `1320px` |
| Text content max width | `620px` to `880px` |

### Typical horizontal padding

- Mobile: `16px`
- Tablet: `24px`
- Desktop: `24px` to `32px`

## 8. Spacing Scale

The project does not currently define spacing tokens in CSS variables, so use this working scale derived from active UI patterns.

| Name | Value | Common use |
| --- | --- | --- |
| `xs` | `4px` | Tiny gaps, icon separation |
| `sm` | `8px` | Tight inline spacing |
| `md` | `12px` | Dense card internals |
| `lg` | `16px` | Default internal spacing |
| `xl` | `20px` | Card sections |
| `2xl` | `24px` | Bigger containers |
| `3xl` | `32px` | Major grouping |
| `4xl` | `40px` | Section internals |
| `5xl` | `48px` | Large spacing |
| `6xl` | `64px` | Section padding start |
| `7xl` | `96px` | Large desktop section spacing |

### Current section rhythm

- Small section: `py-8` to `py-12`
- Default section: `py-12` to `py-16`
- Large landing section: `py-16` to `py-24`

## 9. Component Sizing

### Buttons

| Button type | Typical size |
| --- | --- |
| Small | `px-4 py-2` |
| Default | `px-6 py-3` |
| Large | `px-8 py-4` |

Rules:

- Primary CTA: filled `primary-600`
- Secondary CTA: white with `primary-600` border
- Default shape: `rounded-full` or `22px+`

### Inputs

- Height: `44px`
- Shape: `18px` radius
- Border: `neutral-200`
- Focus ring: `primary-600/10` to `primary-600/25`

### Cards

| Card part | Typical values |
| --- | --- |
| Outer shell | `rounded-[24px]` to `rounded-[32px]` |
| Inner media | `rounded-[24px]` to `rounded-[26px]` |
| Padding | `16px` to `24px` |
| Border | `1px` or `2px` |

## 10. Borders And Shadows

### Borders

- Default border: `neutral-200`
- Accent border: `primary-200` or `primary-500`
- White glass border: `white/80`

### Shadows

Tailwind shadow presets are disabled globally in `tailwind.config.js`.
Use explicit shadows with arbitrary values when needed.

Examples:

- `shadow-[0_18px_60px_rgba(6,18,40,0.08)]`
- `shadow-[0_28px_80px_rgba(6,18,40,0.13)]`
- `shadow-[0_16px_32px_rgba(0,115,224,0.28)]`

Rule:

- Prefer soft and wide shadows.
- Avoid hard, dark, short shadows.

## 11. Common UI Patterns

### Eyebrow label

- Uppercase
- `11px`
- Wide tracking
- `primary-600` or muted neutral

### Product / tour card

- White shell
- Soft border
- Large radius
- Strong title
- One accent area, not multiple competing accents

### Info box

- `neutral-100`
- `24px` radius
- `16px` padding
- Use icon + text rows with generous line-height

### Price box

- White or `primary-50`
- `24px` radius
- Strong price number
- Smaller uppercase "from" label

## 12. Recommended Do / Do Not

### Do

- Use white cards over soft light backgrounds.
- Keep primary blue as the main accent.
- Use large radii consistently.
- Use uppercase labels sparingly but consistently.
- Keep paragraphs within readable width.

### Do not

- Do not introduce purple as a default accent.
- Do not use hard black shadows.
- Do not mix many unrelated accent colors in one block.
- Do not use small sharp corners next to large rounded UI.
- Do not rely on default Tailwind shadows without checking the config.

## 13. Ready-To-Use Reference Values

### Recommended card shell

```txt
rounded-[32px]
border
bg-white
shadow-[0_18px_60px_rgba(6,18,40,0.08)]
```

### Recommended media block

```txt
rounded-[26px]
overflow-hidden
```

### Recommended info box

```txt
rounded-[24px]
bg-neutral-100
p-4
```

### Recommended CTA

```txt
rounded-[22px]
px-5
py-3.5
text-[15px]
font-semibold
```

## 14. Maintenance Note

If tokens in `src/index.css` or `tailwind.config.js` change, update this document so it stays aligned with the real implementation.
