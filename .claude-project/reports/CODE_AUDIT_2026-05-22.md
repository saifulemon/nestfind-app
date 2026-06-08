# nestfind — Code Audit Report

**Date:** 2026-05-22
**Method:** Automated scan across 18 categories (backend + frontend)
**Scope:** All

---

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 8 |
| HIGH | 12 |
| MEDIUM | 21 |
| LOW | 2 |
| **Total** | **43** |

---

## Category 1: Secrets & Hardcoded Configuration (A-01–A-04)

### A-01 — CRITICAL — Hardcoded JWT Secret Fallback in JwtStrategy

- **File:** `backend/src/core/guards/jwt.strategy.ts:15`
- **Category:** Secrets
- **Code:** `secretOrKey: process.env.JWT_ACCESS_SECRET || 'nestfind-dev-secret-key-change-in-production'`
- **Impact:** When `JWT_ACCESS_SECRET` env var is missing, the hardcoded fallback allows anyone with source access to forge arbitrary JWT tokens across all user roles
- **Fix:** Remove fallback, throw if env var is not set (parallel to `env-config.service.ts` pattern)

### A-02 — CRITICAL — Hardcoded JWT Secret Fallback in AuthModule

- **File:** `backend/src/modules/auth/auth.module.ts:22`
- **Category:** Secrets
- **Code:** `config.get<string>('JWT_ACCESS_SECRET', 'dev-secret')`
- **Impact:** Trivially guessable fallback `'dev-secret'` — bypasses the strict check in `EnvConfigService.getAuthJWTConfig()` because this module reads from NestJS `ConfigService`, not from `envConfigService`
- **Fix:** Remove fallback default: `config.getOrThrow<string>('JWT_ACCESS_SECRET')`

### A-03 — CRITICAL — Hardcoded JWT Secret Fallback in AmenityModule

- **File:** `backend/src/modules/amenities/amenity.module.ts:20`
- **Category:** Secrets
- **Code:** `secret: config.get<string>('JWT_ACCESS_SECRET', 'nestfind-dev-secret-key-change-in-production')`
- **Impact:** Same critical fallback duplicated in amenity module — third application path using the same weak default
- **Fix:** Remove fallback, reference shared JWT config or use `TokenModule` infrastructure module

### A-04 — HIGH — Inconsistent JWT Secret Environment Variable Naming

- **File:** `backend/src/config/env-config.service.ts:65-70` (uses `AUTH_JWT_SECRET`); `backend/src/core/guards/jwt.strategy.ts:15` (reads `JWT_ACCESS_SECRET`)
- **Category:** Secrets
- **Code:**
  - env-config: `const secret = this.getValue("AUTH_JWT_SECRET", false);`
  - jwt.strategy: `process.env.JWT_ACCESS_SECRET || '...'`
  - auth.module: `config.get<string>('JWT_ACCESS_SECRET', 'dev-secret')`
- **Impact:** If an operator sets `AUTH_JWT_SECRET` in `.env` (as `env-config.service.ts` requires), the JwtStrategy and JwtModule will not find it because they look for `JWT_ACCESS_SECRET`, silently falling back to hardcoded secrets
- **Fix:** Unify under a single env var name (e.g., `AUTH_JWT_SECRET`) across all consumers

---

## Category 2: Missing Auth / Role Guards (A-05)

### A-05 — MEDIUM — Cookie Secure Flag Set to `false`

- **File:** `backend/src/modules/auth/auth.controller.ts:76,85`
- **Category:** Auth/Roles
- **Code:**
  ```ts
  res.cookie('access_token', accessToken, { httpOnly: true, secure: false, sameSite: 'strict', ... });
  res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: false, sameSite: 'strict', ... });
  ```
- **Impact:** `secure: false` means cookies are sent over unencrypted HTTP in production, exposing JWT tokens to network interception
- **Fix:** Set `secure: process.env.NODE_ENV === 'production'` or use `envConfigService.isProduction()`

---

## Category 3: IDOR / Missing Ownership Checks (A-06)

### A-06 — MEDIUM — AdminService.getUserDetail Accesses Any User Without Scope Constraint

- **File:** `backend/src/modules/admin/admin.service.ts:104-118`
- **Category:** IDOR
- **Code:**
  ```ts
  async getUserDetail(id: string) {
      const user = await this.userRepo.findOne({ where: { id } as any, ... });
      // No scope/org filter
  ```
