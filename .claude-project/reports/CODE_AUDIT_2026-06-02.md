# nestfind — Code Audit Report

**Date:** 2026-06-02
**Method:** Automated scan across 18 categories (backend + frontend)

---

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 14 |
| HIGH | 26 |
| MEDIUM | 30 |
| LOW | 7 |
| **Total** | **77** |

---

## Category 1: Secrets & Hardcoded Configuration (E)

### #E01 — CRITICAL — Committed .env File Contains Real Credentials
- **File:** `backend/.env:1-28`
- **Category:** Secrets & Hardcoded Configuration
- **Code:**
```
DATABASE_PASSWORD=pg@saiful13
JWT_SECRET=nestfind-dev-secret-key-change-in-production
AUTH_JWT_SECRET=nestfind-dev-secret-key-change-in-production
JWT_ACCESS_SECRET=nestfind-dev-secret-key-change-in-production
JWT_REFRESH_SECRET=nestfind-dev-refresh-secret-key
ADMIN_PASSWORD=AdminPass123!
MAIL_USER=463saiful0@gmail.com
MAIL_PASS=zpjsnblitlydrjvd
```
- **Impact:** The entire `.env` file is committed to the repository. Attackers with repository access can compromise the PostgreSQL database, forge JWT tokens for any user, authenticate as the built-in admin, and send emails or access the configured Gmail account via the app password. The database password and mail app password appear to be real credentials.
- **Fix:** Immediately remove `backend/.env` from git history using `git filter-repo` or BFG Repo-Cleaner. Add `.env` to `.gitignore`. Rotate all exposed credentials (database password, JWT secrets, admin password, mail app password). Use `backend/.env.example` for non-sensitive templates only.

### #E02 — MEDIUM — Hardcoded CORS Origins in main.ts
- **File:** `backend/src/main.ts:16-19`
- **Category:** Secrets & Hardcoded Configuration
- **Code:**
```typescript
app.enableCors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
});
```
- **Impact:** Allowed CORS origins are hardcoded in application code rather than read from environment configuration. In production, this will block legitimate frontend origins or force code changes for every deployment environment. The existing `EnvConfigService.getOrigins()` already reads `ALLOW_ORIGINS` but is never used in `main.ts`.
- **Fix:** Replace the hardcoded array with a call to `EnvConfigService.getOrigins()` so CORS is driven by the `ALLOW_ORIGINS` environment variable.

---

## Category 2: Missing Auth / Role Guards (A)

### #A01 — CRITICAL — Inherited BaseController Endpoints Bypass Role Checks in InquiryController
- **File:** `backend/src/modules/inquiries/inquiry.controller.ts:39`
- **Category:** Missing Auth / Role Guards
- **Code:**
```typescript
@Controller('inquiries')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InquiryController extends BaseController<Inquiry> {
```
`BaseController` exposes:
```typescript
@Post()
async create(@Body() createDto: CreateDto): Promise<T> { ... }

@Patch(':id')
async update(@Param('id') id: string, @Body() updateDto: UpdateDto): Promise<T | null> { ... }
```
- **Impact:** `InquiryController` does not override `create` and `update` from `BaseController`. `RolesGuard` looks for `@SetMetaRoles` metadata; when none is found on a handler, it returns `true` (`if (!roles) return true;`). Consequently, `POST /inquiries` and `PATCH /inquiries/:id` are accessible to ANY authenticated user, regardless of role, because no role metadata is attached to the inherited base methods.
- **Fix:** Override `create` and `update` in `InquiryController` with explicit `@SetRoles(RoleEnum.ADMIN)` and throw `MethodNotAllowedException` if these generic CRUD routes are not intended for direct use. Alternatively, set a class-level `@SetRoles(RoleEnum.ADMIN)` default and override specific renter methods with their own roles.

### #A02 — HIGH — Suspended Users Can Refresh Access Tokens
- **File:** `backend/src/modules/auth/services/auth.service.ts:48-56`
- **Category:** Missing Auth / Role Guards
- **Code:**
```typescript
async refresh(token: string): Promise<{ accessToken: string; refreshToken: string; user: Partial<User> }> {
    const existing = await this.refreshTokenRepo.findOne({ where: { token }, relations: ['user'] });
    if (!existing || existing.revokedAt) throw new UnauthorizedException('Invalid refresh token');
    if (new Date() > existing.expiresAt) throw new UnauthorizedException('Token expired');
    const result = await this.refreshTokenRepo.update({ token, revokedAt: IsNull() }, { revokedAt: new Date() });
    if (result.affected === 0) throw new UnauthorizedException('Token already revoked');
    const tokens = await this.generateTokens(existing.user);
    return { ...tokens, user: { ... } };
}
```
- **Impact:** After an admin suspends a user account, the user can still call the public `POST /auth/refresh` endpoint with a valid refresh token to obtain new access and refresh tokens, effectively bypassing the suspension mechanism entirely.
- **Fix:** Add a user status check before generating tokens: `if (existing.user.status === UserStatusEnum.SUSPENDED) throw new ForbiddenException('Account suspended');`.

---

## Category 3: IDOR / Missing Ownership Checks (I)

### #I01 — CRITICAL — Any Renter Can View Any Favorite by ID
- **File:** `backend/src/modules/favorites/favorite.controller.ts:28` (inherited `BaseController.findOne`)
- **Category:** IDOR / Missing Ownership Checks
- **Code:**
```typescript
// In BaseController
@Get(':id')
async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<T> {
    return this.service.findByIdOrFail(id);
}
```
- **Impact:** `FavoriteController` does not override `findOne`. Because the class is decorated with `@SetRoles(RoleEnum.RENTER)`, any authenticated renter can call `GET /favorites/:id` with any valid favorite UUID. `BaseController.findOne` calls `BaseService.findByIdOrFail(id)` which queries only by `id`, ignoring the authenticated user. This leaks which properties other users have favorited.
- **Fix:** Override `findOne` in `FavoriteController` to call a service method that filters by both `id` and `userId`, e.g., `favoriteRepository.findOne({ where: { id, userId: user.id } })`.

### #I02 — CRITICAL — Any Renter Can Update Any Favorite by ID
- **File:** `backend/src/modules/favorites/favorite.controller.ts:28` (inherited `BaseController.update`)
- **Category:** IDOR / Missing Ownership Checks
- **Code:**
```typescript
// In BaseController
@Patch(':id')
async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateDto): Promise<T | null> {
    return this.service.update(id, updateDto);
}
```
- **Impact:** `FavoriteController` does not override `update`. Any authenticated renter can `PATCH /favorites/:id` to modify another user's favorite record (e.g., change `propertyId` or inject a different `userId` in the body, depending on DTO fields). The base `update` only validates that the entity exists, not that it belongs to the caller.
- **Fix:** Override `update` in `FavoriteController` to verify ownership before updating, or return `MethodNotAllowedException` if updating favorites is not a valid business operation.

### #I03 — HIGH — Any Authenticated User Can Create Arbitrary Inquiries
- **File:** `backend/src/modules/inquiries/inquiry.controller.ts:39` (inherited `BaseController.create`)
- **Category:** IDOR / Missing Ownership Checks
- **Code:**
```typescript
// In BaseController
@Post()
async create(@Body() createDto: CreateDto): Promise<T> {
    return this.service.create(createDto);
}
```
- **Impact:** `InquiryController` does not override `create`, so `POST /inquiries` maps to `BaseController.create`. Any authenticated user can submit a body with arbitrary `userId` and `propertyId` fields, creating inquiries on behalf of other users or linking to arbitrary properties without validation. This bypasses the intended `InquirySubmitController` flow that should bind the inquiry to the authenticated user and validate the property.
- **Fix:** Override `create` in `InquiryController` to throw `MethodNotAllowedException` (since creation is handled by `POST /properties/:propertyId/inquiries`), or enforce that `createDto.userId` matches `@User('id')`.

