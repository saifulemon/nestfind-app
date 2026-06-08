# Backend Implementation Report — Inquiries Module

## Module: inquiries

## Files Created

| File | Path |
|------|------|
| Repository | `backend/src/modules/inquiries/inquiry.repository.ts` |
| DTO (submit) | `backend/src/modules/inquiries/dto/submit-inquiry.dto.ts` |
| DTO (respond) | `backend/src/modules/inquiries/dto/respond-inquiry.dto.ts` |
| DTO (index) | `backend/src/modules/inquiries/dto/index.ts` |
| Submit Controller | `backend/src/modules/inquiries/inquiry-submit.controller.ts` |

## Files Modified

| File | Change |
|------|--------|
| `backend/src/modules/inquiries/inquiry.service.ts` | Rewritten — extends BaseService<Inquiry>, uses InquiryRepository, adds business logic with denormalization, filtering, search, pagination, and response mapping (user→renter alias) |
| `backend/src/modules/inquiries/inquiry.controller.ts` | Rewritten — adds @UseGuards(RolesGuard), @Roles decorators, Swagger decorators, proper response envelopes, validation for query params |
| `backend/src/modules/inquiries/inquiry.module.ts` | Updated — registers InquiryRepository, imports Property + User entities, adds InquirySubmitController |

module: inquiries

## Status Summary

| Metric | Value |
|--------|-------|
| module | inquiries |
| controllers_created | 2 |
| services_created | 1 |
| dto_files_created | 3 |
| endpoints_implemented | 7 |
| tests_targeting_module | 41 |
| tests_passing | deferred |
| self_healed_resources | 1 |

## Endpoints

| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST | `/api/properties/:propertyId/inquiries` | Renter | 201 — Submits inquiry with denormalized user data |
| GET | `/api/inquiries` | Admin | 200 — Lists all inquiries with filters (status, propertyId, search, sortBy, pagination) |
| GET | `/api/inquiries/my` | Renter | 200 — Lists authenticated renter's own inquiries (self-healed from MISSING_ENDPOINTS.yaml) |
| GET | `/api/inquiries/:id` | Admin | 200 — Detail with property and renter relations |
| PATCH | `/api/inquiries/:id/read` | Admin | 200 — Marks inquiry as read (400 if already processed) |
| POST | `/api/inquiries/:id/respond` | Admin | 200 — Responds with validation (10-5000 chars) |
| DELETE | `/api/inquiries/:id` | Admin | 200 — Soft-deletes inquiry |

## Self-Healed Endpoints (from MISSING_ENDPOINTS.yaml)

| Endpoint | Resolution |
|----------|------------|
| `GET /api/inquiries/my` | Added route in InquiryController with `@Roles('renter')`, returns only current user's inquiries with pagination and sorting. Admin gets 403. |

## Architecture Notes

- **Entity**: `Inquiry` extends `BaseEntity` with fields matching PROJECT_DATABASE.md. Soft delete enabled.
- **Repository**: `InquiryRepository` extends `BaseRepository<Inquiry>` with `findByUser()` (user's inquiries) and `findByFilters()` (admin filtering via QueryBuilder with status, propertyId, search).
- **Service**: `InquiryService` extends `BaseService<Inquiry>` with denormalization (`user.name/email/phone` → inquiry fields on submit), paginated listing, response mapping (`user` → `renter` alias in JSON output).
- **Controllers**: 
  - `InquiryController` at `@Controller('inquiries')` with `@UseGuards(RolesGuard)` — handles list, detail, mark-read, respond, delete, and my-inquiries.
  - `InquirySubmitController` at `@Controller('properties')` with `@UseGuards(RolesGuard)` — handles nested `POST /properties/:propertyId/inquiries` (renter-only submit).
- **DTOs**: `SubmitInquiryDto` validates message (10-2000 chars) with optional name/email/phone overrides. `RespondInquiryDto` validates response (10-5000 chars).
- **Response format**: Controllers return `{ success, statusCode, message, data }` envelope to prevent TransformInterceptor double-wrapping.
- **Auth**: `JwtAuthGuard` is global (main.ts). `RolesGuard` is per-controller via `@UseGuards(RolesGuard)`.
- TypeScript compilation verified with `npx tsc --noEmit` — zero errors.
