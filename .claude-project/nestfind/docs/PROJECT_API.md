# PROJECT_API

NestFind API Contract — canonical reference for all API endpoints.

**Base URL:** `http://localhost:3000/api`

---

## Endpoints

---

### Authentication

---

#### Register

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/auth/register` | Public |

**Description:** Self-service registration. Creates a new user account with the `renter` role. Returns user data and sets httpOnly cookies for access + refresh tokens.

**Request Body:**
```json
{
  "name": "string (2–100 chars, required)",
  "email": "string (valid email, required)",
  "password": "string (min 8 chars, required)",
  "phone": "string (optional, max 20 chars)"
}
```

**Success Response** `201 Created`:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "phone": "string | null",
    "role": "renter",
    "status": "active",
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  },
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/auth/register"
}
```

**Error Responses:**
- `400` — Validation failed (missing fields, invalid email, weak password)
- `409` — Email already registered

---

#### Login

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/auth/login` | Public |

**Description:** Authenticate with email and password. Sets httpOnly cookies: `access_token` (1h) and `refresh_token` (7d).

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "phone": "string | null",
      "role": "renter | admin",
      "status": "active | suspended"
    }
  },
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/auth/login"
}
```

**Error Responses:**
- `400` — Validation failed
- `401` — Invalid email or password
- `403` — Account suspended

---

#### Logout

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/auth/logout` | Authenticated |

**Description:** Revokes the current refresh token and clears auth cookies.

**Request Body:** none

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out successfully",
  "data": null,
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/auth/logout"
}
```

**Error Responses:**
- `401` — Not authenticated

---

#### Refresh Token

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/auth/refresh` | Public (requires refresh cookie) |

**Description:** Rotates the refresh token and issues a new access token. Old refresh token is revoked.

**Request Body:** none (reads `refresh_token` from httpOnly cookie)

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "role": "renter | admin"
    }
  },
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/auth/refresh"
}
```

**Error Responses:**
- `401` — Missing, expired, or revoked refresh token

---

#### Forgot Password

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/auth/forgot-password` | Public |

**Description:** Sends a password reset email with a secure reset token. Always returns 200 regardless of whether the email exists (prevents enumeration).

**Request Body:**
```json
{
  "email": "string (required)"
}
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "If an account with that email exists, a password reset link has been sent",
  "data": null,
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/auth/forgot-password"
}
```

**Error Responses:**
- `400` — Invalid email format

---

#### Reset Password

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/auth/reset-password` | Public |

**Description:** Resets the user's password using a valid reset token.

**Request Body:**
```json
{
  "token": "string (required)",
  "password": "string (min 8 chars, required)"
}
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset successfully",
  "data": null,
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/auth/reset-password"
}
```

**Error Responses:**
- `400` — Validation failed or expired token
- `404` — Invalid token

---

#### Get Current User

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/auth/me` | Authenticated |

**Description:** Returns the currently authenticated user's profile.

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "phone": "string | null",
    "role": "renter | admin",
    "status": "active | suspended",
    "emailVerifiedAt": "ISO 8601 timestamp | null",
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  },
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/auth/me"
}
```

**Error Responses:**
- `401` — Not authenticated

---

### Profile

---

#### Get Profile

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/profile` | Authenticated |

**Description:** Returns the authenticated user's profile details.

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "phone": "string | null",
    "role": "renter | admin",
    "status": "active | suspended",
    "emailVerifiedAt": "ISO 8601 timestamp | null",
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  },
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/profile"
}
```

**Error Responses:**
- `401` — Not authenticated

---

#### Update Profile

| Method | Path | Auth |
|--------|------|------|
| `PATCH` | `/profile` | Authenticated |

**Description:** Updates the authenticated user's profile fields.

**Request Body:**
```json
{
  "name": "string (2–100 chars, optional)",
  "phone": "string (max 20 chars, optional)"
}
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "phone": "string | null",
    "role": "renter | admin",
    "status": "active | suspended",
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  },
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/profile"
}
```

**Error Responses:**
- `400` — Validation failed
- `401` — Not authenticated

---

### Properties

---

