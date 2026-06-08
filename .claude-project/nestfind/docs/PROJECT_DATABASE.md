# PROJECT_DATABASE

## Schema Overview

All entities extend `BaseEntity` which provides:
- `id` — UUID primary key
- `createdAt` — `timestamp` (auto-managed)
- `updatedAt` — `timestamp` (auto-managed)
- `deletedAt` — `timestamp | null` (soft delete support)

Column naming convention: `snake_case` in the database (`@CreateDateColumn({ name: 'created_at' })`).

---

## Entities

### User

Represents all registered users (Renters and Admins). Extends `BaseEntity` with soft delete.

**Table:** `users`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `uuid` | PK, default: `uuid_generate_v4()` | Inherited from BaseEntity |
| `name` | `varchar(100)` | NOT NULL | User's full name |
| `email` | `varchar(255)` | UNIQUE, NOT NULL | Login email address |
| `password` | `varchar(255)` | NOT NULL | bcrypt-hashed password |
| `phone` | `varchar(20)` | NULLABLE | Optional phone number |
| `role` | `enum` (`RoleEnum`) | NOT NULL, default: `'renter'` | `renter` \| `admin` |
| `status` | `enum` (`UserStatusEnum`) | NOT NULL, default: `'active'` | `active` \| `suspended` |
| `email_verified_at` | `timestamp` | NULLABLE | Null until email verification completes |
| `created_at` | `timestamp` | NOT NULL, default: `now()` | Inherited from BaseEntity |
| `updated_at` | `timestamp` | NOT NULL, default: `now()` | Inherited from BaseEntity |
| `deleted_at` | `timestamp` | NULLABLE | Soft delete timestamp |

**Indexes:**
- `UNIQUE` on `email`
- `INDEX` on `role`
- `INDEX` on `status`
- `INDEX` on `(role, status)` composite

**Relationships:**
- `hasMany` → `RefreshToken` (one user has many refresh tokens)
- `hasMany` → `PasswordResetToken` (one user has many reset tokens)
- `hasMany` → `Favorite` (one user has many favorites)
- `hasMany` → `Inquiry` (one user submits many inquiries)

---

### RefreshToken

Stores JWT refresh tokens for rotation and invalidation. Each refresh creates a new row; the old row is marked deleted when rotated. Not extending `BaseEntity` (no need for update timestamps or soft delete — expiries handle lifecycle).

**Table:** `refresh_tokens`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `uuid` | PK, default: `uuid_generate_v4()` | Primary key |
| `user_id` | `uuid` | FK → `users.id`, NOT NULL, ON DELETE CASCADE | Owning user |
| `token` | `varchar(500)` | NOT NULL, UNIQUE | Encoded JWT refresh token string |
| `expires_at` | `timestamp` | NOT NULL | Token expiration time (7 days from issue) |
| `revoked_at` | `timestamp` | NULLABLE | Set when token is rotated or user logs out |
| `created_at` | `timestamp` | NOT NULL, default: `now()` | Token creation time |

**Indexes:**
- `UNIQUE` on `token`
- `INDEX` on `user_id`
- `INDEX` on `expires_at`

**Relationships:**
- `belongsTo` → `User` via `user_id`

---

### PasswordResetToken

Stores tokens for the forgot-password / reset-password flow. Tokens expire after a configurable window (e.g., 1 hour).

**Table:** `password_reset_tokens`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `uuid` | PK, default: `uuid_generate_v4()` | Primary key |
| `user_id` | `uuid` | FK → `users.id`, NOT NULL, ON DELETE CASCADE | Owning user |
| `token` | `varchar(500)` | NOT NULL, UNIQUE | Secure random reset token |
| `expires_at` | `timestamp` | NOT NULL | Token expiry (e.g., 1 hour from creation) |
| `used_at` | `timestamp` | NULLABLE | Set when password is successfully reset |
| `created_at` | `timestamp` | NOT NULL, default: `now()` | Token creation time |

**Indexes:**
- `UNIQUE` on `token`
- `INDEX` on `user_id`

**Relationships:**
- `belongsTo` → `User` via `user_id`

---

### Property

Represents a rental property listing. Supports soft delete (archiving). Address fields are stored as individual columns for search/indexing; API layer nests them into an `address` object.

