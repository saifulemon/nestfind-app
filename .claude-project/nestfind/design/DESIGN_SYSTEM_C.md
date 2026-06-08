# DESIGN_SYSTEM C — Editorial Minimal (Apple-inspired)

**Archetype:** Editorial Minimal / Typography-First
**Reference Company:** Apple
**Generated:** 2026-05-19

---

## Design Philosophy

**Core Inspiration:** Apple's restrained, typography-driven design — content speaks, chrome recedes. Every element earns its place. Color is used only where it communicates meaning.

**The Four Pillars:**
- Search & Discovery = Apple Maps (clean cards, minimal chrome, focus on content)
- Property Browsing = Apple News (typography-first cards, generous whitespace, photo quality)
- Dashboard & Admin = Stripe Dashboard (pure functional, no decoration, data-first)
- Trust & Credibility = Apple (no social proof clutter — let the product speak)

---

## Color System

### Background Layer
| Token | Value | Usage |
|-------|-------|-------|
| bg-root | `#FFFFFF` | Page background (pure white) |
| bg-surface | `#FFFFFF` | Card backgrounds |
| bg-surface-hover | `#F9FAFB` | Card hover state |
| bg-elevated | `#FFFFFF` | Modals, dropdowns |
| bg-sidebar | `#F8FAFC` | Sidebar (light gray) |

### Primary / Accent
| Token | Value | Usage |
|-------|-------|-------|
| primary | `#4A90D9` | Used ONLY for CTA buttons and active states |
| primary-hover | `#3A7BC9` | Button hover |
| primary-muted | `#EFF6FF` | Very sparing selected backgrounds |

### Semantic Colors
| Token | Value | Usage |
|-------|-------|-------|
| success-dot | `#22C55E` | 6px dot — active/new status (no text) |
| warning-dot | `#F59E0B` | 6px dot — pending status (no text) |
| error-dot | `#EF4444` | 6px dot — suspended/error status (no text) |

### Text
| Token | Value | Usage |
|-------|-------|-------|
| text-primary | `#111827` | Headings, body text |
| text-secondary | `#6B7280` | Labels, secondary info |
| text-muted | `#9CA3AF` | Captions, metadata |
| text-inverse | `#FFFFFF` | Text on dark/primary elements |

### Borders
| Token | Value | Usage |
|-------|-------|-------|
| border-default | `#F3F4F6` | Hairline card borders (0.5px) |
| border-focus | `#4A90D9` | Focus rings |
| border-divider | `#E5E7EB` | Section dividers (1px) |

---

## Typography

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| H1 | 64px | 300 | 1.1 | Hero headlines (editorial scale) |
| H2 | 40px | 300 | 1.15 | Page titles |
| H3 | 28px | 400 | 1.25 | Section headings |
| H4 | 20px | 500 | 1.35 | Card titles |
| Body | 17px | 400 | 1.65 | Main content (slightly larger for readability) |
| Small | 14px | 400 | 1.5 | Labels, metadata |
| Caption | 12px | 500 | 1.4 | Fine print, uppercase labels |

**Font Family:** Inter, -apple-system, system-ui, sans-serif
**Letter Spacing:** -0.03em (H1), -0.02em (H2), -0.01em (H3), 0 (body)
**Special:** Uppercase caption labels with 0.05em letter spacing

---

## Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| base | 8px | Grid foundation |
| xs | 8px | Tight inline gaps |
| sm | 16px | Icon-to-label gaps |
| md | 24px | Between elements |
| lg | 32px | Card padding |
| xl | 48px | Section spacing |
| 2xl | 72px | Major section gaps |
| 3xl | 96px | Hero padding |

---

## Component Specifications

### Cards
- Background: `#FFFFFF`
- Border: 0.5px `#F3F4F6` (hairline)
- Border radius: 4px (near-rectangular)
- Shadow: **None** — no shadows anywhere
- Padding: 32px (generous)
- Hover: 0.5px border darkens to `#E5E7EB`

### Buttons
- **Primary:** Solid `#4A90D9` bg, white text, height 44px, radius 6px, no shadow
- **Secondary:** `#F9FAFB` bg, 0.5px `#E5E7EB` border, height 44px, radius 6px
- **Ghost:** Transparent, `#4A90D9` text, height 40px, radius 6px
- **Large:** 56px height for hero CTAs
- Hover: bg darkens 5%, no lift, no shadow change

### Inputs
- Height: 44px, radius: 4px
- Background: `#FFFFFF`
- Border: 0.5px `#D1D5DB`
- Focus: border `#4A90D9` + 0 0 0 2px `rgba(74,144,217,0.15)` ring

### Status Indicators
- Expression: **6px dot only** — no text label, no background
- `Active/New`: `#22C55E` dot
- `Pending/Warning`: `#F59E0B` dot
- `Suspended/Error`: `#EF4444` dot
- Position: inline before label or in table cell
- Tooltip on hover reveals text status

### Sidebar
- Background: `#F8FAFC` (light gray, barely distinguishable from white)
- Width: 220px
- Active item: 2px left border `#4A90D9` + `#EFF6FF` background
- Icons: 18px, text-secondary
- No dividers between items — whitespace separates

### Dividers & Separation
- No shadows — separation achieved via whitespace and occasional hairline borders
- Section dividers: 1px `#E5E7EB`, full width
- Card separation: 0.5px `#F3F4F6` border

### Corner Radius Map
- Buttons: 6px
- Cards: 4px
- Inputs: 4px
- Modals: 8px
- Badges: 4px (rectangular pills)
- Avatars: 4px (rounded square)

---

## Interaction States

| State | Visual |
|-------|--------|
| Hover (card) | Border darkens 0.5px, bg→#F9FAFB |
| Focus (input) | border-focus + subtle blue ring (2px) |
| Active (button) | Scale 0.99 (barely perceptible) |
| Disabled | Opacity 0.35, cursor not-allowed |
| Loading | Subtle opacity pulse, skeleton in #F3F4F6 |

---

## Key Design Rules
1. Pure white background — content does all the work, chrome disappears
2. Color used only for CTAs and active states — 95% grayscale
3. No shadows — flat, pure, confident design
4. Hairline borders (0.5px) for subtle separation without heaviness
5. Light typography (300 weight) for editorial scale headings
6. Status as minimal dots — no text, no backgrounds, no badges
7. Generous whitespace is the primary layout tool
8. One primary color accent per view — everything else is grayscale
9. Animations are subtle — 200ms ease, no bounces or springs