#### Search Properties

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/properties` | Public |

**Description:** Search and filter rental property listings. Returns paginated results. Only returns non-archived (non-soft-deleted) properties.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `search` | string | no | Full-text search across title, description, city, state |
| `propertyType` | enum | no | Filter: `apartment`, `house`, `condo`, `townhouse`, `studio` |
| `minPrice` | number | no | Minimum monthly rent |
| `maxPrice` | number | no | Maximum monthly rent |
| `bedrooms` | number | no | Minimum number of bedrooms |
| `bathrooms` | number | no | Minimum number of bathrooms |
| `city` | string | no | Filter by city |
| `state` | string | no | Filter by state |
| `latitude` | number | no | Latitude for geolocation search |
| `longitude` | number | no | Longitude for geolocation search |
| `radius` | number | no | Search radius in miles (requires lat/lon) |
| `sortBy` | enum | no | `price_asc`, `price_desc`, `newest`, `oldest` |
| `page` | number | no | Page number (default: 1) |
| `limit` | number | no | Items per page (default: 20, max: 100) |

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Properties retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "string",
        "description": "string",
        "price": 2500.00,
        "bedrooms": 2,
        "bathrooms": 1,
        "squareFeet": 950,
        "propertyType": "apartment",
        "address": {
          "street": "string",
          "city": "string",
          "state": "string",
          "zipCode": "string",
          "latitude": 40.7127753,
          "longitude": -74.0059728
        },
        "availableFrom": "2026-06-01",
        "primaryPhoto": "string (URL) | null",
        "amenities": [
          { "id": "uuid", "name": "Parking", "icon": "parking" }
        ],
        "createdAt": "ISO 8601 timestamp"
      }
    ],
    "meta": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "totalPages": 8
    }
  },
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/properties"
}
```

**Error Responses:**
- `400` — Invalid query parameters

---

#### Get Property Detail

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/properties/:id` | Public |

**Description:** Returns full property details including all photos, amenities, and address.

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Property retrieved successfully",
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "price": 2500.00,
    "bedrooms": 2,
    "bathrooms": 1,
    "squareFeet": 950,
    "propertyType": "apartment",
    "address": {
      "street": "string",
      "city": "string",
      "state": "string",
      "zipCode": "string",
      "latitude": 40.7127753,
      "longitude": -74.0059728
    },
    "availableFrom": "2026-06-01",
    "photos": [
      {
        "id": "uuid",
        "url": "string",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "amenities": [
      { "id": "uuid", "name": "Parking", "icon": "parking" }
    ],
    "isFavorited": false,
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  },
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/properties/uuid"
}
```

**Error Responses:**
- `400` — Invalid UUID format
- `404` — Property not found or archived

---

#### Create Property

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/properties` | Admin |

**Description:** Create a new rental property listing.

**Request Body:**
```json
{
  "title": "string (5–200 chars, required)",
  "description": "string (20–5000 chars, required)",
  "price": "number (>0, required)",
  "bedrooms": "number (>=0, required)",
  "bathrooms": "number (>=0, required)",
  "squareFeet": "number (>0, optional)",
  "propertyType": "enum (apartment | house | condo | townhouse | studio, required)",
  "address": {
    "street": "string (required, max 200)",
    "city": "string (required, max 100)",
    "state": "string (required, max 100)",
    "zipCode": "string (required, max 10)",
    "latitude": "number (-90 to 90, optional)",
    "longitude": "number (-180 to 180, optional)"
  },
  "availableFrom": "date string (ISO date format, optional)",
  "amenityIds": ["uuid", "uuid"]
}
```

**Success Response** `201 Created`:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Property created successfully",
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "price": 2500.00,
    "bedrooms": 2,
    "bathrooms": 1,
    "squareFeet": 950,
    "propertyType": "apartment",
    "address": {
      "street": "string",
      "city": "string",
      "state": "string",
      "zipCode": "string",
      "latitude": 40.7127753,
      "longitude": -74.0059728
    },
    "availableFrom": "2026-06-01",
    "amenities": [
      { "id": "uuid", "name": "Parking", "icon": "parking" }
    ],
    "photos": [],
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  },
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/properties"
}
```

**Error Responses:**
- `400` — Validation failed
- `401` — Not authenticated
- `403` — Insufficient permissions (not admin)

---

#### Update Property

| Method | Path | Auth |
|--------|------|------|
| `PATCH` | `/properties/:id` | Admin |

**Description:** Update an existing property listing. Only provided fields are updated.