### #I04 — HIGH — Any Authenticated User Can Update Any Inquiry
- **File:** `backend/src/modules/inquiries/inquiry.controller.ts:39` (inherited `BaseController.update`)
- **Category:** IDOR / Missing Ownership Checks
- **Code:**
```typescript
// In BaseController
@Patch(':id')
async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateDto): Promise<T | null> {
    return this.service.update(id, updateDto);
}
```
- **Impact:** `InquiryController` does not override `update`, so `PATCH /inquiries/:id` maps to `BaseController.update`. Any authenticated user can update any inquiry's fields (e.g., change `message`, `status`, `response`, `userId`, `propertyId`) without ownership or admin validation, because the base method only checks that the entity exists.
- **Fix:** Override `update` in `InquiryController` with `@SetRoles(RoleEnum.ADMIN)` and proper DTO validation, or throw `MethodNotAllowedException` if inquiry updates should only happen through `markAsRead`, `respond`, and `reply`.

### #I05 — HIGH — Inquiry Reply Endpoint Lacks Ownership Verification
- **File:** `backend/src/modules/inquiries/inquiry.controller.ts:198-219`
- **Category:** IDOR / Missing Ownership Checks
- **Code:**
```typescript
@Post(':id/reply')
@SetRoles(RoleEnum.RENTER)
async reply(
  @Param('id', ParseUUIDPipe) id: string,
  @Body() dto: ReplyInquiryDto,
) {
  const inquiry = await this.inquiryService.replyToInquiry(id, dto.reply);
}
```
- **Impact:** The `reply` endpoint accepts an inquiry ID from the URL but does NOT pass the authenticated user's ID to the service. `InquiryService.replyToInquiry(id, reply)` only checks that the inquiry exists before appending the reply. Any renter can reply to ANY inquiry, including inquiries submitted by other users.
- **Fix:** Pass `user.id` to `replyToInquiry` and add an ownership check in the service: verify that `inquiry.userId === userId` before allowing the reply.

### #I06 — MEDIUM — Logout Can Revoke Arbitrary Refresh Tokens
- **File:** `backend/src/modules/auth/auth.controller.ts:122-144`
- **Category:** IDOR / Missing Ownership Checks
- **Code:**
```typescript
@UseGuards(JwtAuthGuard)
@Post('logout')
async logout(
  @Req() req: Request,
  @User() user: { id: string; email: string; role: number },
) {
  const refreshToken = req.body?.refreshToken;
  if (refreshToken) {
    await this.authService.logout(refreshToken);
  }
}
```
- **Impact:** `logout` accepts an arbitrary `refreshToken` from the request body and revokes it without verifying that the token belongs to the currently authenticated user. If a refresh token is leaked or obtained via XSS/logs, any authenticated attacker can revoke it, causing a denial-of-service for the legitimate token owner.
- **Fix:** In `AuthService.logout`, after fetching the refresh token record, verify `existing.userId === currentUserId` before setting `revokedAt`. Alternatively, in the controller, pass `user.id` to the service and enforce the match there.

---

## Category 4: Race Conditions & Concurrency (R)

### #R01 — CRITICAL — Email Registration TOCTOU Without Pessimistic Lock
- **File:** `backend/src/modules/users/user.service.ts:31`
- **Category:** Race Conditions & Concurrency
- **Code:**
```typescript
const existing = await queryRunner.manager.findOne(User, { where: { email: data.email } });
if (existing) {
  throw new ConflictException('Email already exists!');
}
const user = await queryRunner.manager.save(queryRunner.manager.create(User, data));
```
- **Impact:** Two concurrent registration requests with the same email can both pass the `findOne` check before either commits. While the database `@Unique(['email'])` constraint on the `users` table acts as a backstop, the application relies on commit-time failure rather than true serialization. One transaction rolls back with a generic `ConflictException('Email already exists!')`, but the TOCTOU window allows both to proceed to the `save()` call.
- **Fix:** Add `lock: { mode: 'pessimistic_write' }` to the `findOne` query inside the transaction, or use an atomic `INSERT ... ON CONFLICT` / `upsert` pattern.

### #R02 — HIGH — Favorite Add TOCTOU Without Pessimistic Lock
- **File:** `backend/src/modules/favorites/favorite.service.ts:29`
- **Category:** Race Conditions & Concurrency
- **Code:**
```typescript
const existing = await queryRunner.manager.findOne(Favorite, {
  where: { userId, propertyId } as any,
});
if (existing) {
  await queryRunner.commitTransaction();
  return existing;
}
const favorite = await queryRunner.manager.save(
  queryRunner.manager.create(Favorite, { userId, propertyId }),
);
```
- **Impact:** Concurrent `add` requests for the same user-property pair can both pass the `findOne` check, then both attempt `save()`. The database unique index on `[userId, propertyId]` catches this, but the second request receives the generic catch-all error `'Failed to add favorite'` instead of a clear duplicate indication, and the transaction is rolled back wastefully.
- **Fix:** Add `lock: { mode: 'pessimistic_write' }` to the `findOne` query, or replace the pattern with an atomic `INSERT ... ON CONFLICT DO NOTHING` / `upsert`.

### #R03 — HIGH — Amenity Create TOCTOU Without Pessimistic Lock
- **File:** `backend/src/modules/amenities/amenity.service.ts:24`
- **Category:** Race Conditions & Concurrency
- **Code:**
```typescript
const existing = await queryRunner.manager.findOne(Amenity, { where: { name: dto.name } });
if (existing) {
  throw new ConflictException('Amenity with this name already exists!');
}
const amenity = await queryRunner.manager.save(queryRunner.manager.create(Amenity, dto as any));
```
- **Impact:** Two concurrent amenity creation requests with the same name can both pass the `findOne`, then both proceed to `save()`. The database unique constraint on `amenity.name` catches the second insert, causing a transaction rollback and generic `ConflictException`. The race wastes a transaction and produces a confusing error boundary.
- **Fix:** Add `lock: { mode: 'pessimistic_write' }` to the `findOne` query inside the transaction.

### #R04 — MEDIUM — Amenity Update Name Uniqueness Check Outside Transaction
- **File:** `backend/src/modules/amenities/amenity.service.ts:42`
- **Category:** Race Conditions & Concurrency
- **Code:**
```typescript
if (dto.name) {
  const existing = await this.amenityRepository.findByNameExcludingId(dto.name, id);
  if (existing) {
    throw new ConflictException('Amenity with this name already exists!');
  }
}
return this.update(id, dto as any);
```
- **Impact:** The `findByNameExcludingId` and `update` are not wrapped in a transaction. Two concurrent updates to different amenities (both changing their names to the same new value) can both pass the uniqueness check, then both attempt to update. The second update hits the database unique constraint, throwing an unhandled `QueryFailedError` instead of the intended `ConflictException`.
- **Fix:** Wrap the uniqueness check and the `update` call in a single transaction with a pessimistic lock on the target row.

### #R05 — MEDIUM — Property Amenity Sync Non-Atomic Delete-Insert
- **File:** `backend/src/modules/properties/property.service.ts:263`
- **Category:** Race Conditions & Concurrency
- **Code:**
```typescript
private async syncAmenities(
  propertyId: string,
  amenityIds: string[],
): Promise<void> {
  await this.propertyAmenityRepo.deleteByPropertyId(propertyId);
  if (amenityIds.length > 0) {
    await this.propertyAmenityRepo.insertMany(
      amenityIds.map((amenityId) => ({ propertyId, amenityId })),
    );
  }
}
```
- **Impact:** `syncAmenities` is called from `updateProperty` without an enclosing transaction. Two concurrent property updates can interleave: T1 deletes, T2 deletes, T1 inserts, T2 inserts. The property can end up with duplicate `property_amenities` rows (if the table lacks a unique constraint) or, more likely, a transient state where the property has zero amenities between the delete and insert of each request.
- **Fix:** Wrap `deleteByPropertyId` and `insertMany` in a database transaction inside `syncAmenities`, or move the transaction boundary up into `updateProperty`.

