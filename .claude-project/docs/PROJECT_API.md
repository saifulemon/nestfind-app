# PROJECT_API

## Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:3000/api` |
| Production | `https://api.nestfind.com/api` |

## Authentication

All authenticated endpoints use JWT via httpOnly cookies (access token: 1 hour, refresh token: 7 days).  
Public endpoints are marked with `@Public()` decorator and bypass `JwtAuthGuard`.

## General Error Responses

| Status | Body | Description |
|--------|------|-------------|
| 400 | `{ statusCode: 400, message: string, error: "Bad Request" }` | Validation failure or malformed request |
| 401 | `{ statusCode: 401, message: "Unauthorized", error: "Unauthorized" }` | Missing or expired access token |
| 403 | `{ statusCode: 403, message: "Forbidden", error: "Forbidden" }` | Insufficient role/permissions |
| 404 | `{ statusCode: 404, message: string, error: "Not Found" }` | Resource not found |
| 409 | `{ statusCode: 409, message: string, error: "Conflict" }` | Duplicate or conflicting resource |
| 429 | `{ statusCode: 429, message: "Too Many Requests", error: "Too Many Requests" }` | Rate limit exceeded |
| 500 | `{ statusCode: 500, message: "Internal Server Error", error: "Internal Server Error" }` | Unexpected server error |

---

## Endpoints

### Auth

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Register a new renter account | Public |
| POST | `/api/auth/login` | Login with email and password | Public |
| POST | `/api/auth/refresh` | Refresh access token using refresh token cookie | Public |
| POST | `/api/auth/logout` | Clear auth cookies | User |
| POST | `/api/auth/forgot-password` | Send password reset email | Public |
| POST | `/api/auth/reset-password` | Reset password with token | Public |

#### POST /api/auth/register

Register a new user with default Renter role.

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | Yes | 2–100 chars |
| email | string | Yes | Valid email, unique |
| password | string | Yes | 8–128 chars, at least 1 letter + 1 number |
| phone | string | No | Optional, 7–20 chars |

**Success Response (201):**

```json
{
  "statusCode": 201,
  "message": "Registration successful",
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "phone": "string | null",
    "role": "renter",
    "status": "active",
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:** 400 (validation), 409 (email already exists)

---

#### POST /api/auth/login

Authenticate a user and set httpOnly cookies (access_token, refresh_token).

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| email | string | Yes | Valid email |
| password | string | Yes | Non-empty |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "phone": "string | null",
      "role": "renter | admin",
      "status": "active"
    }
  }
}
```

**Cookies Set:**
- `access_token` — httpOnly, secure, sameSite strict, maxAge 3600s
- `refresh_token` — httpOnly, secure, sameSite strict, maxAge 604800s

**Error Responses:** 400 (validation), 401 (invalid credentials), 403 (account suspended)

---

#### POST /api/auth/refresh

Refresh the access token using the refresh_token cookie.

**Request Body:** None (refresh_token from cookie)

**Success Response (200):**

```json
{
  "statusCode": 200,
  "message": "Token refreshed"
}
```

**Cookies Set:**
- `access_token` — httpOnly, secure, sameSite strict, maxAge 3600s
- `refresh_token` — httpOnly, secure, sameSite strict, maxAge 604800s (rotated)

**Error Responses:** 401 (missing/invalid/expired refresh token)

---

#### POST /api/auth/logout

Clear all auth cookies.

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "message": "Logged out successfully"
}
```

**Cookies Cleared:** `access_token`, `refresh_token`

**Error Responses:** 401 (unauthorized)

---

#### POST /api/auth/forgot-password

Send a password reset link to the user's email.

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| email | string | Yes | Valid email |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "message": "If the email exists, a reset link has been sent"
}
```

**Error Responses:** 400 (validation), 429 (rate limit)

---

#### POST /api/auth/reset-password

Reset password using the token from the email link.

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| token | string | Yes | Valid reset token from email |
| password | string | Yes | 8–128 chars, at least 1 letter + 1 number |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "message": "Password reset successful"
}
```

**Error Responses:** 400 (validation, invalid/expired token)

---

### Users

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/users/me` | Get current authenticated user profile | User |
| PATCH | `/api/users/me` | Update current user profile | User |
| GET | `/api/users` | List all users (with pagination) | Admin |
| GET | `/api/users/:id` | Get a specific user | Admin |
| PATCH | `/api/users/:id` | Update user status (suspend/reactivate) | Admin |

