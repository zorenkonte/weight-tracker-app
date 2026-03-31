---
name: ui-ux-pro-max
description: "Comprehensive design guide for web and mobile applications. Contains 67 styles, 161 color palettes, 57 font pairings, 99 UX guidelines, and 25 chart types across 16 technology stacks. Searchable database with priority-based recommendations."
---

# ui-ux-pro-max

Comprehensive design guide for web and mobile applications. Contains 67 styles, 161 color palettes, 57 font pairings, 99 UX guidelines, and 25 chart types across 16 technology stacks.

Source: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

---

## When to Apply

Use this skill when tasks involve **UI structure, visual design decisions, interaction patterns, or UX quality control**.

- New page or component (landing page, dashboard, admin, SaaS)
- Creating or refactoring UI components (buttons, modals, forms, tables, charts)
- Choosing color schemes, fonts, spacing, or layout systems
- Reviewing UI code for UX, accessibility, or visual consistency
- Implementing navigation, animations, or responsive behavior
- Improving perceived quality, clarity, or usability

---

## Design System Workflow

### Step 1 — Analyze Requirements

Extract key information from the user request:
- **Product type**: SaaS, e-commerce, healthcare, portfolio, lifestyle, fintech, etc.
- **Target audience**: consumer, B2B, developer, etc.
- **Style keywords**: minimal, dark, vibrant, glassmorphism, brutalist, etc.
- **Stack**: Next.js, React, Vue, Nuxt, HTML+Tailwind, etc.

### Step 2 — Select Design System

Match the product type to the best:
- **UI Style** (67 options): Minimalism, Glassmorphism, Claymorphism, Bento Grid, Neumorphism, etc.
- **Color Palette** (161 options): industry-specific; wellness → greens, fintech → blues/navy, etc.
- **Typography** (57 pairings): match to mood — elegant, playful, editorial, technical
- **Landing Pattern** (24 patterns): Hero-Centric, Progress-Centric, Feature-Grid, Social-Proof, etc.
- **Key Effects**: soft shadows, smooth transitions (200–300ms), hover states

### Step 3 — Generate & Implement

Apply the design system to component code. Validate against the Pre-Delivery Checklist below.

---

## Rule Categories by Priority

| Priority | Category | Key Checks |
|----------|----------|------------|
| 1 | **Accessibility** (CRITICAL) | Contrast 4.5:1, alt text, keyboard nav, aria-labels |
| 2 | **Touch & Interaction** (CRITICAL) | Min 44×44px, cursor-pointer, loading feedback, hover states |
| 3 | **Performance** (HIGH) | Lazy loading, skeleton screens, no layout shift |
| 4 | **Style Selection** (HIGH) | Match product type, SVG icons (no emojis), style consistency |
| 5 | **Layout & Responsive** (HIGH) | Mobile-first, 375/768/1024/1440px breakpoints, no horizontal scroll |
| 6 | **Typography & Color** (MEDIUM) | 16px base, 1.5 line-height, semantic color tokens |
| 7 | **Animation** (MEDIUM) | 150–300ms timing, transform/opacity only, reduced-motion |
| 8 | **Forms & Feedback** (MEDIUM) | Visible labels, error near field, empty states |
| 9 | **Navigation** (HIGH) | Predictable back, active state highlighted |
| 10 | **Charts & Data** (LOW) | Legend, tooltip, axis labels, empty state |

---

## Quick Reference

### 1. Accessibility (CRITICAL)
- `color-contrast` — Minimum 4.5:1 for body text; 3:1 for large text
- `focus-states` — Visible focus rings (2–4px) on all interactive elements
- `aria-labels` — `aria-label` for icon-only buttons
- `keyboard-nav` — Tab order matches visual order
- `color-not-only` — Don't convey information by color alone (add icon/text)
- `heading-hierarchy` — Sequential h1→h6, no level skips
- `reduced-motion` — Respect `prefers-reduced-motion`