**Request Body (all fields optional):**
```json
{
  "title": "string (5–200 chars)",
  "description": "string (20–5000 chars)",
  "price": "number (>0)",
  "bedrooms": "number (>=0)",
  "bathrooms": "number (>=0)",
  "squareFeet": "number (>0)",
  "propertyType": "enum (apartment | house | condo | townhouse | studio)",
  "address": {
    "street": "string (max 200)",
    "city": "string (max 100)",
    "state": "string (max 100)",
    "zipCode": "string (max 10)",
    "latitude": "number (-90 to 90)",
    "longitude": "number (-180 to 180)"
  },
  "availableFrom": "date string (ISO date format)",
  "amenityIds": ["uuid", "uuid"]
}
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Property updated successfully",
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "price": 2500.00,
    "bedrooms": 2,
    "bathrooms": 1,
    "squareFeet": 950,
    "propertyType": "apartment",
    "address": {
      "street": "string",
      "city": "string",
      "state": "string",
      "zipCode": "string",
      "latitude": 40.7127753,
      "longitude": -74.0059728
    },
    "availableFrom": "2026-06-01",
    "amenities": [
      { "id": "uuid", "name": "Parking", "icon": "parking" }
    ],
    "photos": [
      {
        "id": "uuid",
        "url": "string",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  },
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/properties/uuid"
}
```

**Error Responses:**
- `400` — Validation failed or invalid UUID
- `401` — Not authenticated
- `403` — Insufficient permissions (not admin)
- `404` — Property not found

---

#### Delete (Archive) Property

| Method | Path | Auth |
|--------|------|------|
| `DELETE` | `/properties/:id` | Admin |

**Description:** Soft-deletes (archives) a property listing. The property is removed from public search results but retained in the database.

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Property archived successfully",
  "data": null,
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/properties/uuid"
}
```

**Error Responses:**
- `400` — Invalid UUID format
- `401` — Not authenticated
- `403` — Insufficient permissions (not admin)
- `404` — Property not found

---

#### Upload Property Photos

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/properties/:id/photos` | Admin |

**Description:** Upload one or more photos for a property. The first photo uploaded is automatically set as primary if no primary exists.

**Request:** `multipart/form-data`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `files` | file[] | yes | Image files (max 10 per request, accepted: jpg, jpeg, png, webp; max 5MB each) |

**Success Response** `201 Created`:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Photos uploaded successfully",
  "data": [
    {
      "id": "uuid",
      "url": "string",
      "isPrimary": true,
      "sortOrder": 0
    }
  ],
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/properties/uuid/photos"
}
```

**Error Responses:**
- `400` — Invalid file type, file too large, or no file provided
- `401` — Not authenticated
- `403` — Insufficient permissions (not admin)
- `404` — Property not found

---

#### Delete Property Photo

| Method | Path | Auth |
|--------|------|------|
| `DELETE` | `/properties/:id/photos/:photoId` | Admin |

**Description:** Delete a specific photo from a property.

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Photo deleted successfully",
  "data": null,
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/properties/uuid/photos/uuid"
}
```

**Error Responses:**
- `400` — Invalid UUID format
- `401` — Not authenticated
- `403` — Insufficient permissions (not admin)
- `404` — Property or photo not found

---

#### Set Primary Photo

| Method | Path | Auth |
|--------|------|------|
| `PATCH` | `/properties/:id/photos/:photoId/primary` | Admin |

**Description:** Set a specific photo as the primary/thumbnail photo for the property. The previous primary is unset.

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Primary photo updated successfully",
  "data": {
    "id": "uuid",
    "url": "string",
    "isPrimary": true,
    "sortOrder": 0
  },
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/properties/uuid/photos/uuid/primary"
}
```

**Error Responses:**
- `400` — Invalid UUID format
- `401` — Not authenticated
- `403` — Insufficient permissions (not admin)
- `404` — Property or photo not found

---

#### Reorder Property Photos

| Method | Path | Auth |
|--------|------|------|
| `PATCH` | `/properties/:id/photos/reorder` | Admin |

**Description:** Reorder the display order of photos for a property.

**Request Body:**
```json
{
  "photoIds": ["uuid", "uuid", "uuid"]
}
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Photo order updated successfully",
  "data": [
    {
      "id": "uuid",
      "url": "string",
      "isPrimary": true,
      "sortOrder": 0
    },
    {
      "id": "uuid",
      "url": "string",
      "isPrimary": false,
      "sortOrder": 1
    }
  ],
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/properties/uuid/photos/reorder"
}
```

**Error Responses:**
- `400` — Invalid photo IDs or missing photos in array
- `401` — Not authenticated
- `403` — Insufficient permissions (not admin)
- `404` — Property not found

---

### Favorites

---

#### List Favorites

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/favorites` | Renter |