#### GET /api/users/me

Get the profile of the currently authenticated user.

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "phone": "string | null",
    "role": "renter | admin",
    "status": "active | suspended",
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:** 401

---

#### PATCH /api/users/me

Update the current user's profile information.

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | No | 2–100 chars |
| phone | string | No | 7–20 chars |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "message": "Profile updated",
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "phone": "string | null",
    "role": "renter | admin",
    "status": "active | suspended",
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:** 400 (validation), 401

---

#### GET /api/users

List all users with pagination. Admin only.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number (≥1) |
| limit | number | 20 | Items per page (1–100) |
| role | enum | — | Filter by role: `renter` \| `admin` |
| status | enum | — | Filter by status: `active` \| `suspended` |
| search | string | — | Search by name or email |

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "string",
        "email": "string",
        "phone": "string | null",
        "role": "renter | admin",
        "status": "active | suspended",
        "createdAt": "ISO 8601 datetime"
      }
    ],
    "meta": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "totalPages": 5
    }
  }
}
```

**Error Responses:** 401, 403

---

#### GET /api/users/:id

Get a specific user by ID. Admin only.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | User ID |

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "phone": "string | null",
    "role": "renter | admin",
    "status": "active | suspended",
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime",
    "favoritesCount": 5,
    "inquiriesCount": 2
  }
}
```

**Error Responses:** 401, 403, 404

---

#### PATCH /api/users/:id

Update a user's status (suspend or reactivate). Admin only.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | User ID |

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| status | enum | Yes | `active` \| `suspended` |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "message": "User updated",
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "renter | admin",
    "status": "active | suspended",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:** 400 (validation), 401, 403, 404

---