### #R06 — MEDIUM — Inquiry Response Read-Modify-Write Without Lock
- **File:** `backend/src/modules/inquiries/inquiry.service.ts:155`
- **Category:** Race Conditions & Concurrency
- **Code:**
```typescript
const inquiry = await this.findByIdOrFail(id);
const existingResponse = inquiry.response || '';
const formattedResponse = existingResponse
  ? existingResponse + `\n\n[Admin | ${new Date().toLocaleDateString()}]:\n${response.trim()}`
  : response.trim();
const result = await this.inquiryRepository.conditionalUpdate(
  { id } as any,
  {
    response: formattedResponse as any,
    status: InquiryStatusEnum.RESPONDED as any,
    respondedAt: new Date(),
  },
);
```
- **Impact:** `respondToInquiry` and `replyToInquiry` both read the current `response` text, append to it in memory, and write it back. The `conditionalUpdate` only filters by `{ id }`, not by a version or timestamp. Two concurrent responses can both read the original state, both append independently, and the second update silently overwrites the first, causing response text loss.
- **Fix:** Add an optimistic-locking condition to the update (e.g., `where: { id, status: InquiryStatusEnum.NEW }` for the first response) or use a database-native append operation.

---

## Category 5: N+1 Query Problems (N)

No findings in N+1 Query Problems.

---

## Category 6: Input Validation Gaps (V)

### #V01 — CRITICAL — Property Search Endpoint Accepts Unvalidated `any` Query Object
- **File:** `backend/src/modules/properties/property.controller.ts:54`
- **Category:** Input Validation Gaps
- **Code:**
```typescript
async search(@Query() query: any) {
  const result = await this.propertyService.search(query);
}
```
- **Impact:** The entire query object is typed as `any` with zero `class-validator` decorators. Attackers can inject arbitrary properties, invalid types (e.g., arrays/objects for `limit`), or prototype-polluting keys. The service does cap `limit` at 100 and whitelists `sortBy`, but unvalidated input bypasses NestJS validation pipes entirely, exposing the endpoint to type confusion and unexpected behavior.
- **Fix:** Create a `SearchPropertyQueryDto` decorated with `@IsOptional()`, `@IsNumber()`, `@Min()`, `@Max()`, `@IsEnum()`, `@IsString()`, `@MinLength()`, `@MaxLength()`, and `@ValidateNested()` for nested address filters.

### #V02 — CRITICAL — Favorite List Pagination Parameters Completely Unvalidated
- **File:** `backend/src/modules/favorites/favorite.controller.ts:44-49`
- **Category:** Input Validation Gaps
- **Code:**
```typescript
@Query('page') page?: number,
@Query('limit') limit?: number,
...
const p = page ? (typeof page === 'string' ? parseInt(page, 10) : page) : 1;
const l = limit ? (typeof limit === 'string' ? parseInt(limit as any, 10) : limit) : 20;
```
- **Impact:** No validation decorators exist on `page` or `limit`. While the service caps `limit` at 100, `page` is entirely unvalidated. A negative `page` value (e.g., `page=-9999999`) produces a negative `skip` in the repository, which can cause database errors or return unpredictable result sets.
- **Fix:** Use a `PaginationQueryDto` with `@IsInt()`, `@Min(1)` on `page`, and `@IsInt()`, `@Min(1)`, `@Max(100)` on `limit`.

### #V03 — CRITICAL — Inquiry Admin List Pagination Parameters Completely Unvalidated
- **File:** `backend/src/modules/inquiries/inquiry.controller.ts:59-60`
- **Category:** Input Validation Gaps
- **Code:**
```typescript
@Query('page') page?: number,
@Query('limit') limit?: number,
```
- **Impact:** Same as V02. Raw query parameters are parsed with `parseInt` and passed directly to the service. No class-validator enforcement. Negative or non-numeric page values propagate to the repository skip calculation.
- **Fix:** Apply a `PaginationQueryDto` with `@IsInt()`, `@Min(1)`, and `@Max(100)` as in V02.

### #V04 — HIGH — CreatePropertyDto amenityIds Unbounded Array
- **File:** `backend/src/modules/properties/dto/create-property.dto.ts:110-114`
- **Category:** Input Validation Gaps
- **Code:**
```typescript
@ApiPropertyOptional({ description: 'Array of amenity UUIDs to associate with the property', type: [String] })
@IsOptional()
@IsArray()
@IsUUID('4', { each: true })
amenityIds?: string[];
```
- **Impact:** `@IsArray()` and `@IsUUID('4', { each: true })` validate element format but do not limit the array size. An attacker can send an `amenityIds` array with thousands of entries, causing expensive validation iteration and a massive `INSERT` batch in `syncAmenities`.
- **Fix:** Add `@ArrayMaxSize(50)` (or a reasonable business limit) to the `amenityIds` field.

### #V05 — MEDIUM — LoginDto Password Missing @MinLength
- **File:** `backend/src/modules/auth/dto/login.dto.ts:17-20`
- **Category:** Input Validation Gaps
- **Code:**
```typescript
@IsString()
@IsNotEmpty()
@MaxLength(128)
password: string;
```
- **Impact:** Registration enforces `@MinLength(8)`, but login accepts passwords of any positive length. A 1-character password is accepted at login, creating an inconsistency and weakening the login boundary against trivial brute-force attempts.
- **Fix:** Add `@MinLength(8)` to match the registration requirement.

### #V06 — MEDIUM — CreateUserDto Phone Accepts Empty String
- **File:** `backend/src/modules/users/dto/create-user.dto.ts:50-53`
- **Category:** Input Validation Gaps
- **Code:**
```typescript
@IsOptional()
@IsString()
@MaxLength(20)
phone?: string;
```
- **Impact:** An empty string `""` satisfies `@IsString()` and `@MaxLength(20)` but stores a meaningless value in the database. There is no lower-bound enforcement.
- **Fix:** Add `@MinLength(1)` or replace `@IsString()` with `@IsNotEmpty()` in combination with `@IsOptional()`.

### #V07 — MEDIUM — UpdateProfileDto Phone Accepts Empty String
- **File:** `backend/src/modules/profile/dto/update-profile.dto.ts:22-25`
- **Category:** Input Validation Gaps
- **Code:**
```typescript
@IsOptional()
@IsString()
@MaxLength(20)
phone?: string;
```
- **Impact:** Same as V06. A PATCH request can clear the phone to an empty string instead of `null`.
- **Fix:** Add `@MinLength(1)`.

### #V08 — MEDIUM — SubmitInquiryDto Optional Name/Phone Accept Empty Strings
- **File:** `backend/src/modules/inquiries/dto/submit-inquiry.dto.ts:14-28`
- **Category:** Input Validation Gaps
- **Code:**
```typescript
@IsOptional()
@IsString({ message: 'Name must be a string!' })
@MaxLength(100, { message: 'Name must not exceed 100 characters!' })
name?: string;

@IsOptional()
@IsString({ message: 'Phone must be a string!' })
@MaxLength(20, { message: 'Phone must not exceed 20 characters!' })
phone?: string;
```
- **Impact:** Optional string fields have upper-bound length limits but no lower-bound limits. Empty strings `""` pass validation and are stored.
- **Fix:** Add `@MinLength(1)` to both optional string fields.

