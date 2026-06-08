phase: integrate-contract-validation
dtos_checked: 14
forms_checked: 13
mismatches_found: 0

## Mismatches

All contracts match. No mismatches found.

## Matched Contracts

| DTO | Fields | Status |
|-----|--------|--------|
| `RegisterDto` (extends `CreateUserDto`) | `name`, `email`, `password`, `phone?` — `signup.tsx:34-38` maps `fullName→name`, sends all fields. `register.tsx:35` sends `name`, `email`, `password` (phone omitted, optional so OK). | MATCH |
| `LoginDto` | `email`, `password` — `login.tsx:27` via `LoginFormData`. `admin-login.tsx:12` sends `{email, password}`. | MATCH |
| `ForgotPasswordDto` | `email` — `forgot-password.tsx:14` sends `{email}`. | MATCH |
| `ResetPasswordDto` | `token`, `password` — `reset-password.tsx:25` sends `{token, password: data.newPassword}`. | MATCH |
| `SubmitInquiryDto` | `message`, `name?`, `email?`, `phone?` — `detail.tsx:45-52` sends all fields correctly. | MATCH |
| `RespondInquiryDto` | `response` — `admin/inquiries.tsx:27` sends `{response}`. | MATCH |
| `UpdateUserStatusDto` | `status: 'active' \| 'suspended'` — `admin/users.tsx:18` sends correct values matching `UserStatusEnum`. | MATCH |
| `CreateFavoriteDto` | `propertyId` — `search.tsx:97`, `detail.tsx:35` send `{propertyId}`. | MATCH |
| `CreateAmenityDto` | `name`, `icon` — `frontend/app/services/api/amenityService.ts:4-7` matches backend `create-amenity.dto.ts`. | MATCH |
| `UpdateAmenityDto` | `name?`, `icon?` — `frontend/app/services/api/amenityService.ts:9-12` PartialType matches backend. | MATCH |
| `ReorderPhotosDto` | `photoIds: string[]` — `frontend/app/services/api/propertyService.ts:41` sends `{photoIds}`. | MATCH |
| `CreatePropertyDto` / `UpdatePropertyDto` | `title`, `description`, `price`, `bedrooms`, `bathrooms`, `squareFeet?`, `propertyType`, `address: { street, city, state, zipCode }`, `availableFrom?`, `amenityIds?` — `property-form.tsx:57-69` builds nested `address` from controlled state. | MATCH |
| `UpdateProfileDto` (subset of `UpdateUserDto`) | `name?`, `phone?` — `profile.tsx:33-34` sends correct subset. Backend accepts `email?`, `role?`, `status?` too, but omitting them is fine (all optional). | MATCH |

## Audit Notes

- **PropertyTypeEnum values** match: frontend `PROPERTY_TYPES = ['apartment', 'house', 'condo', 'townhouse', 'studio']` (`frontend/app/types/api/property.d.ts:1`) vs backend `PropertyTypeEnum` (`backend/src/common/enums/property-type.enum.ts`).
- **UserStatusEnum values** match: frontend `'active' | 'suspended'` vs backend `UserStatusEnum.ACTIVE = 'active'`, `UserStatusEnum.SUSPENDED = 'suspended'`.
- **RoleEnum values** match: frontend `'renter' | 'admin'` vs backend `RoleEnum.RENTER = 'renter'`, `RoleEnum.ADMIN = 'admin'`.
- **InquiryStatus values** match: frontend `'new' | 'read' | 'responded'` vs backend `InquiryStatusEnum`.
- **Two registration forms** exist: `register.tsx` (minimal, 3 fields) and `signup.tsx` (full, 4 fields incl. phone). Both correctly map to `RegisterDto`.
- **Dead code**: `utils/validations/auth.ts` exports `registerSchema` and `RegisterFormData` but no form uses them — both registration forms define their own inline zod schemas.
- **search.tsx property type dropdown** omits `studio` as a property type filter option, but handles studios via the bedrooms dropdown (bedrooms=0 "Studio"). This is a UI design choice, not a contract mismatch.
- **login.tsx** has a `rememberMe` checkbox but this state is not sent to the API — it's client-only UI with no backend contract.
- **No latitude/longitude inputs** exist in `property-form.tsx` but these are optional in `AddressDto`, so no mismatch.