### Properties

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/properties` | List/search properties | Public |
| GET | `/api/properties/:id` | Get property detail | Public |
| POST | `/api/properties` | Create a new property listing | Admin |
| PATCH | `/api/properties/:id` | Update an existing property | Admin |
| DELETE | `/api/properties/:id` | Soft-delete a property | Admin |
| POST | `/api/properties/:id/photos` | Upload property photos | Admin |
| DELETE | `/api/properties/:id/photos/:photoId` | Delete a property photo | Admin |

#### GET /api/properties

List and search properties with filtering and pagination.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number (≥1) |
| limit | number | 20 | Items per page (1–100) |
| search | string | — | Search by title, address, or description |
| minPrice | number | — | Minimum monthly rent |
| maxPrice | number | — | Maximum monthly rent |
| bedrooms | number | — | Exact number of bedrooms |
| minBedrooms | number | — | Minimum bedrooms |
| maxBedrooms | number | — | Maximum bedrooms |
| bathrooms | number | — | Exact number of bathrooms |
| propertyType | enum | — | `apartment` \| `house` \| `condo` \| `townhouse` \| `studio` |
| sortBy | enum | `createdAt` | `price` \| `bedrooms` \| `createdAt` |
| sortOrder | enum | `DESC` | `ASC` \| `DESC` |

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "string",
        "price": 2500.00,
        "bedrooms": 2,
        "bathrooms": 1,
        "propertyType": "apartment",
        "address": {
          "street": "123 Main St",
          "city": "San Francisco",
          "state": "CA",
          "zipCode": "94102",
          "latitude": 37.7749,
          "longitude": -122.4194
        },
        "thumbnailUrl": "string | null",
        "amenities": ["parking", "laundry"],
        "createdAt": "ISO 8601 datetime"
      }
    ],
    "meta": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

**Error Responses:** 400 (validation)

---

#### GET /api/properties/:id

Get detailed information for a specific property. Includes full photo gallery, all amenities, and detailed description. When the request includes a valid auth cookie, the response includes whether the current user has favorited this property.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Property ID |

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "title": "Modern Downtown Apartment",
    "description": "A beautiful 2-bedroom apartment in the heart of downtown with stunning city views...",
    "price": 2500.00,
    "bedrooms": 2,
    "bathrooms": 1,
    "squareFeet": 950,
    "propertyType": "apartment",
    "address": {
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94102",
      "latitude": 37.7749,
      "longitude": -122.4194
    },
    "amenities": [
      { "id": "uuid", "name": "parking", "icon": "parking" },
      { "id": "uuid", "name": "laundry", "icon": "laundry" },
      { "id": "uuid", "name": "gym", "icon": "gym" }
    ],
    "photos": [
      { "id": "uuid", "url": "string", "isPrimary": true },
      { "id": "uuid", "url": "string", "isPrimary": false }
    ],
    "isFavorited": false,
    "availableFrom": "2025-06-01",
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:** 404

---

#### POST /api/properties

Create a new property listing. Admin only.

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| title | string | Yes | 5–200 chars |
| description | string | Yes | 20–5000 chars |
| price | number | Yes | > 0 |
| bedrooms | number | Yes | ≥ 0, integer |
| bathrooms | number | Yes | ≥ 0, integer |
| squareFeet | number | No | > 0 |
| propertyType | enum | Yes | `apartment` \| `house` \| `condo` \| `townhouse` \| `studio` |
| availableFrom | date | No | ISO 8601 date |
| address | object | Yes | Nested address object |
| address.street | string | Yes | 5–200 chars |
| address.city | string | Yes | 2–100 chars |
| address.state | string | Yes | 2–100 chars |
| address.zipCode | string | Yes | 5–10 chars |
| address.latitude | number | No | -90 to 90 |
| address.longitude | number | No | -180 to 180 |
| amenityIds | UUID[] | No | Array of amenity IDs |

**Success Response (201):**

```json
{
  "statusCode": 201,
  "message": "Property created",
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "price": 2500.00,
    "bedrooms": 2,
    "bathrooms": 1,
    "squareFeet": 950,
    "propertyType": "apartment",
    "address": { "street": "string", "city": "string", "state": "string", "zipCode": "string", "latitude": 37.77, "longitude": -122.41 },
    "amenities": [{ "id": "uuid", "name": "string" }],
    "photos": [],
    "availableFrom": "2025-06-01",
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:** 400 (validation), 401, 403

---

#### PATCH /api/properties/:id

Update an existing property. Admin only. All fields are optional — only send fields that need updating.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Property ID |

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| title | string | No | 5–200 chars |
| description | string | No | 20–5000 chars |
| price | number | No | > 0 |
| bedrooms | number | No | ≥ 0, integer |
| bathrooms | number | No | ≥ 0, integer |
| squareFeet | number | No | > 0 |
| propertyType | enum | No | `apartment` \| `house` \| `condo` \| `townhouse` \| `studio` |
| availableFrom | date | No | ISO 8601 date |
| address | object | No | Nested address — partial allowed |
| amenityIds | UUID[] | No | Full replacement array of amenity IDs |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "message": "Property updated",
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "price": 2500.00,
    "bedrooms": 2,
    "bathrooms": 1,
    "squareFeet": 950,
    "propertyType": "apartment",
    "address": { "street": "string", "city": "string", "state": "string", "zipCode": "string", "latitude": 37.77, "longitude": -122.41 },
    "amenities": [{ "id": "uuid", "name": "string" }],
    "photos": [{ "id": "uuid", "url": "string", "isPrimary": true }],
    "availableFrom": "2025-06-01",
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:** 400 (validation), 401, 403, 404

---

#### DELETE /api/properties/:id

Soft-delete a property listing. Admin only.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Property ID |

**Request Body:** None

**Success Response (204):** No body

**Error Responses:** 401, 403, 404

---

#### POST /api/properties/:id/photos

Upload one or more property photos. Admin only. Multipart form-data.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Property ID |

**Request Body (multipart/form-data):**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| photos | File[] | Yes | Images only (jpg, jpeg, png, webp), max 5MB each, max 10 files |

**Success Response (201):**

```json
{
  "statusCode": 201,
  "message": "Photos uploaded",
  "data": {
    "photos": [
      { "id": "uuid", "url": "string", "isPrimary": false },
      { "id": "uuid", "url": "string", "isPrimary": false }
    ]
  }
}
```

**Error Responses:** 400 (invalid file type/size), 401, 403, 404

---

#### DELETE /api/properties/:id/photos/:photoId

Delete a specific photo from a property. Admin only.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Property ID |
| photoId | UUID | Photo ID |

**Request Body:** None

**Success Response (204):** No body

**Error Responses:** 401, 403, 404

---

### Favorites

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/favorites` | List current user's favorite properties | User |
| POST | `/api/favorites/:propertyId` | Add property to favorites | User |
| DELETE | `/api/favorites/:propertyId` | Remove property from favorites | User |

#### GET /api/favorites

List all favorited properties for the current user.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number (≥1) |
| limit | number | 20 | Items per page (1–100) |

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "string",
        "price": 2500.00,
        "bedrooms": 2,
        "bathrooms": 1,
        "propertyType": "apartment",
        "address": {
          "city": "San Francisco",
          "state": "CA"
        },
        "thumbnailUrl": "string | null",
        "favoritedAt": "ISO 8601 datetime"
      }
    ],
    "meta": {
      "total": 8,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

**Error Responses:** 401

---

#### POST /api/favorites/:propertyId

Add a property to the current user's favorites. Idempotent — if already favorited, returns 200 with existing record.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| propertyId | UUID | Property ID |

**Request Body:** None

**Success Response (201):**

```json
{
  "statusCode": 201,
  "message": "Property added to favorites",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "propertyId": "uuid",
    "createdAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:** 400 (validation), 401, 404 (property not found)

---

#### DELETE /api/favorites/:propertyId

Remove a property from favorites.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| propertyId | UUID | Property ID |

**Request Body:** None

**Success Response (204):** No body

**Error Responses:** 401, 404 (not in favorites)

---

### Inquiries

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/inquiries` | Submit an inquiry for a property | User |
| GET | `/api/inquiries` | List all inquiries (with filters) | Admin |
| GET | `/api/inquiries/:id` | Get inquiry detail | Admin |
| PATCH | `/api/inquiries/:id/status` | Update inquiry status | Admin |
| POST | `/api/inquiries/:id/respond` | Respond to an inquiry | Admin |

#### POST /api/inquiries

Submit an inquiry for a specific property. Renter must be authenticated.

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| propertyId | UUID | Yes | Valid property ID |
| name | string | Yes | 2–100 chars |
| email | string | Yes | Valid email |
| phone | string | No | 7–20 chars |
| message | string | Yes | 10–2000 chars |

**Success Response (201):**

```json
{
  "statusCode": 201,
  "message": "Inquiry submitted successfully",
  "data": {
    "id": "uuid",
    "propertyId": "uuid",
    "userId": "uuid",
    "name": "string",
    "email": "string",
    "phone": "string | null",
    "message": "string",
    "status": "new",
    "createdAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:** 400 (validation), 401, 404 (property not found)

---

#### GET /api/inquiries

List all inquiries with filters and pagination. Admin only.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number (≥1) |
| limit | number | 20 | Items per page (1–100) |
| status | enum | — | Filter by: `new` \| `read` \| `responded` |
| propertyId | UUID | — | Filter by property |

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "uuid",
        "property": {
          "id": "uuid",
          "title": "string"
        },
        "user": {
          "id": "uuid",
          "name": "string",
          "email": "string"
        },
        "name": "string",
        "email": "string",
        "phone": "string | null",
        "message": "string",
        "status": "new | read | responded",
        "createdAt": "ISO 8601 datetime"
      }
    ],
    "meta": {
      "total": 25,
      "page": 1,
      "limit": 20,
      "totalPages": 2
    }
  }
}
```

**Error Responses:** 401, 403

---

#### GET /api/inquiries/:id

Get detailed information for a specific inquiry. Admin only.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Inquiry ID |

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "property": {
      "id": "uuid",
      "title": "string",
      "price": 2500.00
    },
    "user": {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "phone": "string | null"
    },
    "name": "string",
    "email": "string",
    "phone": "string | null",
    "message": "string",
    "status": "new | read | responded",
    "response": "string | null",
    "respondedAt": "ISO 8601 datetime | null",
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:** 401, 403, 404

---

#### PATCH /api/inquiries/:id/status

Update the status of an inquiry. Admin only.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Inquiry ID |

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| status | enum | Yes | `new` \| `read` \| `responded` |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "message": "Inquiry status updated",
  "data": {
    "id": "uuid",
    "status": "read",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:** 400 (validation), 401, 403, 404

---

#### POST /api/inquiries/:id/respond

Respond to an inquiry. Marks the inquiry as `responded`. Admin only.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Inquiry ID |

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| response | string | Yes | 10–5000 chars |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "message": "Response sent",
  "data": {
    "id": "uuid",
    "status": "responded",
    "response": "string",
    "respondedAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:** 400 (validation), 401, 403, 404

---

### Admin Dashboard

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/admin/dashboard/stats` | Get overview statistics | Admin |

