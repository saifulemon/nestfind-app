# Frontend Conversion Report

## A-01-landing

page: A-01-landing
component_name: LandingPage
component_path: frontend/app/pages/landing.tsx
suggested_route: /
text_elements_matched: 85
form_fields_matched: 1
buttons_matched: 3
css_arbitrary_values_used: 55
testids_added: 31
fidelity_estimate: 0.95

## Conversion Summary

Converted `A-01-landing.html` to `LandingPage.tsx` at `frontend/app/pages/landing.tsx`.

### Structure
- **Navbar**: Gradient logo + 5 nav links (Browse, How It Works, For Owners, Sign In, Join Now)
- **Hero**: Headline with gradient highlight, subtitle, search bar with input + button, chip row (5 filter chips)
- **How It Works**: Section label, heading, subtitle, 3 step cards with numbered circles
- **Featured Properties**: Section label, heading, subtitle, 3 property cards with gradient image placeholders + emoji, badge, price, address, metadata
- **Why NestFind**: Section label, heading, subtitle, 4 feature cards with lucide-react icons
- **Footer**: 4-column layout with 16 links

### Fidelity Notes
- All CSS values extracted as Tailwind arbitrary values (e.g., `px-[48px]`, `text-[14px]`, `rounded-[12px]`, `from-[#4A90D9]`)
- Backdrop blur (`backdrop-blur-[12px]`), custom box shadows, and gradient backgrounds preserved
- All text matches HTML character-for-character
- Icons mapped from Iconify `mdi:*` to lucide-react equivalents (EyeOff, Zap, Heart, MapPin)
- Emoji property image placeholders (🏠🏡🏢) with exact gradient backgrounds
- Prototype variant nav bar excluded (not part of production page)
- i18n keys added to both `en/common.json` and `ko/common.json` under `landing.*` namespace

### Interactive Elements
- All buttons/links have `onClick` handlers with `/* TODO */` stubs
- All interactive elements have `data-testid` attributes per RULE-F10
- Chip filter row uses `role="button"` with keyboard support
- Property cards are clickable with `role="button"` and keyboard support
- Search input + button form ready for navigation integration
- "How It Works" nav link scrolls to the section via `document.getElementById`

### Files Modified
- `frontend/app/pages/landing.tsx` — Created
- `frontend/public/locales/en/common.json` — Added `landing` i18n namespace
- `frontend/public/locales/ko/common.json` — Added `landing` i18n namespace (Korean translations)