**Table:** `properties`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `uuid` | PK, default: `uuid_generate_v4()` | Inherited from BaseEntity |
| `title` | `varchar(200)` | NOT NULL | Listing title (5–200 chars) |
| `description` | `text` | NOT NULL | Full description (20–5000 chars) |
| `price` | `decimal(10,2)` | NOT NULL | Monthly rent (> 0) |
| `bedrooms` | `integer` | NOT NULL, CHECK (≥ 0) | Number of bedrooms |
| `bathrooms` | `integer` | NOT NULL, CHECK (≥ 0) | Number of bathrooms |
| `square_feet` | `integer` | NULLABLE, CHECK (> 0) | Living area in square feet |
| `property_type` | `enum` (`PropertyTypeEnum`) | NOT NULL | `apartment` \| `house` \| `condo` \| `townhouse` \| `studio` |
| `address_street` | `varchar(200)` | NOT NULL | Street address |
| `address_city` | `varchar(100)` | NOT NULL | City |
| `address_state` | `varchar(100)` | NOT NULL | State / province |
| `address_zip_code` | `varchar(10)` | NOT NULL | ZIP / postal code |
| `address_latitude` | `decimal(10,7)` | NULLABLE | Geocoordinate latitude (-90 to 90) |
| `address_longitude` | `decimal(10,7)` | NULLABLE | Geocoordinate longitude (-180 to 180) |
| `available_from` | `date` | NULLABLE | Date property becomes available |
| `created_at` | `timestamp` | NOT NULL, default: `now()` | Inherited from BaseEntity |
| `updated_at` | `timestamp` | NOT NULL, default: `now()` | Inherited from BaseEntity |
| `deleted_at` | `timestamp` | NULLABLE | Soft delete / archive timestamp |

**Indexes:**
- `INDEX` on `property_type`
- `INDEX` on `price`
- `INDEX` on `bedrooms`
- `INDEX` on `bathrooms`
- `INDEX` on `address_city`
- `INDEX` on `address_state`
- `INDEX` on `(address_latitude, address_longitude)` — geospatial queries
- `GIN INDEX` or `tsvector` on `title || ' ' || description || ' ' || address_city || ' ' || address_state` for full-text search (optional, for performance at scale)

**Relationships:**
- `hasMany` → `PropertyPhoto` (one property has many photos)
- `belongsToMany` → `Amenity` via `property_amenities` junction
- `hasMany` → `Favorite` (one property is favorited by many users)
- `hasMany` → `Inquiry` (one property receives many inquiries)

---

### PropertyPhoto

Stores uploaded photos for a property. Multiple photos per property with ordering and a primary photo designation.

**Table:** `property_photos`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `uuid` | PK, default: `uuid_generate_v4()` | Inherited from BaseEntity |
| `property_id` | `uuid` | FK → `properties.id`, NOT NULL, ON DELETE CASCADE | Owning property |
| `url` | `varchar(500)` | NOT NULL | Photo URL (S3 / CDN path) |
| `is_primary` | `boolean` | NOT NULL, default: `false` | Whether this is the main/thumbnail photo |
| `sort_order` | `integer` | NOT NULL, default: `0` | Display order in gallery |
| `created_at` | `timestamp` | NOT NULL, default: `now()` | Inherited from BaseEntity |
| `updated_at` | `timestamp` | NOT NULL, default: `now()` | Inherited from BaseEntity |

**Indexes:**
- `INDEX` on `property_id`
- `INDEX` on `(property_id, sort_order)`

**Business Rule:** Only one photo per property may have `is_primary = true`. Enforced at the application layer.

**Relationships:**
- `belongsTo` → `Property` via `property_id`

---

### Amenity

Predefined list of amenities that can be associated with properties. Managed by admins.

**Table:** `amenities`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `uuid` | PK, default: `uuid_generate_v4()` | Inherited from BaseEntity |
| `name` | `varchar(50)` | UNIQUE, NOT NULL | Amenity name (e.g., "parking", "gym") |
| `icon` | `varchar(50)` | NOT NULL | Icon identifier for frontend rendering |
| `created_at` | `timestamp` | NOT NULL, default: `now()` | Inherited from BaseEntity |
| `updated_at` | `timestamp` | NOT NULL, default: `now()` | Inherited from BaseEntity |
| `deleted_at` | `timestamp` | NULLABLE | Soft delete |