#### GET /api/admin/dashboard/stats

Get overview statistics for the admin dashboard.

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": {
    "totalProperties": 120,
    "totalInquiries": 45,
    "newInquiries": 12,
    "totalUsers": 350,
    "recentProperties": [
      {
        "id": "uuid",
        "title": "string",
        "price": 2500.00,
        "createdAt": "ISO 8601 datetime"
      }
    ],
    "recentInquiries": [
      {
        "id": "uuid",
        "propertyTitle": "string",
        "name": "string",
        "status": "new",
        "createdAt": "ISO 8601 datetime"
      }
    ]
  }
}
```

**Error Responses:** 401, 403

---

### Amenities (Admin)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/amenities` | List all amenities | Public |
| POST | `/api/amenities` | Create a new amenity | Admin |

#### GET /api/amenities

List all available amenities. Public (used for property search filters and creation forms).

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": [
    { "id": "uuid", "name": "parking" },
    { "id": "uuid", "name": "laundry" },
    { "id": "uuid", "name": "gym" },
    { "id": "uuid", "name": "pool" },
    { "id": "uuid", "name": "air-conditioning" }
  ]
}
```

**Error Responses:** None (public)

---

#### POST /api/amenities

Create a new amenity. Admin only.

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | Yes | 2–50 chars, unique |

**Success Response (201):**

```json
{
  "statusCode": 201,
  "message": "Amenity created",
  "data": {
    "id": "uuid",
    "name": "string"
  }
}
```

**Error Responses:** 400 (validation), 401, 403, 409 (duplicate name)

### Property Views

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/property-views/:propertyId` | Track a property view | User |
| GET | `/api/property-views/recent` | Get recently viewed properties | User |

