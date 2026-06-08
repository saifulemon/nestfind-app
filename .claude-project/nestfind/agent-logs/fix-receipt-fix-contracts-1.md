fix_attempt: 1
node: fix-contracts
status: fixed
summary: Fixed CreatePropertyDto frontend type to use nested AddressDto matching backend DTO contract

## Changes Made

### 1. `frontend/app/types/api/property.d.ts`
- Added `AddressDto` interface with fields: `street`, `city`, `state`, `zipCode`, `latitude?`, `longitude?`
- Changed `CreatePropertyDto.address` from flat fields (`addressStreet`, `addressCity`, `addressState`, `addressZipCode`) to nested `address: AddressDto`
- API response types (`PropertyListItem`, `PropertyDetail`) remain flat — they match the backend entity

### 2. `frontend/app/pages/admin/property-form.tsx`
- Imported `AddressDto` type
- Constructs nested `address` object from form fields before creating `CreatePropertyDto`
- Form field names (`addressStreet`, `addressCity`, `addressState`, `addressZipCode`) unchanged — they read from flat API response in edit mode
- Payload now matches backend expectation: `{ address: { street, city, state, zipCode } }`

### Root Cause
Backend `CreatePropertyDto` expects `address` as nested `AddressDto` with `@ValidateNested()`. Backend service `flattenAddress()` handles conversion to flat entity columns. Frontend was sending flat fields directly, which would fail validation since the required nested `address` field was absent.