- **Impact:** While this endpoint is gated by admin role, there is no organization-level scope. If the app ever serves multiple landlords/agencies, any admin can read any user's data
- **Fix:** If multi-tenant in the future, add organization/agency scope filter

---

## Category 4: Race Conditions & Concurrency (B-01–B-06)

### B-01 — HIGH — Read-then-write password reset without transaction

- **File:** `backend/src/modules/auth/services/auth.service.ts:69-78`
- **Category:** Race Conditions
- **Code:** `resetToken = await this.resetTokenRepo.findOne(...); if (!resetToken || resetToken.usedAt || ...); await this.userService.update(...); resetToken.usedAt = new Date(); await this.resetTokenRepo.save(resetToken);`
- **Impact:** Two concurrent reset requests with the same token both pass the `usedAt` guard, letting an attacker reset the password twice with one token
- **Fix:** Wrap in transaction with `pessimistic_write` lock on the reset token row; or use atomic `UPDATE ... SET used_at=NOW() WHERE used_at IS NULL AND id=:id`

### B-02 — MEDIUM — Token refresh race condition

- **File:** `backend/src/modules/auth/services/auth.service.ts:44-50`
- **Category:** Race Conditions
- **Code:** `existing = await this.refreshTokenRepo.findOne(...); existing.revokedAt = new Date(); await this.refreshTokenRepo.save(existing);`
- **Impact:** Two concurrent refresh calls with the same token both pass the `revokedAt` check, producing two valid access/refresh token pairs
- **Fix:** Atomic update: `UPDATE refresh_tokens SET revoked_at=NOW() WHERE token=:token AND revoked_at IS NULL`

### B-03 — MEDIUM — TOCTOU email registration without transaction

- **File:** `backend/src/modules/users/user.service.ts:20-25`
- **Category:** Race Conditions
- **Code:** `existing = await this.userRepository.findByEmail(email); if (existing) throw ...; return this.userRepository.create(data);`
- **Impact:** Two concurrent registration requests with the same email both pass the check, causing unhandled TypeORM error → 500 instead of 409
- **Fix:** Wrap in transaction with `pessimistic_write` lock, or catch the unique constraint error

### B-04 — MEDIUM — Status toggle without transaction

- **File:** `backend/src/modules/inquiries/inquiry.service.ts:122-131`
- **Category:** Race Conditions
- **Code:** `inquiry = await this.findByIdOrFail(id); if (inquiry.status !== NEW) throw ...; await this.inquiryRepository.update(id, { status: READ });`
- **Impact:** Two concurrent `markAsRead` calls both see `status === NEW`, both pass the guard
- **Fix:** Atomic update: `UPDATE inquiries SET status='read' WHERE id=:id AND status='new'`

### B-05 — MEDIUM — TOCTOU amenity unique check without transaction

- **File:** `backend/src/modules/amenities/amenity.service.ts:14-19`
- **Category:** Race Conditions
- **Code:** `existing = await this.amenityRepository.findByName(dto.name); if (existing) throw ...; return this.amenityRepository.create(dto);`
- **Impact:** Two concurrent requests with same amenity name both pass the check; DB unique constraint catches it → 500 error
- **Fix:** Wrap in transaction with lock, or catch constraint violation

### B-06 — MEDIUM — TOCTOU favorite add without transaction

- **File:** `backend/src/modules/favorites/favorite.service.ts:22-30`
- **Category:** Race Conditions
- **Code:** `existing = await this.favoriteRepository.findByUserAndProperty(...); if (existing) return; return this.favoriteRepository.create(...);`
- **Impact:** Two concurrent "add favorite" requests both see no existing record; unique index catches duplicate → unhandled error
- **Fix:** Wrap in transaction or catch constraint violation

---

## Category 5: N+1 Query Problems (B-07, B-08)

### B-07 — MEDIUM — Photo upload N+1 INSERTs in loop

- **File:** `backend/src/modules/properties/property.service.ts:118-129`
- **Category:** N+1 Queries
- **Code:** `for (let i = 0; i < files.length; i++) { ... await this.photoRepository.create({...}); }`
- **Impact:** Uploading 10 photos = 10 separate INSERT queries instead of 1 batch INSERT
- **Fix:** Use `this.photoRepository.repository.save(photos)` with the full array for a single batch INSERT