#### POST /api/property-views/:propertyId

Track that the current user viewed a property. Upserts the view record and updates `lastViewedAt`.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| propertyId | UUID | Property ID |

**Request Body:** None

**Success Response (201):**

```json
{
  "statusCode": 201,
  "message": "View recorded",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "propertyId": "uuid",
    "viewCount": 3,
    "lastViewedAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:** 401, 404

---

#### GET /api/property-views/recent

Get the current user's recently viewed properties (last 6).

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "propertyId": "uuid",
      "property": {
        "id": "uuid",
        "title": "string",
        "price": 2500.00,
        "addressCity": "string",
        "addressState": "string",
        "primaryPhoto": "string | null"
      },
      "lastViewedAt": "ISO 8601 datetime"
    }
  ]
}
```

**Error Responses:** 401

---

### Recommendations

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/recommendations` | Get personalized property recommendations | User |

#### GET /api/recommendations

Get personalized property recommendations for the current user based on behavior.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 10 | Maximum recommendations to return |

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "price": 2500.00,
      "bedrooms": 2,
      "bathrooms": 1,
      "propertyType": "apartment",
      "addressCity": "string",
      "addressState": "string",
      "primaryPhoto": "string | null",
      "recommendationScore": 85,
      "matchReasons": ["Matches your price range", "Similar to favorites"]
    }
  ]
}
```

**Error Responses:** 401

---

### Saved Searches

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/saved-searches` | Save a new search | User |
| GET | `/api/saved-searches` | List saved searches | User |
| DELETE | `/api/saved-searches/:id` | Delete a saved search | User |

#### POST /api/saved-searches

Save current search filters with a custom name.

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | Yes | 1–100 chars |
| filters | object | Yes | Search filter object |
| filters.minPrice | number | No | ≥ 0 |
| filters.maxPrice | number | No | ≥ 0 |
| filters.bedrooms | number | No | ≥ 0 |
| filters.bathrooms | number | No | ≥ 0 |
| filters.propertyType | enum | No | `apartment` \| `house` \| `condo` \| `townhouse` \| `studio` |
| filters.city | string | No | — |
| filters.state | string | No | — |

**Success Response (201):**

```json
{
  "statusCode": 201,
  "message": "Search saved",
  "data": {
    "id": "uuid",
    "name": "string",
    "filters": {},
    "createdAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:** 400 (validation), 401

---

#### GET /api/saved-searches

List all saved searches for the current user.

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "filters": {},
      "createdAt": "ISO 8601 datetime"
    }
  ]
}
```

**Error Responses:** 401

---

#### DELETE /api/saved-searches/:id

Delete a saved search.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Saved search ID |

**Request Body:** None

**Success Response (204):** No body

**Error Responses:** 401, 404

---

### Map Search

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/map-search` | Search properties within map viewport | Public |

#### GET /api/map-search