**Indexes:**
- `UNIQUE` on `name`

**Relationships:**
- `belongsToMany` → `Property` via `property_amenities` junction

---

### PropertyAmenity

Junction table for the many-to-many relationship between `Property` and `Amenity`. Each row links one property to one amenity.

**Table:** `property_amenities`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `property_id` | `uuid` | PK (composite), FK → `properties.id`, NOT NULL, ON DELETE CASCADE | Property reference |
| `amenity_id` | `uuid` | PK (composite), FK → `amenities.id`, NOT NULL, ON DELETE CASCADE | Amenity reference |

**Primary Key:** Composite `(property_id, amenity_id)`

**Indexes:**
- `INDEX` on `amenity_id`

**Relationships:**
- `belongsTo` → `Property` via `property_id`
- `belongsTo` → `Amenity` via `amenity_id`

---

### Favorite

Represents a renter saving a property to their favorites. Idempotent — adding a duplicate returns the existing record (API handles this). Composite unique constraint prevents duplicates.

**Table:** `favorites`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `uuid` | PK, default: `uuid_generate_v4()` | Inherited from BaseEntity |
| `user_id` | `uuid` | FK → `users.id`, NOT NULL, ON DELETE CASCADE | The renter who favorited |
| `property_id` | `uuid` | FK → `properties.id`, NOT NULL, ON DELETE CASCADE | The favorited property |
| `created_at` | `timestamp` | NOT NULL, default: `now()` | Inherited from BaseEntity |

**Indexes:**
- `UNIQUE` on `(user_id, property_id)` — prevents duplicate favorites
- `INDEX` on `user_id`
- `INDEX` on `property_id`

**Relationships:**
- `belongsTo` → `User` via `user_id`
- `belongsTo` → `Property` via `property_id`

---

### Inquiry

Represents a contact/inquiry submission from a renter about a specific property. Admins manage inquiry status and responses.

**Table:** `inquiries`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `uuid` | PK, default: `uuid_generate_v4()` | Inherited from BaseEntity |
| `property_id` | `uuid` | FK → `properties.id`, NOT NULL, ON DELETE SET NULL | Subject property |
| `user_id` | `uuid` | FK → `users.id`, NOT NULL, ON DELETE SET NULL | Submitting renter |
| `name` | `varchar(100)` | NOT NULL | Submitter's name (denormalized for display) |
| `email` | `varchar(255)` | NOT NULL | Submitter's email (denormalized) |
| `phone` | `varchar(20)` | NULLABLE | Submitter's phone (denormalized) |
| `message` | `text` | NOT NULL | Inquiry message body (10–2000 chars) |
| `status` | `enum` (`InquiryStatusEnum`) | NOT NULL, default: `'new'` | `new` \| `read` \| `responded` |
| `response` | `text` | NULLABLE | Admin's response text |
| `responded_at` | `timestamp` | NULLABLE | Set when admin responds |
| `created_at` | `timestamp` | NOT NULL, default: `now()` | Inherited from BaseEntity |
| `updated_at` | `timestamp` | NOT NULL, default: `now()` | Inherited from BaseEntity |

**Note:** `name`, `email`, `phone` are denormalized from the `User` record at submission time. This preserves the inquiry even if the user account is later deleted (hence `ON DELETE SET NULL` on `user_id`).

**Indexes:**
- `INDEX` on `property_id`
- `INDEX` on `user_id`
- `INDEX` on `status`
- `INDEX` on `(status, created_at)` — for admin dashboard filtering

**Relationships:**
- `belongsTo` → `Property` via `property_id`
- `belongsTo` → `User` via `user_id`

---

## Enums

### RoleEnum

Used in `users.role`.

| Value | Description |
|-------|-------------|
| `renter` | Standard user who browses and saves properties, submits inquiries |
| `admin` | Administrator with full system access |

---

### UserStatusEnum

Used in `users.status`.

| Value | Description |
|-------|-------------|
| `active` | Account in good standing |
| `suspended` | Account suspended by admin; cannot log in |