**Description:** List all properties favorited by the authenticated renter. Returns paginated results.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | no | Page number (default: 1) |
| `limit` | number | no | Items per page (default: 20, max: 100) |

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Favorites retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid (favorite record ID)",
        "property": {
          "id": "uuid",
          "title": "string",
          "price": 2500.00,
          "bedrooms": 2,
          "bathrooms": 1,
          "propertyType": "apartment",
          "address": {
            "city": "string",
            "state": "string"
          },
          "primaryPhoto": "string (URL) | null"
        },
        "createdAt": "ISO 8601 timestamp"
      }
    ],
    "meta": {
      "total": 12,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  },
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/favorites"
}
```

**Error Responses:**
- `401` — Not authenticated

---

#### Add to Favorites

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/favorites` | Renter |

**Description:** Add a property to the authenticated renter's favorites. Idempotent — adding a duplicate returns the existing record without error.

**Request Body:**
```json
{
  "propertyId": "uuid (required)"
}
```

**Success Response** `201 Created`:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Property added to favorites",
  "data": {
    "id": "uuid",
    "propertyId": "uuid",
    "createdAt": "ISO 8601 timestamp"
  },
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/favorites"
}
```

**Error Responses:**
- `400` — Invalid property ID or validation failed
- `401` — Not authenticated
- `404` — Property not found

---

#### Remove from Favorites

| Method | Path | Auth |
|--------|------|------|
| `DELETE` | `/favorites/:propertyId` | Renter |

**Description:** Remove a property from the authenticated renter's favorites.

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Property removed from favorites",
  "data": null,
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/favorites/uuid"
}
```

**Error Responses:**
- `400` — Invalid UUID format
- `401` — Not authenticated
- `404` — Favorite not found

---

### Inquiries

---

#### Submit Inquiry

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/properties/:id/inquiries` | Renter |

**Description:** Submit an inquiry about a specific property. Name, email, and phone are denormalized from the authenticated user's profile at submission time.

**Request Body:**
```json
{
  "message": "string (10–2000 chars, required)",
  "name": "string (optional, defaults to user's name)",
  "email": "string (optional, defaults to user's email)",
  "phone": "string (optional, defaults to user's phone)"
}
```

**Success Response** `201 Created`:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Inquiry submitted successfully",
  "data": {
    "id": "uuid",
    "propertyId": "uuid",
    "name": "string",
    "email": "string",
    "phone": "string | null",
    "message": "string",
    "status": "new",
    "response": null,
    "respondedAt": null,
    "createdAt": "ISO 8601 timestamp"
  },
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/properties/uuid/inquiries"
}
```

**Error Responses:**
- `400` — Validation failed or invalid UUID
- `401` — Not authenticated
- `404` — Property not found

---

#### List All Inquiries (Admin)

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/inquiries` | Admin |

**Description:** Admin endpoint to view all inquiries with filtering and pagination.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | enum | no | Filter: `new`, `read`, `responded` |
| `propertyId` | uuid | no | Filter by property |
| `search` | string | no | Search by name or email |
| `sortBy` | enum | no | `newest` (default), `oldest` |
| `page` | number | no | Page number (default: 1) |
| `limit` | number | no | Items per page (default: 20, max: 100) |

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Inquiries retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "property": {
          "id": "uuid",
          "title": "string"
        },
        "renter": {
          "id": "uuid",
          "name": "string",
          "email": "string"
        },
        "name": "string",
        "email": "string",
        "phone": "string | null",
        "message": "string",
        "status": "new | read | responded",
        "response": "string | null",
        "respondedAt": "ISO 8601 timestamp | null",
        "createdAt": "ISO 8601 timestamp",
        "updatedAt": "ISO 8601 timestamp"
      }
    ],
    "meta": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  },
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/inquiries"
}
```

**Error Responses:**
- `401` — Not authenticated
- `403` — Insufficient permissions (not admin)

---

#### Get Inquiry Detail

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/inquiries/:id` | Admin |

**Description:** Get full details of a single inquiry.

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Inquiry retrieved successfully",
  "data": {
    "id": "uuid",
    "property": {
      "id": "uuid",
      "title": "string"
    },
    "renter": {
      "id": "uuid",
      "name": "string",
      "email": "string"
    },
    "name": "string",
    "email": "string",
    "phone": "string | null",
    "message": "string",
    "status": "new | read | responded",
    "response": "string | null",
    "respondedAt": "ISO 8601 timestamp | null",
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  },
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/inquiries/uuid"
}
```

