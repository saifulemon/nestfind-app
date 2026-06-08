# Frontend Routes Wired Report

phase: frontend-wire-routes
routes_wired: 5
roles_covered: 3
unmatched_pages: 0

## Route Wiring Summary

| Page | Suggested Route | Component Path | Route File | Status |
|------|----------------|----------------|------------|--------|
| A-01-landing | `/` | `pages/landing.tsx` | `routes.ts` (index) | Wired |
| A-02-login | `/login` | `pages/auth/login.tsx` | `routes/auth.routes.ts` | Already wired |
| A-03-signup | `/signup` | `pages/auth/signup.tsx` | `routes/auth.routes.ts` | Fixed (was pointing to register.tsx) |
| A-04-forgot-password | `/forgot-password` | `pages/auth/forgot-password.tsx` | `routes/auth.routes.ts` | Already wired |
| A-05-reset-password | `/reset-password` | `pages/auth/reset-password.tsx` | `routes/auth.routes.ts` | Already wired |

## Role Grouping

| Role | Routes | Guard |
|------|--------|-------|
| **Guest** (unauthenticated) | `/login`, `/signup`, `/register`, `/forgot-password`, `/reset-password`, `/admin/login` | `GuestGuard` via `pages/auth/layout.tsx` |
| **Public** (all users) | `/` (landing) | None (top-level index) |
| **Renter** (authenticated) | `/search`, `/property/:id`, `/favorites`, `/inquiries`, `/profile` | Protected via `RenterLayout` |
| **Admin** (authenticated) | `/admin`, `/admin/properties`, `/admin/properties/new`, `/admin/properties/:id/edit`, `/admin/inquiries`, `/admin/users` | Protected via `AdminLayout` |

## Changes Made

### `frontend/app/routes.ts`
- Replaced `index('pages/redirect-home.tsx')` with `index('pages/landing.tsx')` — landing page is now the root route
- Preserved `route('*', 'pages/not-found.tsx')` 404 catch-all unchanged

### `frontend/app/routes/auth.routes.ts`
- Updated signup route from `pages/auth/register.tsx` to `pages/auth/signup.tsx` per the convert report
- `register` route still points to `pages/auth/register.tsx` (preserved as alternate path)
- All other auth routes were already correctly wired

## File Structure

```
frontend/app/routes.ts              # Top-level route config (index → landing)
frontend/app/routes/public.routes.ts # Public routes (empty — landing is standalone index)
frontend/app/routes/auth.routes.ts   # Auth routes (login, signup, register, forgot-pw, reset-pw)
frontend/app/routes/renter.routes.ts # Renter protected routes
frontend/app/routes/admin.routes.ts  # Admin protected routes (unused, routes are inline in routes.ts)
```