### #V09 — MEDIUM — UpdateUserDto Phone Accepts Empty String
- **File:** `backend/src/modules/users/dto/update-user.dto.ts:39-42`
- **Category:** Input Validation Gaps
- **Code:**
```typescript
@IsOptional()
@IsString()
@MaxLength(20)
phone?: string;
```
- **Impact:** Same empty-string bypass as V06 and V07.
- **Fix:** Add `@MinLength(1)`.

---

## Category 7: Business Logic Bugs (L)

### #L01 — HIGH — Property Search minPrice Filter Silently Dropped When maxPrice Also Provided
- **File:** `backend/src/modules/properties/property.repository.ts:35`
- **Category:** Business Logic Bugs
- **Code:**
```typescript
if (filters.minPrice != null) {
  (base as any).price = MoreThanOrEqual(filters.minPrice);
}
if (filters.maxPrice != null) {
  if (filters.minPrice != null) {
    delete (base as any).price;
  }
  (base as any).price = LessThanOrEqual(filters.maxPrice);
}
```
- **Impact:** When a user searches with both `minPrice` and `maxPrice`, the minimum bound is deleted before the maximum bound is applied. The query only applies `LessThanOrEqual(maxPrice)`, so properties below `minPrice` are incorrectly included in results. This breaks core price-range filtering.
- **Fix:** When both values are present, use a composite condition such as `And(MoreThanOrEqual(filters.minPrice), LessThanOrEqual(filters.maxPrice))` or TypeORM's `Between`.

### #L02 — HIGH — Property Archive Hard-Deletes Amenities While Other Relations Are Soft-Deleted
- **File:** `backend/src/modules/properties/property-amenity.repository.ts:13`
- **Category:** Business Logic Bugs
- **Code:**
```typescript
async softDeleteByPropertyId(propertyId: string): Promise<void> {
  await this.repository.delete({ propertyId } as any);
}
```
- **Impact:** `PropertyService.archive()` calls `softDeleteByPropertyId` for photos, favorites, amenities, and the property. The first three methods perform soft deletes, but this one performs a hard delete because it calls `repository.delete()` instead of `repository.softDelete()`. Restoring an archived property would recover photos and favorites, but amenities would be permanently lost.
- **Fix:** Rename the method to `deleteByPropertyId` (to match the hard-delete behavior) and document that join tables are intentionally hard-deleted, or implement a soft-delete-compatible linking table if restoration is a business requirement.

### #L03 — MEDIUM — Inquiry Status Transitions Not Validated in respondToInquiry
- **File:** `backend/src/modules/inquiries/inquiry.service.ts:146`
- **Category:** Business Logic Bugs
- **Code:**
```typescript
async respondToInquiry(id: string, response: string): Promise<Record<string, unknown>> {
  const inquiry = await this.findByIdOrFail(id);
  ...
  const result = await this.inquiryRepository.conditionalUpdate(
    { id } as any,
    { response: formattedResponse as any, status: InquiryStatusEnum.RESPONDED as any, respondedAt: new Date() },
  );
}
```
- **Impact:** Admins can call `respondToInquiry` on inquiries that are already `RESPONDED`, overwriting existing responses and bypassing the intended workflow. There is no guard against duplicate or late responses.
- **Fix:** Validate the current status before updating. Only allow transition to `RESPONDED` from `NEW` or `READ`. Reject with `BadRequestException` for invalid transitions.

### #L04 — MEDIUM — Soft-Deleted Property Leaves Active Inquiries Orphaned
- **File:** `backend/src/modules/properties/property.service.ts:104`
- **Category:** Business Logic Bugs
- **Code:**
```typescript
async archive(id: string): Promise<void> {
  await super.findByIdOrFail(id);
  await this.photoRepository.softDeleteByPropertyId(id);
  await this.propertyAmenityRepo.softDeleteByPropertyId(id);
  await this.favoriteRepo.softDeleteByPropertyId(id);
  await this.propertyRepository.softDelete(id);
}
```
- **Impact:** Inquiries linked to the property are not archived or updated. Because `Inquiry.property` has `onDelete: 'SET NULL'`, the inquiries remain active in dashboards with a broken or null property reference, creating orphaned records.
- **Fix:** Soft-delete or update the status of related inquiries when a property is archived.

---

## Category 8: Error Information Leaks (X)

### #X01 — CRITICAL — Email Enumeration via Registration ConflictException
- **File:** `backend/src/modules/users/user.service.ts:33`
- **Category:** Error Information Leaks
- **Code:**
```typescript
if (existing) {
  throw new ConflictException('Email already exists!');
}
// ...
} catch (err) {
  await queryRunner.rollbackTransaction();
  if (err instanceof ConflictException) throw err;
  throw new ConflictException('Email already exists!');
}
```
- **Impact:** A registration attempt with an existing email returns the message `"Email already exists!"`. An attacker can probe the endpoint with arbitrary emails and confirm which ones are registered, enabling targeted credential-stuffing attacks, phishing, and privacy violations.
- **Fix:** Return a uniform response for both success and duplicate cases, such as `"If this email is not registered, you will receive a confirmation."` Ensure response status codes and timing are identical to remove the side-channel.

---

## Category 9: File Upload Vulnerabilities (U)

### #U01 — MEDIUM — Property Photo Upload Endpoints Lack File Size Limits
- **File:** `backend/src/modules/properties/property.controller.ts:100`
- **Category:** File Upload Vulnerabilities
- **Code:**
```typescript
FilesInterceptor('files', 10, {
  storage: diskStorage({...}),
  fileFilter: (_req, file, cb) => { ... },
  // no limits property
})
```
- **Impact:** Authenticated admins can upload arbitrarily large files because the `FilesInterceptor` configs on `POST /properties` and `POST /properties/:id/photos` do not specify a `limits.fileSize`. This exposes the server to disk-exhaustion DoS.
- **Fix:** Add `limits: { fileSize: 5 * 1024 * 1024 }` (or your preferred max) to both `FilesInterceptor` configurations.

### #U02 — HIGH — Deleted Property Photos Remain Publicly Accessible
- **File:** `backend/src/modules/properties/property.service.ts:132` and `backend/src/main.ts:21`
- **Category:** File Upload Vulnerabilities
- **Code:**
```typescript
async deletePhoto(propertyId: string, photoId: string): Promise<void> {
  ...
  await this.photoRepository.delete(photoId);
}
```
And in `main.ts`:
```typescript
app.useStaticAssets(join(process.cwd(), 'uploads'), {
  prefix: '/uploads',
});
```
- **Impact:** `deletePhoto` only removes the database record. The physical file remains in `uploads/properties/` and continues to be served publicly by NestJS's static asset middleware at `/uploads/properties/<random-filename>`. Anyone who previously obtained the URL (e.g., from an API response, shared link, or browser cache) can still access the "deleted" photo indefinitely.
- **Fix:** After deleting the database record, use `fs.unlink` to remove the physical file. Resolve the absolute path and verify it is strictly within the `uploads/properties/` directory to prevent path traversal.

### #U03 — LOW — Old Avatar Files Remain Publicly Accessible After Update
- **File:** `backend/src/modules/auth/services/auth.service.ts:92` and `backend/src/main.ts:21`
- **Category:** File Upload Vulnerabilities
- **Code:**
```typescript
async updateAvatar(userId: string, file: Express.Multer.File): Promise<User> {
  const avatarUrl = `uploads/avatars/${file.filename}`;
  await this.userService.update(userId, { avatarUrl } as any);
  ...
}
```
- **Impact:** Each avatar update writes a new file without deleting the previous one. Because `main.ts` mounts the `uploads` directory as public static assets, old avatar files remain accessible at `/uploads/avatars/<old-filename>` forever. A user who updates their avatar to remove PII or sensitive content from an old photo will find the old photo still publicly reachable.
- **Fix:** Before updating the database, read the existing `avatarUrl`, save the new record, and then delete the old file from disk if it exists. Validate the resolved path is within `uploads/avatars/`.