### B-08 — LOW — Photo sort order update in loop

- **File:** `backend/src/modules/properties/property-photo.repository.ts:54-56`
- **Category:** N+1 Queries
- **Code:** `for (const [photoId, sortOrder] of orderMap) { await this.repository.update(photoId, { sortOrder }); }`
- **Impact:** Reordering N photos = N separate UPDATE queries. Realistic max ~20 photos per property → minor
- **Fix:** Use a single `UPDATE ... CASE WHEN ...` bulk update

---

## Category 6: Input Validation Gaps (B-09–B-12)

### B-09 — HIGH — Unbounded array in ReorderPhotosDto

- **File:** `backend/src/modules/properties/dto/reorder-photos.dto.ts:4-9`
- **Category:** Input Validation
- **Code:** `@IsArray() @IsUUID('4', { each: true }) photoIds: string[];`
- **Impact:** No `@ArrayMaxSize()` — attacker can send 100,000+ UUIDs, causing memory exhaustion
- **Fix:** Add `@ArrayMaxSize(50)` to bound the photo array

### B-10 — MEDIUM — Missing latitude/longitude bounds in AddressDto

- **File:** `backend/src/modules/properties/dto/create-property.dto.ts:44-52`
- **Category:** Input Validation
- **Code:** `@IsOptional() @IsNumber() latitude?: number; @IsOptional() @IsNumber() longitude?: number;`
- **Impact:** No `@Min`/`@Max` bounds — latitude could be 999 (valid: -90 to 90)
- **Fix:** Add `@Min(-90) @Max(90)` for latitude, `@Min(-180) @Max(180)` for longitude

### B-11 — MEDIUM — Missing date format validation on availableFrom

- **File:** `backend/src/modules/properties/dto/create-property.dto.ts:99-101`
- **Category:** Input Validation
- **Code:** `@IsOptional() @IsString() availableFrom?: string;`
- **Impact:** Accepts arbitrary strings; DB column is `@Column({ type: 'date' })` — invalid strings cause DB errors
- **Fix:** Add `@Matches(/^\d{4}-\d{2}-\d{2}$/)` or use a custom date format validator

### B-12 — MEDIUM — LoginDto password missing @MaxLength

- **File:** `backend/src/modules/auth/dto/login.dto.ts:17-19`
- **Category:** Input Validation
- **Code:** `@IsString() @IsNotEmpty() password: string;`
- **Impact:** No maximum length — multi-megabyte password causes expensive bcrypt hashing (CPU-based DoS)
- **Fix:** Add `@MaxLength(128)` to limit password length before bcrypt processing

---

## Category 7: Business Logic Bugs (C-01–C-03)

### C-01 — HIGH — Uploaded files accepted but never persisted to storage

- **File:** `backend/src/modules/properties/property.service.ts:109-131`
- **Category:** Business Logic
- **Code:**
  ```ts
  // property.controller.ts:142 — FilesInterceptor('files', 10, { storage: memoryStorage() })
  // property.service.ts:120-127
  const url = `uploads/properties/${propertyId}/${Date.now()}-${file.originalname}`;
  const photo = await this.photoRepository.create({ propertyId, url, ... });
  ```
- **Impact:** `memoryStorage()` keeps file buffers in memory only. The service constructs a URL string but never writes the buffer to disk or uploads to S3. Photo URLs always return 404.
- **Fix:** Implement S3 upload in `infrastructure/s3/`, then write the file buffer to S3 and store the S3 URL. Or use `diskStorage` to persist locally.

### C-02 — MEDIUM — `respondToInquiry` skips status validation, enabling invalid transitions

- **File:** `backend/src/modules/inquiries/inquiry.service.ts:139-153`
- **Category:** Business Logic
- **Code:**
  ```ts
  async respondToInquiry(id: string, response: string) {
    const inquiry = await this.findByIdOrFail(id);
    await this.inquiryRepository.update(id, {
      response: response.trim(),
      status: InquiryStatusEnum.RESPONDED,
      respondedAt: new Date(),
    });
  ```
- **Impact:** Allows NEW→RESPONDED without going through READ first, and allows re-responding to an already-RESPONDED inquiry without guard
- **Fix:** Validate `inquiry.status` before updating — reject if already RESPONDED

### C-03 — MEDIUM — Soft-delete of property leaves orphaned related entities

