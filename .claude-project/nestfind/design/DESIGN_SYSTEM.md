# DESIGN_SYSTEM A — Dark Vibrant (Linear-inspired)

**Archetype:** Dark Vibrant / Glass Morphism
**Reference Company:** Linear
**Generated:** 2026-05-19

---

## Design Philosophy

**Core Inspiration:** Linear's dark, focused interface — minimal chrome, content-first, with vibrant accent colors that guide attention without overwhelming.

**The Four Pillars:**
- Search & Discovery = Zillow (card patterns, filter hierarchy) + Linear (keyboard-first, fast)
- Property Browsing = Airbnb (photo-first cards, immersive imagery) + Linear (dark mode, reduced glare)
- Dashboard & Admin = Linear (clean, one action per page, neon accent on active states)
- Trust & Credibility = Stripe (generous whitespace, confident typography, no decoration)

---

## Color System

### Background Layer
| Token | Value | Usage |
|-------|-------|-------|
| bg-root | `#0B0F1A` | Page background, body |
| bg-surface | `rgba(255,255,255,0.04)` | Card backgrounds (glass, backdrop-blur) |
| bg-surface-hover | `rgba(255,255,255,0.06)` | Card hover state |
| bg-elevated | `rgba(255,255,255,0.08)` | Modals, dropdowns, elevated surfaces |
| bg-sidebar | `#080B14` | Sidebar background |

### Primary / Accent
| Token | Value | Usage |
|-------|-------|-------|
| primary | `#4A90D9` | Base primary (blue) |
| primary-glow | `#4A90D9 → #7C3AED` | Gradient used on CTAs, hero elements |
| primary-hover | `#5BA0E9` | Button hover, link hover |
| primary-muted | `rgba(74,144,217,0.15)` | Selected state backgrounds |

### Semantic Colors
| Token | Value | Usage |
|-------|-------|-------|
| success | `#4ADE80` | Active status, success badges |
| success-glow | `0 0 12px rgba(74,222,128,0.4)` | Glow on success badges |
| warning | `#FBBF24` | Pending, warning states |
| warning-glow | `0 0 12px rgba(251,191,36,0.4)` | Glow on warning badges |
| error | `#F87171` | Error, suspended states |
| error-glow | `0 0 12px rgba(248,113,113,0.4)` | Glow on error badges |

### Text
| Token | Value | Usage |
|-------|-------|-------|
| text-primary | `#F1F5F9` | Headings, body text |
| text-secondary | `#94A3B8` | Labels, secondary info |
| text-muted | `#64748B` | Captions, metadata |
| text-inverse | `#0B0F1A` | Text on light/white elements |

### Borders
| Token | Value | Usage |
|-------|-------|-------|
| border-default | `rgba(255,255,255,0.08)` | Card borders, dividers |
| border-focus | `rgba(74,144,217,0.5)` | Focus rings, active states |
| border-glow | `rgba(74,144,217,0.2)` | Glow border on elevated cards |

---

## Typography

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| H1 | 48px | 700 | 1.1 | Hero headings only |
| H2 | 36px | 700 | 1.2 | Page titles |
| H3 | 24px | 600 | 1.3 | Section headings |
| H4 | 20px | 600 | 1.4 | Card titles |
| Body | 16px | 400 | 1.6 | Main content |
| Small | 14px | 500 | 1.5 | Labels, metadata |
| Caption | 12px | 400 | 1.4 | Fine print, timestamps |

**Font Family:** Inter, system-ui, sans-serif
**Letter Spacing:** -0.02em (headings), 0 (body)

---

## Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| base | 4px | Grid foundation |
| xs | 4px | Tight inline gaps |
| sm | 8px | Icon-to-label gaps |
| md | 16px | Between elements |
| lg | 24px | Card padding |
| xl | 32px | Section spacing |
| 2xl | 48px | Major section gaps |
| 3xl | 64px | Hero padding |

---

## Component Specifications

### Cards
- Background: `rgba(255,255,255,0.04)` + `backdrop-filter: blur(12px)`
- Border: 1px `rgba(255,255,255,0.08)`
- Border radius: 12px
- Shadow (hover): `0 0 20px rgba(74,144,217,0.15)`
- Padding: 24px

### Buttons
- **Primary:** Gradient `#4A90D9 → #7C3AED`, height 48px, radius 12px, glow on hover
- **Secondary:** `rgba(255,255,255,0.06)` bg, 1px border, height 48px, radius 12px
- **Ghost:** Transparent, text-primary, height 40px, radius 8px

### Inputs
- Height: 48px, radius: 10px
- Background: `rgba(255,255,255,0.04)`
- Border: 1px `rgba(255,255,255,0.08)`
- Focus: border `rgba(74,144,217,0.5)` + glow ring

### Status Badges
- Expression: **Neon glow** — colored text + matching box-shadow glow
- `Active/New`: `#4ADE80` + glow
- `Pending/Warning`: `#FBBF24` + glow
- `Suspended/Error`: `#F87171` + glow
- Radius: 9999px (pill), padding: 2px 10px, font-size: 12px

### Sidebar
- Background: `#080B14`
- Width: 240px
- Active item: gradient left border (3px) + `rgba(74,144,217,0.1)` background
- Icons: 20px, text-secondary when inactive, text-primary when active

### Shadows
- Card default: `0 1px 3px rgba(0,0,0,0.3)`
- Card hover: `0 0 20px rgba(74,144,217,0.15)`
- Modal: `0 0 40px rgba(0,0,0,0.5)`
- Button CTA: `0 0 24px rgba(74,144,217,0.3)` on hover

### Corner Radius Map
- Buttons: 12px
- Cards: 12px
- Inputs: 10px
- Modals: 16px
- Badges: 9999px (pill)
- Avatars: 9999px (circle)

---

## Interaction States

| State | Visual |
|-------|--------|
| Hover (card) | bg-surface → bg-surface-hover + glow shadow |
| Focus (input) | border-focus + 0 0 0 3px rgba(74,144,217,0.15) ring |
| Active (button) | Scale 0.98 |
| Disabled | Opacity 0.4, cursor not-allowed |
| Loading | Skeleton shimmer: rgba(255,255,255,0.03) → rgba(255,255,255,0.06) |

---

## Key Design Rules
1. Dark background reduces eye strain — use vibrant accents sparingly
2. Glass morphism cards create depth without heavy borders
3. Gradient CTAs provide clear visual hierarchy for primary actions
4. Neon glow badges make status immediately scannable
5. Generous whitespace between sections (32-64px)
6. One primary action per view (gradient button)
7. Keyboard-first interactions where possible