Search properties that fall within a geographic bounding box.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| minLat | number | Yes | Minimum latitude |
| maxLat | number | Yes | Maximum latitude |
| minLng | number | Yes | Minimum longitude |
| maxLng | number | Yes | Maximum longitude |

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "price": 2500.00,
      "bedrooms": 2,
      "bathrooms": 1,
      "propertyType": "apartment",
      "addressLatitude": 37.7749,
      "addressLongitude": -122.4194,
      "addressCity": "string",
      "addressState": "string",
      "primaryPhoto": "string | null"
    }
  ]
}
```

**Error Responses:** 400 (validation)

---

### Reviews

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/reviews` | Submit a property review | User |
| GET | `/api/reviews/property/:propertyId` | Get reviews for a property | Public |
| GET | `/api/reviews/pending` | List pending reviews (admin) | Admin |
| PATCH | `/api/reviews/:id/moderate` | Moderate a review (admin) | Admin |

#### POST /api/reviews

Submit a review for a property. Created with `pending` status until admin moderation.

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| propertyId | UUID | Yes | Valid property ID |
| rating | number | Yes | 1–5 |
| comment | string | No | 10–2000 chars |

**Success Response (201):**

```json
{
  "statusCode": 201,
  "message": "Review submitted",
  "data": {
    "id": "uuid",
    "propertyId": "uuid",
    "userId": "uuid",
    "rating": 4,
    "comment": "string",
    "status": "pending",
    "createdAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:** 400 (validation), 401, 404

---

#### GET /api/reviews/property/:propertyId

Get all approved reviews for a property.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| propertyId | UUID | Property ID |

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": {
    "averageRating": 4.2,
    "totalReviews": 15,
    "reviews": [
      {
        "id": "uuid",
        "userId": "uuid",
        "userName": "string",
        "rating": 4,
        "comment": "string",
        "createdAt": "ISO 8601 datetime"
      }
    ]
  }
}
```

**Error Responses:** 404

---

#### GET /api/reviews/pending

List all pending reviews awaiting moderation. Admin only.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "uuid",
        "propertyId": "uuid",
        "propertyTitle": "string",
        "userId": "uuid",
        "userName": "string",
        "rating": 4,
        "comment": "string",
        "createdAt": "ISO 8601 datetime"
      }
    ],
    "meta": { "total": 10, "page": 1, "limit": 20, "totalPages": 1 }
  }
}
```

**Error Responses:** 401, 403

---

#### PATCH /api/reviews/:id/moderate

Approve or reject a pending review. Admin only.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Review ID |

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| status | enum | Yes | `approved` \| `rejected` |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "message": "Review updated",
  "data": {
    "id": "uuid",
    "status": "approved",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:** 400 (validation), 401, 403, 404

---

### Notifications

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/notifications` | List notifications | User |
| PATCH | `/api/notifications/:id/read` | Mark notification as read | User |
| PATCH | `/api/notifications/read-all` | Mark all notifications as read | User |

#### GET /api/notifications

List notifications for the current user, newest first.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "uuid",
        "type": "new_message",
        "title": "string",
        "message": "string",
        "data": {},
        "isRead": false,
        "createdAt": "ISO 8601 datetime"
      }
    ],
    "meta": { "total": 10, "page": 1, "limit": 20, "totalPages": 1 }
  }
}
```

**Error Responses:** 401

---

#### PATCH /api/notifications/:id/read

Mark a single notification as read.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Notification ID |

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "message": "Notification marked as read",
  "data": {
    "id": "uuid",
    "isRead": true
  }
}
```

**Error Responses:** 401, 404

---

#### PATCH /api/notifications/read-all

Mark all unread notifications as read.

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "message": "All notifications marked as read"
}
```

**Error Responses:** 401

---

### Tours

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/tours/slots/:propertyId` | Get available tour slots | Public |
| POST | `/api/tours/bookings` | Book a tour | User |
| GET | `/api/tours/my-bookings` | Get my tour bookings | User |
| PATCH | `/api/tours/bookings/:id/cancel` | Cancel a tour booking | User |
| GET | `/api/tours/bookings` | List all bookings (admin) | Admin |
| PATCH | `/api/tours/bookings/:id/status` | Update booking status (admin) | Admin |

#### GET /api/tours/slots/:propertyId

