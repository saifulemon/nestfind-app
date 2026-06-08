# VARIATIONS_INDEX — NestFind Design Variations

phase: design-variations
variations_generated: 3
html_files: 9
archetypes: ["Dark Vibrant (Linear)", "Warm Friendly (Notion)", "Editorial Minimal (Apple)"]
differentiation_score: 7/7
generated_at: 2026-05-19

---

## Overview

Three design system archetypes were generated for NestFind, each representing a distinct visual identity while supporting the same functional requirements. Each variant was applied to three representative pages: Landing, Admin Dashboard, and Property Detail.

---

## Archetype Summary

| # | Variant | Reference | Background | Primary Color Usage | Vibe |
|---|---------|-----------|------------|---------------------|------|
| A | Dark Vibrant | Linear | `#0B0F1A` deep navy | Gradient glow (blue→purple) | Bold, focused, tech-forward |
| B | Warm Friendly | Notion + Airbnb | `#FFFBF5` warm cream | Solid + 5 accent colors | Welcoming, playful, approachable |
| C | Editorial Minimal | Apple | `#FFFFFF` pure white | CTA/active only, 95% grayscale | Refined, content-first, austere |

---

## Differentiation Checklist (7/7)

| # | Item | Variant A | Variant B | Variant C | Different? |
|---|------|-----------|-----------|-----------|------------|
| 1 | Background color | `#0B0F1A` dark | `#FFFBF5` cream | `#FFFFFF` white | Yes |
| 2 | Shadow style | Neon glow (0 0 20px blue) | Soft warm (0 2px 8px) | None (flat) | Yes |
| 3 | Border treatment | Transparent rgba(255,255,255,0.08) | Warm tone `#F0E7DB` | Hairline 0.5px `#F3F4F6` | Yes |
| 4 | Corner radius | 10-16px (rounded-xl) | 16-9999px (full pills) | 4-6px (near-rectangular) | Yes |
| 5 | Typography weight | 700 bold headings | 600 semibold friendly | 300 light editorial | Yes |
| 6 | Status expression | Neon glow text+bg | Pastel pill badges | 6px colored dot only | Yes |
| 7 | Sidebar theme | `#080B14` + gradient accent | `#1A1625` warm purple + colored icons | `#F8FAFC` light + 2px left border | Yes |

---

## File Manifest

### Design System Docs

| File | Path |
|------|------|
| DESIGN_SYSTEM_A.md | `.claude-project/nestfind/design/DESIGN_SYSTEM_A.md` |
| DESIGN_SYSTEM_B.md | `.claude-project/nestfind/design/DESIGN_SYSTEM_B.md` |
| DESIGN_SYSTEM_C.md | `.claude-project/nestfind/design/DESIGN_SYSTEM_C.md` |

### HTML Previews (9 files)

| # | File | Page | Variant |
|---|------|------|---------|
| 1 | `A-01-landing.html` | Landing | A — Dark Vibrant |
| 2 | `B-01-landing.html` | Landing | B — Warm Friendly |
| 3 | `C-01-landing.html` | Landing | C — Editorial Minimal |
| 4 | `A-02-dashboard.html` | Admin Dashboard | A — Dark Vibrant |
| 5 | `B-02-dashboard.html` | Admin Dashboard | B — Warm Friendly |
| 6 | `C-02-dashboard.html` | Admin Dashboard | C — Editorial Minimal |
| 7 | `A-03-detail.html` | Property Detail | A — Dark Vibrant |
| 8 | `B-03-detail.html` | Property Detail | B — Warm Friendly |
| 9 | `C-03-detail.html` | Property Detail | C — Editorial Minimal |

All HTML files in: `.claude-project/nestfind/design/variations/`

### Showcase

| File | Path |
|------|------|
| showcase-ALL.html | `.claude-project/nestfind/design/variations/showcase-ALL.html` |

---

## Structural Marker Verification

| Check | Status |
|-------|--------|
| All 9 HTML files have `max-width: 1440px` on root wrapper | Verified |
| All 9 HTML files have `class="var-nav-bar"` navigation | Verified |
| `showcase-ALL.html` exists and embeds all 9 variants via iframe | Verified |
| `VARIATIONS_INDEX.md` exists with `variations_generated: 3` | Verified |

---

## Next Steps

Proceed to Phase 3d (variation selection / user review) and Phase 3e (full HTML generation from selected variant).
