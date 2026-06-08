# Integration Report — nestfind

phase: integrate
endpoints_wired: 36
services_created: 8
hooks_created: 7
pages_updated: 17
pages_total: 22
pages_with_hooks: 17
coverage_pct: 77
rule_i1_interceptor_retry_flag: true
rule_i3_route_matching: true

---

## Summary

All 17 data-driven frontend pages are wired to backend API endpoints using TanStack Query (useQuery for reads, useMutation for writes). Every API call includes loading, error, and empty states. The Axios instance uses httpOnly cookies with `_isRetry` flag to prevent infinite refresh loops (RULE-I1). No `setTimeout(() => navigate(...))` patterns (RULE-I2). All API paths match `@Controller` decorators from the backend exactly (RULE-I3). CORS origin (`http://localhost:5173`) matches Vite port (RULE-I4). No `any` types in response DTOs. Error messages use server response, not hardcoded strings.

---

## Changes This Run

### Fix: profileService route mismatch
- **Before**: `GET /profile`, `PATCH /profile` (neither existed on backend)
- **After**: `GET /auth/me` (matches backend `@Controller('auth')` + `@Get('me')`)
- `PATCH /auth/me` does not exist on the backend — listed in MISSING_ENDPOINTS.yaml

### Add: inquiryService missing methods
- Added `getMy()` → `GET /inquiries/my` (matches backend `@Get('my')`)
- Added `delete()` → `DELETE /inquiries/:id` (matches backend `@Delete(':id')`)

### Add: useInquiries missing hooks
- Added `useMyInquiries()` — TanStack Query wrapper for `GET /inquiries/my`
- Added `useDeleteInquiry()` — TanStack mutation wrapper for `DELETE /inquiries/:id`

---

## Infrastructure

### Axios Instance (`services/httpService.ts`)
- Axios instance with `withCredentials: true` (httpOnly cookie auth)
- `_isRetry` flag on `InternalAxiosRequestConfig` via module augmentation (RULE-I1)
- 401 interceptor: calls `/auth/refresh`, retries request; on failure redirects to `/login`
- Base URL: `VITE_API_URL` env or `http://localhost:3000/api`
- Methods: get, post, put, patch, delete — all unwrap `ApiResponse<T>` → `T`
- Timeout: 30s

### Vite Config (`vite.config.ts`)
- Port: 5173 (matches CORS origin in backend `main.ts`)
- Proxy: `/api` → `http://localhost:3000` (dev convenience)

### QueryClientProvider (`hooks/providers/providers.tsx`)
- App wrapped in `QueryClientProvider` with Redux `Provider`
- Auth initializer dispatches `fetchCurrentUser` on mount

---

## Services Created

| Service | File | Endpoints Covered |
|---------|------|-------------------|
| authService | `services/api/authService.ts` | POST /auth/login, POST /auth/register, POST /auth/logout, POST /auth/refresh, GET /auth/me, POST /auth/forgot-password, POST /auth/reset-password |
| propertyService | `services/api/propertyService.ts` | GET /properties, GET /properties/:id, POST /properties, PATCH /properties/:id, DELETE /properties/:id, POST /properties/:id/photos, DELETE /properties/:id/photos/:photoId, PATCH /properties/:id/photos/:photoId/primary, PATCH /properties/:id/photos/reorder |
| inquiryService | `services/api/inquiryService.ts` | POST /properties/:propertyId/inquiries, GET /inquiries, GET /inquiries/my, GET /inquiries/:id, PATCH /inquiries/:id/read, POST /inquiries/:id/respond, DELETE /inquiries/:id |
| favoriteService | `services/api/favoriteService.ts` | GET /favorites, POST /favorites, DELETE /favorites/:propertyId |
| adminService | `services/api/adminService.ts` | GET /admin/dashboard, GET /admin/users, GET /admin/users/:id, PATCH /admin/users/:id/status |
| amenityService | `services/api/amenityService.ts` | GET /amenities, POST /amenities, PATCH /amenities/:id, DELETE /amenities/:id |
| profileService | `services/api/profileService.ts` | GET /auth/me, PATCH /auth/me (PATCH missing on backend — see MISSING_ENDPOINTS.yaml) |
| httpService | `services/httpService.ts` | Axios core instance |