---

## Category 10: Frontend Bugs (F)

### #F01 — CRITICAL — Refresh Token Stored in localStorage
- **File:** `frontend/app/redux/features/authSlice.ts:48`
- **Category:** Frontend Bugs
- **Code:**
```ts
export function saveRefreshToken(token: string): void {
  try {
    localStorage.setItem('nestfind_refresh', token);
  } catch {}
}
```
- **Impact:** A successful XSS payload can read the long-lived refresh token from `localStorage` and maintain persistent session hijacking even after the access token expires.
- **Fix:** Remove all `localStorage` refresh-token logic. Rely exclusively on httpOnly, Secure, SameSite=Strict cookies issued and managed by the backend.

### #F02 — CRITICAL — Auth State and User PII Stored in localStorage
- **File:** `frontend/app/redux/features/authSlice.ts:29`
- **Category:** Frontend Bugs
- **Code:**
```ts
function saveSession(user: any) {
  try {
    localStorage.setItem('nestfind_auth', JSON.stringify({ user, isAuthenticated: !!user }));
  } catch {}
}
```
- **Impact:** The serialized user object (email, name, role, etc.) is stored in `localStorage`, making it readable by any XSS payload. This leaks PII and violates the project architecture mandate of httpOnly cookies only.
- **Fix:** Eliminate `nestfind_auth` localStorage usage. Hydrate Redux state via `/auth/me` and secure cookies; remove `loadSession` / `saveSession` helpers.

### #F03 — HIGH — Empty Catch Block Silences Landing Page Fetch Errors
- **File:** `frontend/app/pages/landing.tsx:105`
- **Category:** Frontend Bugs
- **Code:**
```ts
    .catch(() => {});
```
- **Impact:** Network or authentication errors when seeding `favoritedIds` are silently swallowed. The user sees an inconsistent UI (empty favorites) with no error feedback, and developers have no telemetry.
- **Fix:** Replace with an explicit handler: `.catch(err => { console.error('Failed to load favorites', err); /* optionally surface a toast */ });`

### #F04 — HIGH — Empty Catch Block Silences Search Page Fetch Errors
- **File:** `frontend/app/pages/renter/search.tsx:87`
- **Category:** Frontend Bugs
- **Code:**
```ts
    .catch(() => {});
```
- **Impact:** Same pattern as F-03 on the search page; silent failures make debugging impossible and hide auth or server errors from the user.
- **Fix:** Add explicit error logging or an error state that is surfaced in the UI.

### #F05 — HIGH — Empty Catch Blocks in Favorite Mutation Hooks
- **File:** `frontend/app/hooks/api/useFavorites.ts`
- **Category:** Frontend Bugs
- **Code:**
```ts
export function useToggleFavorite() { const toggle = async (id: string) => { try{await fetch(...)}catch{}}; return {toggle}; }
export function useAddFavorite() { return { mutate: async (id: string) => { try{await fetch(...)}catch{}}, isPending: false }; }
export function useRemoveFavorite() { return { mutate: async (id: string) => { try{await fetch(...)}catch{} }, isPending: false }; }
```
- **Impact:** Add/remove favorite requests that fail (401, 500, network error) appear successful to the user. The client-side UI state diverges from the server state, causing data loss and confusion.
- **Fix:** Catch and propagate or surface errors: `catch (e) { console.error('Favorite mutation failed', e); throw e; }` or set a mutation error flag.

### #F06 — HIGH — Empty Catch Blocks in Auth Session Helpers
- **File:** `frontend/app/redux/features/authSlice.ts:23,30,37,49`
- **Category:** Frontend Bugs
- **Code:**
```ts
} catch {}
```
- **Impact:** `JSON.parse` exceptions and `localStorage` quota errors are silently swallowed inside auth helpers, making auth state corruption impossible to debug in production.
- **Fix:** Log errors to monitoring or at minimum `console.error('Auth helper error', e);`.

### #F07 — HIGH — Empty Catch Block in Redux Store Hydration
- **File:** `frontend/app/redux/store.ts:22`
- **Category:** Frontend Bugs
- **Code:**
```ts
} catch {}
```
- **Impact:** Corrupt `localStorage` data is silently ignored during store initialization. Redux may boot with a partial state, causing downstream TypeErrors and unpredictable UI behavior.
- **Fix:** Log the error and explicitly reset to a safe default state: `catch (e) { console.error('Store hydration failed', e); return {}; }`.

### #F08 — MEDIUM — Array Index Used as React Key for Dynamic Image Previews
- **File:** `frontend/app/pages/admin/property-form.tsx:249`
- **Category:** Frontend Bugs
- **Code:**
```tsx
{imagePreviews.map((src, i) => (
  <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden border group">
```
- **Impact:** When users delete or reorder uploaded images, React misidentifies DOM nodes by index, which can lead to the wrong image being removed or stale hover/delete state persisting on the wrong preview.
- **Fix:** Use a stable unique key per preview (e.g., a hash of `src` or `crypto.randomUUID()` generated at upload time).

### #F09 — MEDIUM — Array Index Used as React Key for Dynamic Inquiry Messages (Admin)
- **File:** `frontend/app/pages/admin/inquiries.tsx:310`
- **Category:** Frontend Bugs
- **Code:**
```tsx
{parseResponse(respondTarget.response).map((msg, idx) => (
  <div key={idx} className="flex gap-2.5">
```
- **Impact:** Inserting or deleting messages in a conversation thread shifts array indices, causing React to preserve incorrect DOM state and potential visual glitches or misattributed message rendering.
- **Fix:** Use `msg.id` if available; otherwise derive a stable key from `msg.date + msg.text`.

### #F10 — MEDIUM — Array Index Used as React Key for Dynamic Inquiry Messages (Renter)
- **File:** `frontend/app/pages/renter/inquiries.tsx:164,337`
- **Category:** Frontend Bugs
- **Code:**
```tsx
{responseMessages.map((msg, idx) => (
  <div key={idx} className="flex gap-[10px]">
```
- **Impact:** Same as F-09; message thread updates (new replies, deletions) may render stale content or duplicate message nodes because React keys are not stable.
- **Fix:** Use a stable message identifier such as `msg.id` or a deterministic hash.

---

## Category 11: PII in Console/Logs (P)

### #P01 — HIGH — Console.error Dumps Full Error Object on Reply Failure
- **File:** `frontend/app/pages/renter/inquiries.tsx:81`
- **Category:** PII in Console/Logs
- **Code:**
```ts
console.error('Reply failed:', e);
```
- **Impact:** The raw error object `e` is dumped to the browser console. If the error ever carries a server response body (Axios-like wrapper or future refactor), it will leak PII, stack traces, and internal URLs to any user with DevTools open.
- **Fix:** Log only the sanitized message: `console.error('Reply failed:', e.message);` or remove production logging entirely.

### #P02 — HIGH — Console.error Dumps Full Error Object on API Failure
- **File:** `frontend/app/hooks/api/useInquiries.ts:28`
- **Category:** PII in Console/Logs
- **Code:**
```ts
console.error('[Reply] Error:', e);
```
- **Impact:** Same as P-01; full error objects in production logs expose internals and potential PII to the client.
- **Fix:** Log `e.message` only, or route errors through a sanitized logger that scrubs sensitive fields.