- **File:** `backend/src/modules/properties/property.service.ts:104-107`
- **Category:** Business Logic
- **Code:**
  ```ts
  async archive(id: string): Promise<void> {
    await super.findByIdOrFail(id);
    await this.propertyRepository.softDelete(id);
  }
  ```
- **Impact:** `softDelete()` only sets `deleted_at` on Property row. Related entities (photos, amenities, favorites, inquiries) remain referencing a soft-deleted property
- **Fix:** Manually soft-delete or nullify related entities before soft-deleting the property

---

## Category 8: Error Information Leaks

No findings.

---

## Category 9: File Upload Vulnerabilities (C-04)

### C-04 — LOW — No fileFilter on photo upload endpoint

- **File:** `backend/src/modules/properties/property.controller.ts:142`
- **Category:** File Upload
- **Code:**
  ```ts
  FilesInterceptor('files', 10, { storage: memoryStorage() }),
  ```
- **Impact:** No `fileFilter` function — allows any file type (executables, scripts). Mitigated by admin role restriction and files never being persisted
- **Fix:** Add a `fileFilter` that whitelists image MIME types (`image/jpeg`, `image/png`, `image/webp`)

---

## Category 10: Frontend Bugs (D-05–D-11)

### D-05 — HIGH — Hook API mismatch causes runtime crashes on form submission

- **File:** `frontend/app/pages/renter/detail.tsx:29,46,230,232,253`
- **Category:** Frontend Bugs
- **Code:** `const submitInquiry = useSubmitInquiry(id || '')` then `submitInquiry.mutate(...)`, `submitInquiry.isError`, `submitInquiry.error`, `submitInquiry.isPending`
- **Impact:** `useSubmitInquiry` returns `{submit, loading}` not `{mutate, isPending, isError, error}`. Submitting the inquiry form calls `undefined()` and crashes. Hidden by `@ts-nocheck`.
- **Fix:** Align hook usage with its actual return type

### D-06 — HIGH — Hook API mismatch in profile page causes runtime crashes

- **File:** `frontend/app/pages/profile.tsx:32,49,50,85`
- **Category:** Frontend Bugs
- **Code:** `updateProfile.mutate({...}, { onSuccess: ... })` then `updateProfile.isError`, `updateProfile.error`, `updateProfile.isPending`
- **Impact:** `useUpdateProfile` returns `{update, loading}` not `{mutate, isPending, isError, error}`. Same pattern as D-05.
- **Fix:** Align hook usage with actual return type

### D-07 — HIGH — Unhandled promise rejections in all fetch-based hooks

- **File:** `frontend/app/hooks/api/useProperties.ts:4-5`, `useAdmin.ts:4-6`, `useFavorites.ts:4`, `useProfile.ts:8-9`, `useAmenities.ts:4`, `useInquiries.ts:4`
- **Category:** Frontend Bugs
- **Code:** `.then(r => r.json()).then(setData)` without `.catch()`
- **Impact:** Network failures, JSON parse errors, or 4xx/5xx responses all cause unhandled promise rejections. No error state is set.
- **Fix:** Add `.catch()` to every fetch chain, set error state, show user feedback

### D-08 — MEDIUM — Array index as key in property detail page

- **File:** `frontend/app/pages/renter/detail.tsx:140,176,201`
- **Category:** Frontend Bugs
- **Code:** `thumbnails.map((src, i) => <div key={i} ...>)` and `stats.map((stat, i) => <div key={i} ...>)` and `amenities.map((amenity, i) => <div key={i} ...>)`
- **Impact:** If thumbnails/stats/amenities are reordered, React will mismanage DOM updates
- **Fix:** Use unique IDs as keys

### D-09 — MEDIUM — Array index as key in landing page

- **File:** `frontend/app/pages/landing.tsx:159,189,217,224,232`
- **Category:** Frontend Bugs
- **Code:** Multiple `map((..., i) => ...key={i}...)` in How It Works, Features, Footer sections
- **Impact:** Stale component state on re-render for dynamic lists
- **Fix:** Use unique keys from data (e.g., `step.title` or `feat.title`)

### D-10 — MEDIUM — `@ts-nocheck` in 48 files disables all type safety