**Error Responses:**
- `400` — Invalid UUID
- `401` — Not authenticated
- `403` — Insufficient permissions (not admin)
- `404` — Inquiry not found

---

#### Mark Inquiry as Read

| Method | Path | Auth |
|--------|------|------|
| `PATCH` | `/inquiries/:id/read` | Admin |

**Description:** Mark an inquiry as read. Only applicable to inquiries with `new` status.

**Request Body:** none

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Inquiry marked as read",
  "data": {
    "id": "uuid",
    "status": "read",
    "updatedAt": "ISO 8601 timestamp"
  },
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/inquiries/uuid/read"
}
```

**Error Responses:**
- `400` — Invalid UUID or inquiry already read/responded
- `401` — Not authenticated
- `403` — Insufficient permissions (not admin)
- `404` — Inquiry not found

---

#### Respond to Inquiry

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/inquiries/:id/respond` | Admin |

**Description:** Admin responds to an inquiry. Sets status to `responded` and records the response and timestamp.

**Request Body:**
```json
{
  "response": "string (10–5000 chars, required)"
}
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Response sent successfully",
  "data": {
    "id": "uuid",
    "status": "responded",
    "response": "string",
    "respondedAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  },
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/inquiries/uuid/respond"
}
```

**Error Responses:**
- `400` — Validation failed or invalid UUID
- `401` — Not authenticated
- `403` — Insufficient permissions (not admin)
- `404` — Inquiry not found

---

### Amenities

---

#### List Amenities

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/amenities` | Public |

**Description:** List all available amenities. Used for property creation/editing forms and property detail display.

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Amenities retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Parking",
      "icon": "parking"
    },
    {
      "id": "uuid",
      "name": "Gym",
      "icon": "gym"
    }
  ],
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/amenities"
}
```

**Error Responses:** none (always returns array, empty if no amenities exist)

---

#### Create Amenity

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/amenities` | Admin |

**Description:** Create a new amenity option.

**Request Body:**
```json
{
  "name": "string (1–50 chars, required, unique)",
  "icon": "string (1–50 chars, required)"
}
```

**Success Response** `201 Created`:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Amenity created successfully",
  "data": {
    "id": "uuid",
    "name": "Parking",
    "icon": "parking",
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  },
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/amenities"
}
```

**Error Responses:**
- `400` — Validation failed
- `401` — Not authenticated
- `403` — Insufficient permissions (not admin)
- `409` — Amenity name already exists

---

#### Update Amenity

| Method | Path | Auth |
|--------|------|------|
| `PATCH` | `/amenities/:id` | Admin |

**Description:** Update an existing amenity name or icon.

**Request Body (all fields optional):**
```json
{
  "name": "string (1–50 chars)",
  "icon": "string (1–50 chars)"
}
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Amenity updated successfully",
  "data": {
    "id": "uuid",
    "name": "Parking",
    "icon": "parking",
    "updatedAt": "ISO 8601 timestamp"
  },
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/amenities/uuid"
}
```

**Error Responses:**
- `400` — Validation failed or invalid UUID
- `401` — Not authenticated
- `403` — Insufficient permissions (not admin)
- `404` — Amenity not found
- `409` — Amenity name already exists

---

#### Delete Amenity

| Method | Path | Auth |
|--------|------|------|
| `DELETE` | `/amenities/:id` | Admin |

**Description:** Soft-delete an amenity. Properties already associated retain the amenity but it no longer appears in the amenity list for new associations.

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Amenity deleted successfully",
  "data": null,
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/amenities/uuid"
}
```

**Error Responses:**
- `400` — Invalid UUID
- `401` — Not authenticated
- `403` — Insufficient permissions (not admin)
- `404` — Amenity not found

---

### Admin Dashboard

---

#### Dashboard Statistics

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/admin/dashboard` | Admin |

**Description:** Returns aggregate statistics for the admin dashboard overview.

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Dashboard statistics retrieved",
  "data": {
    "totalProperties": 150,
    "totalInquiries": 45,
    "newInquiries": 12,
    "totalUsers": 520,
    "recentInquiries": [
      {
        "id": "uuid",
        "name": "string",
        "email": "string",
        "propertyTitle": "string",
        "status": "new",
        "createdAt": "ISO 8601 timestamp"
      }
    ],
    "recentProperties": [
      {
        "id": "uuid",
        "title": "string",
        "price": 2500.00,
        "propertyType": "apartment",
        "createdAt": "ISO 8601 timestamp"
      }
    ]
  },
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/admin/dashboard"
}
```

**Error Responses:**
- `401` — Not authenticated
- `403` — Insufficient permissions (not admin)

---

### Admin User Management

---

#### List Users

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/admin/users` | Admin |