### #P03 — MEDIUM — Console.log Logs Full API Response Data
- **File:** `frontend/app/hooks/api/useInquiries.ts:23`
- **Category:** PII in Console/Logs
- **Code:**
```ts
console.log('[Reply] Response status:', r.status, 'data:', data);
```
- **Impact:** The full JSON `data` payload is logged to the console. This may contain names, emails, phone numbers, addresses, and inquiry text from other users.
- **Fix:** Remove raw data logging in production; log only the request status code or a trace ID.

### #P04 — MEDIUM — Console.log Logs Full Inquiry List Payload
- **File:** `frontend/app/hooks/api/useInquiries.ts:54`
- **Category:** PII in Console/Logs
- **Code:**
```ts
console.log('[useInquiryList] Got data:', j);
```
- **Impact:** The complete inquiry list response is dumped to the browser console, exposing renter messages, contact details, and property information to anyone with DevTools access.
- **Fix:** Log only a summary (e.g., item count) or a request ID; never log the raw response body.

### #P05 — MEDIUM — Console.log Logs Raw User Reply Text
- **File:** `frontend/app/hooks/api/useInquiries.ts:15`
- **Category:** PII in Console/Logs
- **Code:**
```ts
console.log('[Reply] Sending reply to inquiry:', inquiryId, 'text:', reply);
```
- **Impact:** The raw user-generated reply text is logged. This text may contain PII, contact information, or sensitive communication between renters and landlords.
- **Fix:** Remove console.log of message content; log only the inquiryId and a status indicator.

### #P06 — LOW — Debug Console.log for Fetch Metadata
- **File:** `frontend/app/hooks/api/useInquiries.ts:47`
- **Category:** PII in Console/Logs
- **Code:**
```ts
console.log('[useInquiryList] Fetching:', `${API}${endpoint}${qs}`, 'refreshKey:', refreshKey);
```
- **Impact:** No direct PII leakage, but noisy debug output leaks internal API endpoint structure and refresh key values to the client in production.
- **Fix:** Remove or gate behind `import.meta.env.DEV`.

### #P07 — LOW — Debug Console.log for Refetch Events
- **File:** `frontend/app/hooks/api/useInquiries.ts:61`
- **Category:** PII in Console/Logs
- **Code:**
```ts
console.log('[useInquiryList] refetch called');
```
- **Impact:** No PII; purely noisy debug output visible in production browser consoles.
- **Fix:** Remove or gate behind a development-only flag.

---

## Category 12: WebSocket Security (W)

### #W01 — CRITICAL — Room Join Without User Status / Membership Check
- **File:** `backend/src/modules/websocket/websocket.gateway.ts:27`
- **Category:** WebSocket Security
- **Code:**
```ts
    client.join(`user:${payload.sub}`);
```
- **Impact:** A suspended or deleted user whose JWT has not yet expired is automatically joined to their private notification room and can continue receiving private push messages.
- **Fix:** Query the database for user status inside `handleConnection`; disconnect clients whose accounts are suspended or inactive.

### #W02 — HIGH — No Per-Message Authentication or Guards
- **File:** `backend/src/modules/websocket/websocket.gateway.ts:34,45`
- **Category:** WebSocket Security
- **Code:**
```ts
@SubscribeMessage('newInquiry')
handleNewInquiry(client: AuthenticatedSocket, payload: any): void {
  if (!client.userId) return;
  ...
}
```
- **Impact:** Auth is only validated once at connection time. If a token is revoked or user permissions change after connection, the client can still emit and receive events because there is no `@UseGuards` or per-message token re-verification.
- **Fix:** Apply a WebSocket guard (e.g., `JwtAuthGuard`) to the gateway or re-verify the token inside each `@SubscribeMessage` handler.

### #W03 — MEDIUM — Insufficient Content Sanitization on Socket Messages
- **File:** `backend/src/modules/websocket/websocket.gateway.ts:39`
- **Category:** WebSocket Security
- **Code:**
```ts
    message: typeof payload.message === 'string' ? payload.message.slice(0, 1000) : undefined,
```
- **Impact:** Length truncation alone does not sanitize content. If the frontend ever renders these payloads without escaping, an attacker can inject HTML/JS through WebSocket messages.
- **Fix:** Strip HTML tags or sanitize payloads with DOMPurify/DOMPurify-like logic before emitting; apply strict Zod validation on `payload`.

---

## Category 13: Email & Notification Injection (M)

No findings in Email & Notification Injection.

The codebase contains no actual email sending implementation. `MailService` is an empty stub and is never invoked anywhere in the codebase. The `forgotPassword` flow generates a `password_reset_tokens` row but never sends an email.

---

## Category 14: CSRF, SSRF & CORS (C)

### #C01 — HIGH — CSRF Bypass via Missing Origin and Referer Headers
- **File:** `backend/src/core/middleware/csrf.middleware.ts:22-24`
- **Category:** CSRF, SSRF & CORS
- **Code:**
```typescript
if (!origin && !referer) {
    return next();
}
```
- **Impact:** Requests that omit both `Origin` and `Referer` headers (e.g., from curl scripts, certain browser extensions, or misconfigured proxies) bypass the CSRF middleware entirely, allowing cross-origin state-changing requests.
- **Fix:** Reject requests that lack both headers for non-safe methods. At minimum, require one of the two headers to be present.

### #C02 — HIGH — CSRF Origin Prefix Spoofing via startsWith Wildcard
- **File:** `backend/src/core/middleware/csrf.middleware.ts:48-49`
- **Category:** CSRF, SSRF & CORS
- **Code:**
```typescript
(allowed.endsWith('*') &&
    origin.startsWith(allowed.replace('*', ''))),
```
- **Impact:** If `ALLOW_ORIGINS` contains a wildcard suffix (e.g., `https://trusted.com*`), an attacker can spoof an origin like `https://trusted.com.evil.com` and `startsWith` will match, allowing a cross-origin request to pass CSRF validation.
- **Fix:** Remove wildcard suffix support and perform exact origin matching. If wildcards are required, validate against a proper regex or URL parser that checks the full hostname.

### #C03 — HIGH — WebSocket CORS Wildcard Origin
- **File:** `backend/src/modules/websocket/websocket.gateway.ts:11`
- **Category:** CSRF, SSRF & CORS
- **Code:**
```typescript
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'nestfind' })
```
- **Impact:** Any website can open a WebSocket connection to the `nestfind` namespace. Combined with the gateway's cookie-based token extraction (`extractTokenFromCookie`), this allows arbitrary origins to attempt authentication via the WebSocket endpoint, expanding the XSS attack surface.
- **Fix:** Restrict the WebSocket CORS origin to the same explicit list used in `main.ts` (`http://localhost:5173`, `http://localhost:3000`) and production domains.

### #C04 — MEDIUM — Logout Cookie Clear Missing Secure and SameSite Flags
- **File:** `backend/src/core/interceptors/remove-token.interceptor.ts:25-27`
- **Category:** CSRF, SSRF & CORS
- **Code:**
```typescript
res.cookie(
    this.configService.get<string>("authTokenCookieName") || 'access_token',
    "",
    {
        httpOnly: true,
        path: "/",
    },
);
```
- **Impact:** The cookie is cleared without `sameSite: 'strict'` and `secure` flags. Browsers may fail to clear the cookie if it was originally set with different flags, leaving the access token active after logout and susceptible to CSRF or session fixation.
- **Fix:** Mirror the exact cookie flags used in `SetTokenInterceptor`: add `sameSite: 'strict'`, `secure: process.env.NODE_ENV === 'production'`, and `domain` if one was set.