- **File:** `frontend/app/` — 48 files (all pages, guards, layouts, root, authSlice, services)
- **Category:** Frontend Bugs
- **Code:** `// @ts-nocheck` on line 1 of every page and component
- **Impact:** The entire frontend TypeScript strict mode is effectively disabled. Bugs like D-05 and D-06 are invisible at compile time.
- **Fix:** Remove `@ts-nocheck` starting with leaf components, fix type errors iteratively

### D-11 — MEDIUM — `localStorage.removeItem('token')` references localStorage token not set by current code

- **File:** `frontend/app/utils/errorHandler.ts:41`
- **Category:** Frontend Bugs
- **Code:** `localStorage.removeItem('token'); window.location.href = '/login';`
- **Impact:** Dead code from a previous auth strategy. No `localStorage.setItem('token')` exists anywhere in the codebase (auth uses httpOnly cookies).
- **Fix:** Remove the `localStorage.removeItem` call; use router navigation instead of `window.location.href`

---

## Category 11: PII in Console/Logs

No findings — zero `console.log`/`console.error` statements exist in the frontend source code.

---

## Category 12: WebSocket Security (D-01–D-04)

### D-01 — CRITICAL — No authentication validation in WebSocket gateway

- **File:** `backend/src/modules/websocket/websocket.gateway.ts:8-11`
- **Category:** WebSocket Security
- **Code:** `handleConnection(client: Socket): void { const token = client.handshake.auth?.token || client.handshake.headers?.cookie; if (token) { console.log(\`WS client connected: ${client.id}\`); } }`
- **Impact:** Token is extracted but never validated; any client can connect, including unauthenticated ones. CORS `origin: '*'` allows connection from any domain.
- **Fix:** Inject AuthService, validate token, disconnect invalid clients

### D-02 — CRITICAL — No room isolation — all clients receive all notifications

- **File:** `backend/src/modules/websocket/websocket.gateway.ts:14-16`
- **Category:** WebSocket Security
- **Code:** `@SubscribeMessage('newInquiry') handleNewInquiry(client: Socket, payload: any): void { this.server.emit('inquiryNotification', payload); }`
- **Impact:** Every connected client receives all inquiry/property notifications. User A's inquiry is broadcast to User B, C, D.
- **Fix:** Use socket rooms scoped to user/property, validate sender owns the inquiry before broadcasting

### D-03 — CRITICAL — No message validation on WebSocket messages

- **File:** `backend/src/modules/websocket/websocket.gateway.ts:14,19`
- **Category:** WebSocket Security
- **Code:** `payload: any` (both `newInquiry` and `propertyUpdate` handlers)
- **Impact:** Payload is untyped and unvalidated. Malicious payloads from any connected client are broadcast to all clients.
- **Fix:** Add DTO validation with `ValidationPipe`, sanitize all broadcast payloads

### D-04 — HIGH — No rate limiting on WebSocket gateway

- **File:** `backend/src/modules/websocket/websocket.gateway.ts:13-21`
- **Category:** WebSocket Security
- **Code:** Both `@SubscribeMessage` handlers lack any rate limiting
- **Impact:** A malicious client can flood messages, causing a broadcast storm to all connected clients (DoS amplification)
- **Fix:** Implement per-client rate limiting (e.g., `@nestjs/throttler` or custom middleware)

---

## Category 13: Email & Notification Injection

No findings — MailService is a stub with no templates wired to features.

---

## Category 14: CSRF, SSRF & CORS

No findings beyond the duplicate cookie secure flag finding (see A-05).

---

## Category 15: Payment Security

No findings — no payment/subscription code exists.

---

## Category 16: Rate Limiting (F-01, F-04)

### F-01 — CRITICAL — No rate limiting on any auth endpoint

- **File:** `backend/src/app.module.ts:1-29`
- **Category:** Rate Limiting
- **Code:** `ThrottlerModule` not imported; no `@Throttle()` on `register`, `login`, `forgot-password`, `reset-password`, or `refresh`
- **Impact:** Unbounded brute force on login, email bombing via forgot-password, account creation abuse
- **Fix:** Import `ThrottlerModule.forRoot()` in app.module.ts and add `@Throttle()` decorators on all public auth endpoints

### F-04 — HIGH — File upload endpoint without rate limiting

- **File:** `backend/src/modules/properties/property.controller.ts:132-142`
- **Category:** Rate Limiting
- **Code:** `@Post(':id/photos')` with `FilesInterceptor('files', 10)` — no rate limiting
- **Impact:** Malicious admin can exhaust server memory with repeated large uploads
- **Fix:** Add `@Throttle({ default: { limit: 5, ttl: 60000 } })` on the upload endpoint