Get available tour time slots for a property.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| propertyId | UUID | Property ID |

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "propertyId": "uuid",
      "startTime": "ISO 8601 datetime",
      "endTime": "ISO 8601 datetime",
      "maxAttendees": 5,
      "bookedCount": 2
    }
  ]
}
```

**Error Responses:** 404

---

#### POST /api/tours/bookings

Book a tour slot.

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| slotId | UUID | Yes | Valid slot ID |
| notes | string | No | Max 500 chars |

**Success Response (201):**

```json
{
  "statusCode": 201,
  "message": "Tour booked",
  "data": {
    "id": "uuid",
    "slotId": "uuid",
    "userId": "uuid",
    "status": "pending",
    "notes": "string",
    "createdAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:** 400 (validation), 401, 404, 409 (slot full)

---

#### GET /api/tours/my-bookings

Get the current user's tour bookings.

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "slotId": "uuid",
      "propertyId": "uuid",
      "propertyTitle": "string",
      "startTime": "ISO 8601 datetime",
      "endTime": "ISO 8601 datetime",
      "status": "pending",
      "notes": "string",
      "createdAt": "ISO 8601 datetime"
    }
  ]
}
```

**Error Responses:** 401

---

#### PATCH /api/tours/bookings/:id/cancel

Cancel a tour booking.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Booking ID |

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "message": "Booking cancelled",
  "data": {
    "id": "uuid",
    "status": "cancelled"
  }
}
```

**Error Responses:** 401, 404

---

#### GET /api/tours/bookings

List all tour bookings. Admin only.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| status | enum | — | `pending` \| `confirmed` \| `cancelled` \| `completed` |
| propertyId | UUID | — | Filter by property |

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "uuid",
        "slotId": "uuid",
        "userId": "uuid",
        "userName": "string",
        "propertyId": "uuid",
        "propertyTitle": "string",
        "startTime": "ISO 8601 datetime",
        "endTime": "ISO 8601 datetime",
        "status": "pending",
        "notes": "string",
        "createdAt": "ISO 8601 datetime"
      }
    ],
    "meta": { "total": 10, "page": 1, "limit": 20, "totalPages": 1 }
  }
}
```

**Error Responses:** 401, 403

---

#### PATCH /api/tours/bookings/:id/status

Update the status of a tour booking. Admin only.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Booking ID |

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| status | enum | Yes | `confirmed` \| `cancelled` \| `completed` |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "message": "Booking status updated",
  "data": {
    "id": "uuid",
    "status": "confirmed",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:** 400 (validation), 401, 403, 404

---

### Chat

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/chat/conversations` | List conversations | User |
| GET | `/api/chat/conversations/:id/messages` | Get messages in a conversation | User |
| POST | `/api/chat/conversations/:id/messages` | Send a message | User |

#### GET /api/chat/conversations

List all conversations for the current user.

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "propertyId": "uuid",
      "propertyTitle": "string",
      "otherUserId": "uuid",
      "otherUserName": "string",
      "lastMessage": "string",
      "lastMessageAt": "ISO 8601 datetime",
      "unreadCount": 3
    }
  ]
}
```

**Error Responses:** 401

---

#### GET /api/chat/conversations/:id/messages

Get messages in a conversation.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Conversation ID |

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "conversationId": "uuid",
      "senderId": "uuid",
      "senderName": "string",
      "content": "string",
      "createdAt": "ISO 8601 datetime"
    }
  ]
}
```

**Error Responses:** 401, 403, 404

---

#### POST /api/chat/conversations/:id/messages

Send a message in a conversation.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Conversation ID |

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| content | string | Yes | 1–2000 chars |

**Success Response (201):**

```json
{
  "statusCode": 201,
  "message": "Message sent",
  "data": {
    "id": "uuid",
    "conversationId": "uuid",
    "senderId": "uuid",
    "content": "string",
    "createdAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:** 400 (validation), 401, 403, 404

---

### Applications

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/applications` | Submit a rental application | User |
| GET | `/api/applications/my` | Get my applications | User |
| GET | `/api/applications` | List all applications (admin) | Admin |
| GET | `/api/applications/:id` | Get application detail | User/Admin |
| PATCH | `/api/applications/:id/status` | Update application status (admin) | Admin |

#### POST /api/applications

Submit a rental application for a property.

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| propertyId | UUID | Yes | Valid property ID |
| moveInDate | date | Yes | ISO 8601 date |
| monthlyIncome | number | Yes | ≥ 0 |
| employmentStatus | string | Yes | `employed` \| `self_employed` \| `unemployed` \| `student` \| `retired` |
| employerName | string | No | — |
| documents | string[] | No | Array of document URLs |
| notes | string | No | Max 2000 chars |

**Success Response (201):**