**Description:** List all registered users with filtering and pagination.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `role` | enum | no | Filter: `renter`, `admin` |
| `status` | enum | no | Filter: `active`, `suspended` |
| `search` | string | no | Search by name or email |
| `sortBy` | enum | no | `newest` (default), `oldest`, `name_asc`, `name_desc` |
| `page` | number | no | Page number (default: 1) |
| `limit` | number | no | Items per page (default: 20, max: 100) |

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "string",
        "email": "string",
        "phone": "string | null",
        "role": "renter",
        "status": "active",
        "emailVerifiedAt": "ISO 8601 timestamp | null",
        "createdAt": "ISO 8601 timestamp"
      }
    ],
    "meta": {
      "total": 520,
      "page": 1,
      "limit": 20,
      "totalPages": 26
    }
  },
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/admin/users"
}
```

**Error Responses:**
- `401` — Not authenticated
- `403` — Insufficient permissions (not admin)

---

#### Get User Detail

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/admin/users/:id` | Admin |

**Description:** Get full details of a specific user, including activity summary.

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "phone": "string | null",
    "role": "renter | admin",
    "status": "active | suspended",
    "emailVerifiedAt": "ISO 8601 timestamp | null",
    "activity": {
      "totalFavorites": 5,
      "totalInquiries": 3,
      "lastLoginAt": "ISO 8601 timestamp | null"
    },
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  },
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/admin/users/uuid"
}
```

**Error Responses:**
- `400` — Invalid UUID
- `401` — Not authenticated
- `403` — Insufficient permissions (not admin)
- `404` — User not found

---

#### Update User Status

| Method | Path | Auth |
|--------|------|------|
| `PATCH` | `/admin/users/:id/status` | Admin |

**Description:** Suspend or reactivate a user account. Admins cannot suspend their own account.

**Request Body:**
```json
{
  "status": "enum (active | suspended, required)"
}
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User status updated to 'suspended'",
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "status": "suspended",
    "updatedAt": "ISO 8601 timestamp"
  },
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/admin/users/uuid/status"
}
```

**Error Responses:**
- `400` — Invalid status value or cannot suspend own account
- `401` — Not authenticated
- `403` — Insufficient permissions (not admin)
- `404` — User not found

---

## Standard Response Format

All API responses follow this consistent envelope structure:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Human-readable message",
  "data": { ... } | [ ... ] | null,
  "timestamp": "2026-05-19T12:00:00.000Z",
  "path": "/api/endpoint"
}
```

### Paginated Responses

List endpoints return paginated data in this shape:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "...",
  "data": {
    "items": [ ... ],
    "meta": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "totalPages": 8
    }
  },
  "timestamp": "...",
  "path": "/api/..."
}
```

### Error Responses

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "errors": [
    { "field": "email", "message": "email must be a valid email address" }
  ],
  "timestamp": "2026-05-19T12:00:00.000Z",
  "path": "/api/endpoint"
}
```

---

## Authentication

All endpoints except those marked **Public** require authentication via JWT access token stored in an httpOnly cookie (`access_token`).

- **Public endpoints** can be accessed without authentication
- **Authenticated** endpoints require a valid access token (any role)
- **Renter** endpoints require authentication + `renter` role
- **Admin** endpoints require authentication + `admin` role

Rate limiting is applied to auth endpoints: login, register, forgot-password, reset-password (default: 10 requests per 60 seconds).

---

## HTTP Status Codes Summary

| Code | Meaning |
|------|---------|
| 200 | OK — Success (read, update, delete, action) |
| 201 | Created — Resource created successfully |
| 400 | Bad Request — Validation failed, invalid input |
| 401 | Unauthorized — Missing or invalid access token |
| 403 | Forbidden — Insufficient role permissions |
| 404 | Not Found — Resource does not exist or is soft-deleted |
| 409 | Conflict — Duplicate resource (e.g., email, amenity name) |
| 413 | Payload Too Large — File upload exceeds size limit |
| 429 | Too Many Requests — Rate limit exceeded |

---

*Generated: 2026-05-19 | Source: PROJECT_KNOWLEDGE.md + PROJECT_DATABASE.md*
