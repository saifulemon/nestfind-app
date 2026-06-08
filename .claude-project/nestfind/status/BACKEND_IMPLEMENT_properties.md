# Backend Implementation Status: properties

module: properties
controllers_created: 1
services_created: 1
dto_files_created: 3
endpoints_implemented: 9
tests_targeting_module: 71
tests_passing: deferred       # v37+ — verify-green runs the suite, not implement
self_healed_resources: 0      # MISSING_ENDPOINTS.yaml has no properties entries

## Files Created/Modified

### New Files
- `backend/src/modules/properties/dtos/create-property.dto.ts` — CreatePropertyDto with nested AddressDto, class-validator decorators on all fields
- `backend/src/modules/properties/dtos/update-property.dto.ts` — UpdatePropertyDto with all fields optional
- `backend/src/modules/properties/dtos/reorder-photos.dto.ts` — ReorderPhotosDto with UUID array validation
- `backend/src/modules/properties/dtos/index.ts` — Barrel exports
- `backend/src/modules/properties/property-photo.repository.ts` — PropertyPhotoRepository extending BaseRepository

### Modified Files
- `backend/src/modules/properties/property.repository.ts` — Fixed price range bug, added state filter, oldest sort, ILike search on city, eager-load propertyAmenities.amenity
- `backend/src/modules/properties/property.service.ts` — Full business logic: search with transformation, getPropertyDetail (address nesting, isFavorited, amenity objects), createProperty (address flatten, amenity sync), updateProperty, archive, uploadPhotos, deletePhoto, setPrimaryPhoto, reorderPhotos
- `backend/src/modules/properties/property.controller.ts` — 9 endpoints with typed DTOs, @Public() for search/detail, @Roles('admin') for mutations and photo management, FilesInterceptor for multipart uploads
- `backend/src/modules/properties/property.module.ts` — Added PropertyPhotoRepository, TypeOrmModule.forFeature for Favorite entity

## Endpoints Implemented

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 1 | GET | /properties | Public | Search with filters, pagination, sorting |
| 2 | GET | /properties/:id | Public | Detail with photos, amenities, isFavorited |
| 3 | POST | /properties | Admin | Create property with nested address + amenityIds |
| 4 | PATCH | /properties/:id | Admin | Update property (partial) |
| 5 | DELETE | /properties/:id | Admin | Archive (soft delete) |
| 6 | POST | /properties/:id/photos | Admin | Upload photos (multipart, max 10) |
| 7 | DELETE | /properties/:id/photos/:photoId | Admin | Delete a photo |
| 8 | PATCH | /properties/:id/photos/:photoId/primary | Admin | Set primary photo |
| 9 | PATCH | /properties/:id/photos/reorder | Admin | Reorder photos by photoIds array |

## Key Implementation Details

### Address Nesting/Flattening
- Entity stores address fields as flat columns (address_street, address_city, etc.)
- API accepts/returns nested `address: { street, city, state, zipCode, latitude, longitude }`
- Service flattens on create/update, nests on read

### Search Response Shape
- Items include: id, title, description, price, bedrooms, bathrooms, squareFeet, propertyType, address, availableFrom, primaryPhoto, amenities (string[]), createdAt
- primaryPhoto derived from first isPrimary=true photo or first photo

### Detail Response Shape
- Includes all search fields plus: photos (array of {id, url, isPrimary, sortOrder}), amenities (array of {id, name, icon}), isFavorited (boolean), updatedAt

### Photo Upload
- Uses FilesInterceptor('files', 10) with multer memoryStorage
- First photo auto-set as primary if no existing photos
- Returns array of created photo records

### Compilation
- `npx tsc --noEmit` passes with zero errors
- `@types/multer` added as devDependency for Express.Multer.File types