### 2. Touch & Interaction (CRITICAL)
- `touch-target-size` — Min 44×44px; extend hit area if visually smaller
- `cursor-pointer` — Add `cursor-pointer` to all clickable elements
- `hover-states` — Smooth transitions 150–300ms on all interactive elements
- `loading-buttons` — Disable button during async; show spinner
- `press-feedback` — Visual feedback: color/opacity/elevation change on press

### 3. Style & Visual (HIGH)
- `no-emoji-icons` — Use SVG icon libraries (Lucide, Heroicons, Phosphor)
- `icon-style-consistent` — One icon set throughout; consistent stroke width
- `elevation-consistent` — Systematic shadow scale for cards/sheets/modals
- `color-semantic` — Use design tokens, not raw hex in components
- `state-clarity` — hover/pressed/disabled must be visually distinct

### 4. Layout & Responsive (HIGH)
- `mobile-first` — Design for 375px first, then scale up
- `breakpoint-consistency` — Systematic: 375/768/1024/1440
- `readable-font-size` — Minimum 16px body text on mobile
- `spacing-scale` — 4/8px incremental spacing system
- `container-width` — `max-w-6xl` or `max-w-7xl` on desktop

### 5. Typography & Color (MEDIUM)
- `line-height` — 1.5–1.75 for body text
- `weight-hierarchy` — Bold headings (600–700), Regular body (400), Medium labels (500)
- `color-accessible-pairs` — All foreground/background pairs ≥4.5:1 (WCAG AA)
- `number-tabular` — Use tabular figures for data columns and numbers

### 6. Animation (MEDIUM)
- `duration-timing` — 150–300ms for micro-interactions; ≤400ms complex transitions
- `transform-performance` — Animate `transform`/`opacity` only; never `width`/`height`
- `easing` — `ease-out` for entering; `ease-in` for exiting
- `exit-faster-than-enter` — Exit ~60–70% of enter duration

### 7. Charts & Data (LOW)
- `chart-type` — Match to data: trend → line/area, comparison → bar, proportion → donut
- `axis-labels` — Label axes with units; don't rotate on mobile
- `tooltip-on-interact` — Tooltips on hover/tap with exact values
- `empty-data-state` — Meaningful empty state, not a blank chart
- `gridline-subtle` — Low-contrast gridlines (e.g. gray-200) so they don't compete with data
- `legend-visible` — Always show legend near the chart

---

## Pre-Delivery Checklist

### Visual Quality
- [ ] No emojis used as icons (SVG only)
- [ ] All icons from one consistent family and style
- [ ] Semantic color tokens used (no ad-hoc hardcoded hex)
- [ ] Consistent shadow/elevation scale

### Interaction
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150–300ms)
- [ ] Touch targets ≥44×44px
- [ ] Focus states visible for keyboard navigation
- [ ] Micro-interaction timing in 150–300ms range

### Accessibility
- [ ] Text contrast ≥4.5:1 (light mode)
- [ ] Text contrast ≥4.5:1 (dark mode, test separately)
- [ ] Color is not the only indicator of meaning
- [ ] Keyboard navigation works; tab order is logical
- [ ] `prefers-reduced-motion` is respected

### Responsive
- [ ] Verified at 375px, 768px, 1024px, 1440px
- [ ] No horizontal scroll on mobile
- [ ] Font size ≥16px on mobile (avoids iOS auto-zoom)

### Charts
- [ ] Axis labels with units
- [ ] Tooltip on hover/tap
- [ ] Empty state when no data
- [ ] Accessible color pairs for multi-series

---

## Supported Stacks

| Stack | Notes |
|-------|-------|
| Next.js / React | `shadcn/ui`, `Tailwind CSS`, `Lucide React` icons |
| Vue / Nuxt | `Nuxt UI`, `Tailwind CSS`, `@heroicons/vue` |
| HTML + Tailwind | Default fallback |
| Astro | SSG/SSR with island architecture |

---

## Anti-Patterns (Always Avoid)

- AI purple/pink gradients on professional apps
- Emojis as structural icons (navigation, settings, status)
- Bright neon in wellness/healthcare/finance contexts
- Hover-only interactions (mobile has no hover)
- Animations that block user input
- Placeholder-only form labels
- Color as the sole indicator of state or error
- Overly transparent surfaces that blur hierarchy