---

## Category 17: Database Migrations (F-02, F-03, F-09)

### F-02 — CRITICAL — `synchronize: true` hardcoded in app.module.ts

- **File:** `backend/src/app.module.ts:22`
- **Category:** Migrations/DB
- **Code:** `synchronize: true, logging: false`
- **Impact:** Accidental schema drops/data loss in production; overrides env-config.service.ts which correctly uses `!this.isProduction()`
- **Fix:** Remove hardcoded `synchronize: true`, use env-config settings, or set `synchronize: process.env.NODE_ENV !== 'production'`

### F-03 — HIGH — Migration targets PostgreSQL, app uses SQLite

- **File:** `backend/src/database/migrations/001-initial-schema.ts:1-295`
- **Category:** Database Migrations
- **Code:** Migration uses `CREATE EXTENSION "uuid-ossp"` (line 7) and PG `enum` type; `app.module.ts` configures `type: 'sqlite'`
- **Impact:** Migration fails if executed against SQLite; schema relies on `synchronize` instead of migrations

### F-09 — MEDIUM — property_amenities missing index on property_id

- **File:** `backend/src/modules/properties/entities/property-amenity.entity.ts:1-27` and `001-initial-schema.ts:167-179`
- **Category:** Database Migrations
- **Code:** Entity has `@Index(['amenityId'])` but no `@Index(['propertyId'])`; migration creates `amenity_id` index but no `property_id` index
- **Impact:** JOIN queries filtering on `property_id` in the junction table will be slow at scale

---

## Category 18: CI/CD, Entities, Tests & Shared Code (F-05–F-08, F-10)

### F-05 — HIGH — Frontend Docker container runs as root

- **File:** `frontend/Dockerfile:17`
- **Category:** CI/CD
- **Code:** `FROM node:20-slim` (final stage, no `USER` directive after package copy)
- **Impact:** Container breakout if app process is compromised
- **Fix:** Add `USER node` before `CMD` in final stage

### F-06 — HIGH — No backend Dockerfile exists

- **File:** `frontend/Dockerfile` only; no `backend/Dockerfile`
- **Category:** CI/CD
- **Impact:** Backend service cannot be containerized; docker-compose deployment impossible

### F-07 — MEDIUM — Missing HEALTHCHECK in Dockerfile

- **File:** `frontend/Dockerfile:1-22`
- **Category:** CI/CD
- **Code:** No `HEALTHCHECK` instruction in the only Dockerfile
- **Impact:** Orchestrator cannot detect unhealthy container; no auto-restart

### F-08 — MEDIUM — Zero backend test files exist

- **File:** `backend/test/` and `backend/src/` (entire tree)
- **Category:** Tests
- **Code:** No `*.spec.ts` or `*.test.ts` files found anywhere in backend
- **Impact:** No regression coverage; code changes risk undetected breakage

### F-10 — MEDIUM — Missing .dockerignore for backend

- **File:** `frontend/.dockerignore` exists; no `backend/.dockerignore`
- **Category:** CI/CD
- **Impact:** Large build context if backend Dockerfile is added later (node_modules, .git, etc.)

---

## Systemic Root Causes

1. **No centralized JWT configuration** — Three separate places define JWT secrets with different env var names and fallback defaults. A single `jwt.config.ts` exists but is never imported into `AppModule`.

2. **No rate limiting infrastructure** — `ThrottlerModule` is not configured at the application level. All auth endpoints and file uploads are unprotected.

3. **Development shortcuts shipped to production** — `synchronize: true`, hardcoded fallback secrets, memory-only file storage, and `@ts-nocheck` patterns indicate MVP code that was never hardened.

4. **WebSocket gateway built without security primitives** — No auth validation, no room isolation, no message validation, no rate limiting. The gateway is open to any client on any domain.

5. **Frontend hooks and components not synchronized** — Custom hooks return `{submit, loading}` while pages use `{mutate, isPending, isError, error}`. The `@ts-nocheck` pragma hides all type mismatches.

6. **Toctou races in 6 separate services** — Read-then-write patterns without transactions or pessimistic locks across password reset, token refresh, registration, status transitions, and favorites.

---

**Total: 43 findings** (8 critical, 12 high, 21 medium, 2 low)