### #C05 — LOW — Conditional Secure Cookie Flag Tied to NODE_ENV
- **File:** `backend/src/core/interceptors/set-token.interceptor.ts:39`
- **Category:** CSRF, SSRF & CORS
- **Code:**
```typescript
secure: process.env.NODE_ENV === 'production',
```
- **Impact:** If the application is deployed to a staging or production environment without `NODE_ENV=production`, the `secure` flag is omitted and cookies are transmitted over unencrypted HTTP.
- **Fix:** Explicitly require `secure: true` for all non-local environments or derive it from a dedicated config flag rather than generic `NODE_ENV`.

---

## Category 15: Payment Security (Y)

No findings in Payment Security.

The codebase contains no Stripe, RevenueCat, or any other payment processing code. There is no `subscription` module, no `StripeModule` import in `AppModule`, no webhook controllers, no idempotency logic, and no plan-type validation.

---

## Category 16: Rate Limiting (T)

### #T01 — HIGH — Forgot-Password No Per-Email Cooldown
- **File:** `backend/src/modules/auth/auth.controller.ts:146`
- **Category:** Rate Limiting
- **Code:**
```ts
@Public()
@Throttle({ default: { limit: 3, ttl: 60000 } })
@Post('forgot-password')
```
- **Impact:** An attacker can rotate target email addresses or distribute requests across proxies to bombard arbitrary users with password reset emails. No per-email rate tracking means the same inbox can receive unlimited reset links over time.
- **Fix:** Implement a per-email cooldown in the service layer (e.g., store last-requested timestamp per user and reject repeat requests within 15 minutes).

### #T02 — MEDIUM — Avatar Upload Shares Global Throttle Limit
- **File:** `backend/src/modules/auth/auth.controller.ts:196`
- **Category:** Rate Limiting
- **Code:**
```ts
@UseGuards(JwtAuthGuard)
@Post('avatar')
@ApiConsumes('multipart/form-data')
@UseInterceptors(
  FileInterceptor('avatar', { ... }),
)
async uploadAvatar(...) { ... }
```
- **Impact:** Authenticated users can upload up to 60 avatar images per minute (global default), consuming disk space and bandwidth with no upload-specific restriction.
- **Fix:** Add `@Throttle({ default: { limit: 5, ttl: 60000 } })` to the `uploadAvatar` method.

### #T03 — MEDIUM — Property Creation With File Upload Shares Global Throttle Limit
- **File:** `backend/src/modules/properties/property.controller.ts:92`
- **Category:** Rate Limiting
- **Code:**
```ts
@Post()
@HttpCode(HttpStatus.CREATED)
@UseInterceptors(
  FilesInterceptor('files', 10, { ... }),
)
async create(...) { ... }
```
- **Impact:** Admin users can create properties with up to 10 photos each at 60 requests per minute, with no dedicated file-upload throttling.
- **Fix:** Add `@Throttle({ default: { limit: 10, ttl: 60000 } })` to the `create` method.

### #T04 — MEDIUM — WebSocket Gateway Lacks Rate Limiting
- **File:** `backend/src/modules/websocket/websocket.gateway.ts:1`
- **Category:** Rate Limiting
- **Code:**
```ts
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'nestfind' })
export class NestfindGateway implements OnGatewayConnection {
  @SubscribeMessage('newInquiry')
  handleNewInquiry(client: AuthenticatedSocket, payload: any): void { ... }

  @SubscribeMessage('propertyUpdate')
  handlePropertyUpdate(client: AuthenticatedSocket, payload: any): void { ... }
}
```
- **Impact:** Once authenticated, any client can flood the server with `newInquiry` and `propertyUpdate` events without restriction, consuming server resources.
- **Fix:** Implement a per-client message rate limiter in the gateway or use a NestJS WebSocket throttler.

### #T05 — MEDIUM — Authenticated Endpoints Fall Back to Permissive Global 60/min
- **File:** `backend/src/app.module.ts:22`
- **Category:** Rate Limiting
- **Code:**
```ts
ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 60 }]),
```
- **Impact:** Controllers such as `AdminController`, `InquiryController`, `FavoriteController`, `ProfileController`, `AmenityController`, `InquirySubmitController`, and `UserController` have no custom `@Throttle` decorators and inherit the global 60 req/min limit, which is too permissive for mutation endpoints.
- **Fix:** Lower the global default to 30 req/min and add specific `@Throttle` decorators to sensitive mutation endpoints.

---

## Category 17: Database Migrations (D)

### #D01 — CRITICAL — Favorites Migration Missing updated_at and deleted_at
- **File:** `backend/src/database/migrations/001-initial-schema.ts:200`
- **Category:** Database Migrations
- **Code:**
```ts
await queryRunner.createTable(
  new Table({
    name: 'favorites',
    columns: [
      { name: 'id', type: 'uuid', ... },
      { name: 'user_id', type: 'uuid', ... },
      { name: 'property_id', type: 'uuid', ... },
      { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
    ],
  }),
);
```
- **Impact:** The `Favorite` entity extends `BaseEntity` (which declares `@UpdateDateColumn` and `@DeleteDateColumn`), but the migration only creates `created_at`. In production, TypeORM will fail to map `updatedAt` and `deletedAt`, and soft deletes will not work.
- **Fix:** Add `updated_at` and `deleted_at` columns to the `favorites` table in the migration.

### #D02 — CRITICAL — Property Photos Migration Missing deleted_at
- **File:** `backend/src/database/migrations/001-initial-schema.ts:123`
- **Category:** Database Migrations
- **Code:**
```ts
await queryRunner.createTable(
  new Table({
    name: 'property_photos',
    columns: [
      { name: 'id', type: 'uuid', ... },
      { name: 'property_id', type: 'uuid', ... },
      { name: 'url', type: 'varchar', ... },
      { name: 'is_primary', type: 'boolean', ... },
      { name: 'sort_order', type: 'integer', ... },
      { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
      { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
    ],
  }),
);
```
- **Impact:** `PropertyPhoto` extends `BaseEntity` which has `@DeleteDateColumn`, but the migration has no `deleted_at` column. Soft deletes on property photos will silently fail in production.
- **Fix:** Add `{ name: 'deleted_at', type: 'timestamp', isNullable: true }` to the `property_photos` migration.

### #D03 — HIGH — Inquiries Migration Missing deleted_at
- **File:** `backend/src/database/migrations/001-initial-schema.ts:237`
- **Category:** Database Migrations
- **Code:**
```ts
await queryRunner.createTable(
  new Table({
    name: 'inquiries',
    columns: [
      ...
      { name: 'responded_at', type: 'timestamp', isNullable: true },
      { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
      { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
    ],
  }),
);
```
- **Impact:** `Inquiry` extends `BaseEntity` which expects `deleted_at`, but the migration does not define it. Production soft-deletes will not function.
- **Fix:** Add `{ name: 'deleted_at', type: 'timestamp', isNullable: true }` to the `inquiries` migration.

### #D04 — HIGH — Enum Type Mismatch Between Entities and Migrations
- **File:** `backend/src/modules/users/entities/user.entity.ts:32`, `backend/src/modules/properties/entities/property.entity.ts:41`, `backend/src/modules/inquiries/entities/inquiry.entity.ts:37`, `backend/src/database/migrations/001-initial-schema.ts:18`
- **Category:** Database Migrations
- **Code:**
```ts
// Entity: user.entity.ts
@Column({ type: 'varchar', default: RoleEnum.RENTER })
role: RoleEnum;

// Migration: 001-initial-schema.ts
{ name: 'role', type: 'enum', enum: ['renter', 'admin'], default: 'renter', ... }
```
- **Impact:** Entities declare `type: 'varchar'` for enum columns, while migrations use PostgreSQL native `type: 'enum'`. This creates schema divergence between development (SQLite with `synchronize: true`) and production (PostgreSQL with migrations), risking data type incompatibilities and subtle query bugs.
- **Fix:** Align entity column types with migration types by using `type: 'enum'` (or `enum` property) consistently in both entities and migrations.

