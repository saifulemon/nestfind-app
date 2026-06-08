# DESIGN_SYSTEM B — Warm Friendly (Notion-inspired)

**Archetype:** Warm Playful / Soft Organic
**Reference Company:** Notion + Airbnb
**Generated:** 2026-05-19

---

## Design Philosophy

**Core Inspiration:** Notion's warm, approachable interface — friendly without being childish, playful without sacrificing utility. Airbnb's photo-first, emotionally resonant browsing.

**The Four Pillars:**
- Search & Discovery = Airbnb (horizontal chip categories, card carousels, photo-first)
- Property Browsing = Airbnb (warm imagery, soft shadows, emotional connection)
- Dashboard & Admin = Notion (sidebar-first, clean tables, minimal chrome)
- Trust & Credibility = Rentable (social proof, testimonial blocks, verified badges)

---

## Color System

### Background Layer
| Token | Value | Usage |
|-------|-------|-------|
| bg-root | `#FFFBF5` | Page background (warm cream) |
| bg-surface | `#FFFFFF` | Card backgrounds |
| bg-surface-hover | `#FFF7ED` | Card hover state (warm tint) |
| bg-elevated | `#FFFFFF` | Modals, dropdowns |
| bg-sidebar | `#1A1625` | Sidebar (warm dark purple) |

### Primary / Accent
| Token | Value | Usage |
|-------|-------|-------|
| primary | `#4A90D9` | Primary blue — solid, no gradient |
| accent-coral | `#F97068` | Secondary accent (favorites, hearts) |
| accent-teal | `#2DD4BF` | Tertiary accent (success, active) |
| accent-amber | `#F59E0B` | Quaternary accent (warnings, ratings) |
| accent-lavender | `#8B5CF6` | Quinary accent (special, featured) |
| primary-muted | `#EFF6FF` | Selected/hover backgrounds |

### Semantic Colors
| Token | Value | Usage |
|-------|-------|-------|
| success | `#059669` on `#D1FAE5` bg | Active status (pastel pill) |
| warning | `#D97706` on `#FEF3C7` bg | Pending warning (pastel pill) |
| error | `#DC2626` on `#FEE2E2` bg | Suspended/error (pastel pill) |

### Text
| Token | Value | Usage |
|-------|-------|-------|
| text-primary | `#1E293B` | Headings, body text |
| text-secondary | `#64748B` | Labels, secondary info |
| text-muted | `#94A3B8` | Captions, metadata |
| text-inverse | `#F8FAFC` | Text on dark sidebar |

### Borders
| Token | Value | Usage |
|-------|-------|-------|
| border-default | `#F0E7DB` | Card borders (warm tone) |
| border-focus | `#4A90D9` | Focus rings |
| border-emphasis | `#E5E0D5` | Stronger dividers |

---

## Typography

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| H1 | 44px | 600 | 1.15 | Hero headings |
| H2 | 32px | 600 | 1.25 | Page titles |
| H3 | 22px | 600 | 1.3 | Section headings |
| H4 | 18px | 600 | 1.4 | Card titles |
| Body | 16px | 400 | 1.6 | Main content |
| Small | 14px | 500 | 1.5 | Labels, metadata |
| Caption | 12px | 400 | 1.4 | Fine print |

**Font Family:** SF Pro Display, Inter, system-ui, sans-serif
**Letter Spacing:** -0.01em (headings), 0 (body)

---

## Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| base | 4px | Grid foundation |
| xs | 8px | Tight inline gaps |
| sm | 12px | Icon-to-label gaps |
| md | 20px | Between elements |
| lg | 28px | Card padding |
| xl | 36px | Section spacing |
| 2xl | 52px | Major section gaps |
| 3xl | 72px | Hero padding |

---

## Component Specifications

### Cards
- Background: `#FFFFFF`
- Border: 1px `#F0E7DB`
- Border radius: 20px
- Shadow (default): `0 2px 8px rgba(0,0,0,0.04)`
- Shadow (hover): `0 4px 16px rgba(0,0,0,0.08)`, translateY(-2px)
- Padding: 28px

### Buttons
- **Primary:** Solid `#4A90D9` bg, white text, height 48px, radius 9999px (full pill), lift on hover (translateY -1px)
- **Secondary:** `#F8FAFC` bg, 1px `#F0E7DB` border, height 48px, radius 9999px
- **Ghost:** Transparent, text-primary, height 40px, radius 9999px
- **Accent:** Solid accent colors (coral, teal, etc.)

### Inputs
- Height: 48px, radius: 16px
- Background: `#FFFFFF`
- Border: 1px `#F0E7DB`
- Focus: border `#4A90D9` + 0 0 0 3px `rgba(74,144,217,0.1)` ring

### Status Badges
- Expression: **Pastel pill** — soft colored background + darker text
- `Active/New`: `#D1FAE5` bg + `#059669` text
- `Pending/Warning`: `#FEF3C7` bg + `#D97706` text
- `Suspended/Error`: `#FEE2E2` bg + `#DC2626` text
- Radius: 9999px (pill), padding: 4px 12px, font-size: 12px, font-weight 600

### Sidebar
- Background: `#1A1625` (warm dark purple)
- Width: 240px
- Active item: colored dot indicator (matching nav item accent color) + white text
- Icons: 20px, colored by section (blue for general, coral for favorites, teal for active)
- Section dividers with label headers

### Shadows
- Card default: `0 2px 8px rgba(0,0,0,0.04)`
- Card hover: `0 4px 16px rgba(0,0,0,0.08)`
- Modal: `0 8px 32px rgba(0,0,0,0.12)`
- Button lift: `0 2px 4px rgba(0,0,0,0.06)` on hover

### Corner Radius Map
- Buttons: 9999px (full pill)
- Cards: 20px
- Inputs: 16px
- Modals: 24px
- Badges: 9999px (pill)
- Avatars: 9999px (circle)
- Chip filters: 9999px (pill)

---

## Interaction States

| State | Visual |
|-------|--------|
| Hover (card) | Shadow deepens + translateY(-2px) + bg slight warm tint |
| Focus (input) | border-focus + pastel blue ring |
| Active (button) | Scale 0.97 |
| Disabled | Opacity 0.5, cursor not-allowed |
| Loading | Soft pulse animation, skeleton with warm gray (#F0E7DB) |

---

## Key Design Rules
1. Warm cream background creates welcoming, non-clinical feel
2. Five accent colors provide visual variety without chaos
3. Pill-shaped everything (buttons, badges, chips) = friendly, approachable
4. Soft shadows create subtle depth without harshness
5. Card lift on hover provides satisfying tactile feedback
6. Colored sidebar navigation makes sections instantly distinguishable
7. Pastel status badges are scannable without feeling like alerts