---

### PropertyTypeEnum

Used in `properties.property_type`.

| Value | Description |
|-------|-------------|
| `apartment` | Apartment unit |
| `house` | Single-family house |
| `condo` | Condominium |
| `townhouse` | Townhouse |
| `studio` | Studio apartment |

---

### InquiryStatusEnum

Used in `inquiries.status`.

| Value | Description |
|-------|-------------|
| `new` | Unread inquiry (default on submission) |
| `read` | Viewed by admin |
| `responded` | Admin has sent a response |

---

## Relationships

### Entity Relationship Diagram

```
users (1) ────────< (many) refresh_tokens
users (1) ────────< (many) password_reset_tokens
users (1) ────────< (many) favorites
users (1) ────────< (many) inquiries

properties (1) ───< (many) property_photos
properties (1) ───< (many) favorites
properties (1) ───< (many) inquiries
properties (many) >────< (many) amenities  [via property_amenities]
```

### Foreign Key Summary

| Child Table | FK Column | Parent Table | On Delete |
|-------------|----------|--------------|-----------|
| `refresh_tokens` | `user_id` | `users.id` | CASCADE |
| `password_reset_tokens` | `user_id` | `users.id` | CASCADE |
| `property_photos` | `property_id` | `properties.id` | CASCADE |
| `property_amenities` | `property_id` | `properties.id` | CASCADE |
| `property_amenities` | `amenity_id` | `amenities.id` | CASCADE |
| `favorites` | `user_id` | `users.id` | CASCADE |
| `favorites` | `property_id` | `properties.id` | CASCADE |
| `inquiries` | `property_id` | `properties.id` | SET NULL |
| `inquiries` | `user_id` | `users.id` | SET NULL |

### Relationship Details

| Relationship | Type | Owner | Inverse | Junction |
|-------------|------|-------|---------|----------|
| User → RefreshToken | One-to-Many | — | RefreshToken.user ↔ User.refreshTokens | — |
| User → PasswordResetToken | One-to-Many | — | PasswordResetToken.user ↔ User.resetTokens | — |
| User → Favorite | One-to-Many | — | Favorite.user ↔ User.favorites | — |
| User → Inquiry | One-to-Many | — | Inquiry.user ↔ User.inquiries | — |
| Property → PropertyPhoto | One-to-Many | — | PropertyPhoto.property ↔ Property.photos | — |
| Property → Favorite | One-to-Many | — | Favorite.property ↔ Property.favorites | — |
| Property → Inquiry | One-to-Many | — | Inquiry.property ↔ Property.inquiries | — |
| Property ↔ Amenity | Many-to-Many | Property (JoinTable) | Property.amenities ↔ Amenity.properties | `property_amenities` |

---

## Conventions

### Timestamps
- All `timestamp` columns use `default: now()` for `created_at`.
- `updated_at` is auto-managed by TypeORM (`@UpdateDateColumn`).
- `deleted_at` is managed by TypeORM soft-delete (`@DeleteDateColumn`).

### Soft Delete
- Enabled on: `users`, `properties`, `amenities`.
- NOT enabled on: `refresh_tokens` (managed via `revoked_at` + `expires_at`), `password_reset_tokens` (managed via `expires_at` + `used_at`), `favorites` (hard delete on unfavorite), `inquiries` (retained indefinitely for audit), `property_photos` (hard delete on removal), `property_amenities` (junction – hard delete on unlink).

### Naming
- **Tables**: `snake_case` plural (e.g., `property_photos`, `password_reset_tokens`)
- **Columns**: `snake_case` (e.g., `user_id`, `property_type`, `address_city`)
- **Enums**: PascalCase suffix `Enum` in TypeScript (e.g., `RoleEnum`, `PropertyTypeEnum`)

### Data Types
- Monetary values: `decimal(10,2)` (supports prices up to $99,999,999.99)
- Geo-coordinates: `decimal(10,7)` (sub-meter precision)
- Percentages/ratios: `decimal(5,2)` if needed in future

---

*Generated: 2026-05-19 | Source: PROJECT_KNOWLEDGE.md + PROJECT_API.md + database-patterns.md*