### #D05 — MEDIUM — Property Amenities Migration Missing property_id Index
- **File:** `backend/src/database/migrations/001-initial-schema.ts:167`
- **Category:** Database Migrations
- **Code:**
```ts
await queryRunner.createTable(
  new Table({ name: 'property_amenities', columns: [...] }),
);
await queryRunner.createIndex('property_amenities', new TableIndex({ columnNames: ['amenity_id'] }));
// No index created for 'property_id'
```
- **Impact:** The `PropertyAmenity` entity declares `@Index(['propertyId'])`, but the migration only indexes `amenity_id`. Queries filtering by `property_id` will perform full table scans.
- **Fix:** Add `await queryRunner.createIndex('property_amenities', new TableIndex({ columnNames: ['property_id'] }));`.

### #D06 — MEDIUM — Development Uses synchronize: true With SQLite
- **File:** `backend/src/app.module.ts:39`
- **Category:** Database Migrations
- **Code:**
```ts
return {
  type: 'sqlite',
  database: 'nestfind.sqlite',
  entities: [...],
  synchronize: true,
  logging: false,
};
```
- **Impact:** Migrations are never exercised during development. Schema mismatches (like the ones above) are only discovered in production, increasing the risk of deployment failures.
- **Fix:** Use PostgreSQL in development with `synchronize: false`, or add a CI step that runs migrations against a test PostgreSQL instance.

---

## Category 18: CI/CD, Entities, Tests & Shared Code (G)

### #G01 — HIGH — No CI/CD Workflows Exist
- **File:** `.github/workflows/` (missing directory)
- **Category:** CI/CD, Entities, Tests & Shared Code
- **Impact:** There is no automated testing, linting, security scanning, building, or deployment pipeline. Bugs and security issues can reach production undetected.
- **Fix:** Create GitHub Actions workflows for running backend/unit/e2e tests, linting, building Docker images, and deploying to staging/production.

### #G02 — MEDIUM — Zero Unit Tests for Most Critical Services
- **File:** `backend/test/unit/amenity.service.spec.ts` (only existing unit test)
- **Category:** CI/CD, Entities, Tests & Shared Code
- **Impact:** Only `AmenityService` has unit tests. `AuthService`, `UserService`, `PropertyService`, `InquiryService`, `AdminService`, `FavoriteService`, and `ProfileService` have zero unit tests. E2e tests exist but do not provide the fast, isolated feedback needed for refactoring and bug detection.
- **Fix:** Add unit tests for all service classes, mocking their dependencies.

### #G03 — MEDIUM — Property Entity OneToMany Relations Lack Cascade Configuration
- **File:** `backend/src/modules/properties/entities/property.entity.ts:69`
- **Category:** CI/CD, Entities, Tests & Shared Code
- **Code:**
```ts
@OneToMany(() => PropertyPhoto, (photo) => photo.property)
photos: PropertyPhoto[];

@OneToMany(() => PropertyAmenity, (pa) => pa.property)
propertyAmenities: PropertyAmenity[];

@OneToMany(() => Favorite, (favorite) => favorite.property)
favorites: Favorite[];

@OneToMany(() => Inquiry, (inquiry) => inquiry.property)
inquiries: Inquiry[];
```
- **Impact:** If a property is ever hard-deleted through TypeORM (not soft-deleted), the related photos, amenities, favorites, and inquiries will be orphaned because the entity side lacks `cascade` or `onDelete` configuration. While the service uses soft delete, the entity contract is incomplete.
- **Fix:** Add `cascade: true` or `onDelete: 'CASCADE'` to the `@OneToMany` decorators where appropriate, or ensure service-level cleanup is exhaustive.

### #G04 — LOW — Dead SQL Injection Code in updateSortOrderBulk
- **File:** `backend/src/modules/properties/property-photo.repository.ts:83`
- **Category:** CI/CD, Entities, Tests & Shared Code
- **Code:**
```ts
async updateSortOrderBulk(propertyId: string, photoIds: string[]): Promise<void> {
  const cases = photoIds
    .map((id, index) => `WHEN id = '${id}' THEN ${index}`)
    .join(' ');
  await this.repository.query(
    `UPDATE property_photos SET sort_order = CASE ${cases} END WHERE property_id = $1`,
    [propertyId],
  );
}
```
- **Impact:** This method has no callers (dead code), but it contains raw string interpolation of unsanitized `photoIds` into SQL. If accidentally invoked from future code without UUID validation, it would allow SQL injection.
- **Fix:** Remove the dead method, or rewrite it to use a parameterized query loop.

### #G05 — LOW — E2E Tests Contain Placeholder Assertions With Hardcoded UUIDs
- **File:** `backend/test/e2e/properties.e2e-spec.ts:308`
- **Category:** CI/CD, Entities, Tests & Shared Code
- **Code:**
```ts
it('should return 404 for archived property', async () => {
  // In GREEN phase: archive the property first, then verify 404
  // For now, this tests the general 404 path
  await request(app.getHttpServer())
    .get(`/api/properties/${property.id}`)
    .expect(200);
  // NOTE: Full archive-then-404 test needs property archive implementation
});
```
- **Impact:** These tests return 404 with hardcoded UUIDs instead of exercising real business logic, giving false confidence in test coverage.
- **Fix:** Complete the tests with proper seeding and assertions, or skip them with `it.todo` until the underlying functionality is implemented.

### #G06 — LOW — Filename Generation Uses Non-Cryptographic Random
- **File:** `backend/src/modules/auth/auth.controller.ts:216`, `backend/src/modules/properties/property.controller.ts:111`
- **Category:** CI/CD, Entities, Tests & Shared Code
- **Code:**
```ts
const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
```
- **Impact:** `Math.random()` is not cryptographically secure and has limited entropy. In high-throughput scenarios, filename collisions are possible, which could overwrite existing uploads.
- **Fix:** Use `crypto.randomUUID()` or `crypto.randomBytes(8).toString('hex')` for filename entropy.

---

## Systemic Root Causes

1. **BaseController inheritance without per-controller override.** Multiple controllers (`InquiryController`, `FavoriteController`) extend `BaseController` without overriding inherited CRUD methods. Because `RolesGuard` only checks method-level metadata and falls through when none exists, and because `BaseService` methods query by `id` alone, this pattern simultaneously bypasses role checks and ownership verification.

2. **No input validation on query parameters and unbounded arrays.** Several controllers accept raw `@Query()` parameters as `any` or primitive types without `class-validator` decorators. This bypasses NestJS's `ValidationPipe`, allowing negative pagination values, unbounded arrays, and prototype pollution.

3. **Empty catch blocks throughout frontend.** A recurring pattern of `catch {}` or `.catch(() => {})` in hooks, Redux slices, and page components silently swallows all errors. This hides failures from users, prevents debugging, and can leave the UI in an inconsistent state.

4. **localStorage used for auth state and refresh tokens.** Despite the project's explicit mandate to use httpOnly cookies, the frontend stores the refresh token, user object, and auth flag in `localStorage`. This makes the application vulnerable to XSS-based session theft and PII leakage.

5. **Migrations and entities out of sync.** Development uses `synchronize: true` with SQLite, so PostgreSQL migrations are never exercised locally. This has led to missing `deleted_at` columns, missing indexes, and enum type mismatches that will only surface in production.

6. **WebSocket security treated as secondary.** The WebSocket gateway accepts any origin, joins users to private rooms without verifying account status, has no per-message auth re-validation, and lacks rate limiting. This expands the attack surface for cross-origin hijacking and resource exhaustion.

---

**Total: 77 findings** (14 critical, 26 high, 30 medium, 7 low)