```json
{
  "statusCode": 201,
  "message": "Application submitted",
  "data": {
    "id": "uuid",
    "propertyId": "uuid",
    "userId": "uuid",
    "status": "submitted",
    "moveInDate": "2025-07-01",
    "monthlyIncome": 5000.00,
    "employmentStatus": "employed",
    "employerName": "string",
    "documents": [],
    "notes": "string",
    "createdAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:** 400 (validation), 401, 404

---

#### GET /api/applications/my

Get the current user's rental applications.

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "propertyId": "uuid",
      "propertyTitle": "string",
      "status": "submitted",
      "moveInDate": "2025-07-01",
      "createdAt": "ISO 8601 datetime"
    }
  ]
}
```

**Error Responses:** 401

---

#### GET /api/applications

List all rental applications. Admin only.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| status | enum | — | `draft` \| `submitted` \| `under_review` \| `approved` \| `rejected` |
| propertyId | UUID | — | Filter by property |

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "uuid",
        "propertyId": "uuid",
        "propertyTitle": "string",
        "userId": "uuid",
        "userName": "string",
        "status": "submitted",
        "moveInDate": "2025-07-01",
        "monthlyIncome": 5000.00,
        "employmentStatus": "employed",
        "createdAt": "ISO 8601 datetime"
      }
    ],
    "meta": { "total": 10, "page": 1, "limit": 20, "totalPages": 1 }
  }
}
```

**Error Responses:** 401, 403

---

#### GET /api/applications/:id

Get detailed information for a specific application.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Application ID |

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "propertyId": "uuid",
    "propertyTitle": "string",
    "userId": "uuid",
    "userName": "string",
    "status": "submitted",
    "moveInDate": "2025-07-01",
    "monthlyIncome": 5000.00,
    "employmentStatus": "employed",
    "employerName": "string",
    "documents": [],
    "notes": "string",
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:** 401, 403, 404

---

#### PATCH /api/applications/:id/status

Update the status of a rental application. Admin only.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Application ID |

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| status | enum | Yes | `under_review` \| `approved` \| `rejected` |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "message": "Application status updated",
  "data": {
    "id": "uuid",
    "status": "approved",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:** 400 (validation), 401, 403, 404

---

## Enums Reference

### PropertyType

| Value | Description |
|-------|-------------|
| `apartment` | Apartment unit |
| `house` | Single-family house |
| `condo` | Condominium |
| `townhouse` | Townhouse |
| `studio` | Studio apartment |

### InquiryStatus

| Value | Description |
|-------|-------------|
| `new` | Unread inquiry |
| `read` | Viewed by admin |
| `responded` | Admin has responded |

### UserStatus

| Value | Description |
|-------|-------------|
| `active` | Account in good standing |
| `suspended` | Account suspended by admin |

### ReviewStatus

| Value | Description |
|-------|-------------|
| `pending` | Awaiting admin moderation |
| `approved` | Visible on property page |
| `rejected` | Not visible, admin rejected |

### TourBookingStatus

| Value | Description |
|-------|-------------|
| `pending` | Awaiting admin confirmation |
| `confirmed` | Admin has confirmed the tour |
| `cancelled` | Cancelled by renter or admin |
| `completed` | Tour has taken place |

### NotificationType

| Value | Description |
|-------|-------------|
| `new_message` | New chat message received |
| `tour_reminder` | Upcoming tour reminder |
| `application_update` | Application status changed |
| `review_approved` | Review approved by admin |
| `recommendation` | New recommendations available |

### ApplicationStatus

| Value | Description |
|-------|-------------|
| `draft` | Saved but not submitted |
| `submitted` | Submitted, awaiting review |
| `under_review` | Admin is reviewing |
| `approved` | Application approved |
| `rejected` | Application rejected |

### UserRole

| Value | Permissions |
|-------|-------------|
| `renter` | browse_properties, view_property_details, save_favorites, submit_inquiries, write_reviews, book_tours, send_messages, submit_applications |
| `admin` | manage_properties, manage_users, view_inquiries, respond_to_inquiries, moderate_reviews, manage_tours, review_applications, view_messages |

---

## Pagination Convention

All list endpoints return a `meta` object with pagination info:

```json
{
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

Default `limit` is 20, maximum is 100.

---

## Standard Response Envelope

All successful responses use this envelope:

```json
{
  "statusCode": 200,
  "message": "string",
  "data": {}
}
```

- `statusCode` — HTTP status code
- `message` — Human-readable success message
- `data` — Response payload (object, array, or null)

204 responses have no body.