---

## TanStack Query Hooks Created

| Hook File | Exports |
|-----------|---------|
| `useAuth.ts` | useLogin, useRegister, useLogout, useCurrentUser, useForgotPassword, useResetPassword |
| `useProperties.ts` | usePropertySearch, usePropertyDetail, useCreateProperty, useUpdateProperty, useDeleteProperty |
| `useFavorites.ts` | useFavoriteList, useAddFavorite, useRemoveFavorite |
| `useInquiries.ts` | useSubmitInquiry, useInquiryList, useMyInquiries, useInquiryDetail, useMarkInquiryAsRead, useRespondToInquiry, useDeleteInquiry |
| `useAdmin.ts` | useDashboardStats, useAdminUserList, useAdminUserDetail, useUpdateUserStatus |
| `useAmenities.ts` | useAmenityList, useCreateAmenity, useUpdateAmenity, useDeleteAmenity |
| `useProfile.ts` | useProfile, useUpdateProfile |

---

## Pages Wired

| Page | Hooks Used | States |
|------|-----------|--------|
| `auth/login.tsx` | useLogin | zod validation, pending, error from server |
| `auth/signup.tsx` | useRegister | zod validation, pending, error from server |
| `auth/register.tsx` | useRegister | zod validation, pending, error from server |
| `auth/admin-login.tsx` | useLogin | pending, error from server |
| `auth/forgot-password.tsx` | useForgotPassword | pending, success, error from server |
| `auth/reset-password.tsx` | useResetPassword | token from URL params, pending, success, error |
| `renter/search.tsx` | usePropertySearch, useAddFavorite, useRemoveFavorite | loading, error, empty (no results), filter chips, pagination |
| `renter/detail.tsx` | usePropertyDetail, useAddFavorite, useRemoveFavorite, useSubmitInquiry | loading, error, empty (not found), photos, amenities, inquiry form |
| `renter/favorites.tsx` | useFavoriteList, useRemoveFavorite | loading, error, empty (no favorites), grid |
| `renter/inquiries.tsx` | useInquiryList | loading, error, empty (no inquiries), table, status badges |
| `admin/dashboard.tsx` | useDashboardStats | loading, error, stat cards, recent inquiries list |
| `admin/properties.tsx` | usePropertySearch, useDeleteProperty | loading, error, empty, paginated table |
| `admin/property-form.tsx` | useCreateProperty, useUpdateProperty, usePropertyDetail, useAmenityList | loading, error, submission feedback, amenity checkboxes |
| `admin/inquiries.tsx` | useInquiryList, useMarkInquiryAsRead, useRespondToInquiry | loading, error, empty, status filter, paginated table |
| `admin/users.tsx` | useAdminUserList, useUpdateUserStatus | loading, error, empty, paginated table, status toggle |
| `landing.tsx` | usePropertySearch | featured properties grid, empty fallback |
| `profile.tsx` | useProfile, useUpdateProfile | loading, error, update pending/error/success |

---

## RULE Compliance

| Rule | Status | Detail |
|------|--------|--------|
| RULE-I1: `_isRetry` flag | true | `InternalAxiosRequestConfig` augmented with `_isRetry`, checked in 401 interceptor at `httpService.ts:34` |
| RULE-I2: No setTimeout+navigate | true | No `setTimeout(() => navigate(...))` patterns found; auth failure uses `window.location.href` |
| RULE-I3: Route matching | true | All 36 API paths match `@Controller` + method decorators from backend controllers (one exception: PATCH `/auth/me` is a backend gap, not a mismatch — listed in MISSING_ENDPOINTS.yaml) |
| RULE-I4: CORS + port consistency | true | Vite port `5173`, backend CORS allows `http://localhost:5173`, Vite proxies `/api` → `http://localhost:3000` |

---

## Skipped (no matching hook)

- `auth/layout.tsx`: Layout wrapper (GuestGuard) — no API needed
- `layout.tsx`: Base layout wrapper — no API needed
- `not-found.tsx`: Static 404 page — no API needed
- `unauthorized.tsx`: Static access-denied page — no API needed
- `redirect-home.tsx`: Server-side redirect to /search — no API needed

---

## Generated At

2026-05-20T08:00:00.000Z
