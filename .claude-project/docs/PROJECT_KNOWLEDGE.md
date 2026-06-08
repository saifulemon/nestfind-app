# PROJECT_KNOWLEDGE

## Overview

### Application Purpose

NestFind is a streamlined rental property listing platform that connects renters with available properties. The platform focuses exclusively on rentals, providing a clean and efficient browsing experience where renters can search, filter, view details, save favorites, and submit inquiries to property managers. An accompanying admin dashboard enables administrators to manage property listings, respond to inquiries, and oversee user accounts.

The platform targets two primary user groups: Renters who browse and discover rental properties, and Administrators who manage the listings and respond to renter inquiries. NestFind integrates with Google Maps for property location display.

### Technology Stack

| Layer | Technology |
|-------|------------|
| Backend | NestJS 11, TypeScript 5.7+ |
| Frontend | React 19 with React Router 7 (framework mode) |
| Database | PostgreSQL 16 |
| ORM | TypeORM 0.3.x |
| Authentication | JWT via httpOnly cookies (Access: 1h, Refresh: 7d) |
| API Documentation | Swagger/OpenAPI |
| Validation | class-validator (backend), Zod (frontend) |
| Frontend State | Redux Toolkit with createAsyncThunk |
| Styling | Tailwind CSS 4, Shadcn/UI |
| Maps | Google Maps API |
| Deployment | Docker |

### Domain

`nestfind.com` — web application

---

## User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **Renter** | Browses rental property listings, views detailed property information, saves properties to favorites, submits inquiries, writes reviews, books tours, sends messages, and submits rental applications. | `browse_properties`, `view_property_details`, `save_favorites`, `submit_inquiries`, `write_reviews`, `book_tours`, `send_messages`, `submit_applications` |
| **Admin** | Has full system access to manage property listings (CRUD), manage user accounts, view and respond to inquiries, moderate reviews, manage tours, review applications, and view messages. | `manage_properties`, `manage_users`, `view_inquiries`, `respond_to_inquiries`, `moderate_reviews`, `manage_tours`, `review_applications`, `view_messages` |
| **Guest** | Unauthenticated visitor who can browse public property listings and view property details. Must register/login to save favorites, submit inquiries, write reviews, book tours, send messages, or submit applications. | `browse_properties`, `view_property_details` |

### Authentication & Authorization

- **JWT via httpOnly cookies**: Access token (1 hour) + Refresh token (7 days). Cookies configured with `httpOnly: true, secure: true, sameSite: 'strict'`. Tokens are never stored in localStorage.
- **Role-based access control (RBAC)**: Guards at the route/endpoint level enforce role-specific permissions via `JwtAuthGuard` + `RolesGuard`.
- **Guest access**: Public endpoints for browsing and viewing properties are marked with `@Public()` decorator; all other endpoints require authentication.
- **Admin assignment**: Admin accounts are created by existing admins or via database seeding. Self-registration defaults to Renter role.

### Seed Accounts (Development)

Run `npx ts-node seed.ts` from the `backend/` directory to populate the SQLite database. The script is idempotent — safe to run multiple times.

| Role | Email | Password | Status |
|------|-------|----------|--------|
| Admin | `admin@nestfind.com` | `AdminPass123!` | active |
| Renter | `jane@example.com` | `Password123!` | active |

**Database:** SQLite at `backend/nestfind.sqlite` (auto-created via `synchronize: true` in dev mode). 3 sample properties are also seeded.

---

## Core Features

### Common (All Users)

- **Authentication**
  - User login with email + password
  - JWT access token (1h) and refresh token (7d) via httpOnly cookies
  - Token refresh mechanism with rotation
  - Logout clears cookies

- **Registration**
  - Self-service sign-up with name, email, password, phone (optional)
  - Default role assignment: Renter
  - Email verification (optional, configurable)

- **Password Reset**
  - Forgot password flow via email
  - Secure reset token with expiration

### Renter Features

1. **Property Search**
   - Search by location (text input or current geolocation)
   - Real-time filtering by price range, number of bedrooms, property type
   - Results displayed as property cards with thumbnail, price, and key details
   - Pagination or infinite scroll for large result sets

2. **Property Detail View**
   - Full property page with photo gallery, amenities list, description, and floor plan
   - Embedded Google Map showing property location
   - Save to favorites (toggle)
   - Contact / Submit Inquiry button
   - **Recently Viewed Strip** on homepage showing last 6 viewed properties
   - **Property Reviews** with star ratings and written feedback

3. **Favorites Management**
   - View all saved/favorited properties
   - Remove properties from favorites
   - Quick access from navigation

4. **Submit Inquiry**
   - Contact form on property detail page (name, email, phone, message)
   - Form validation before submission
   - Confirmation message shown to renter
   - Admin notified of new inquiry

5. **Smart Recommendations**
   - Personalized property recommendations based on viewing history, favorites, and search behavior
   - Match score and reason explanation for each recommendation
   - Dedicated recommendations page and homepage section

6. **Saved Searches**
   - Save current search filters with a custom name
   - View all saved searches and re-run them with one click
   - Delete saved searches

7. **Map Search**
   - Interactive map view of properties in a geographic area
   - Viewport-based search (pan/zoom to update results)
   - Property markers with price popups

8. **Notifications**
   - Real-time notification bell in header
   - Notification types: new message, tour reminder, application update, review approved, recommendation available
   - Mark notifications as read

9. **Property Tours**
   - View available tour time slots for each property
   - Book a tour slot (select date and time)
   - View and manage booked tours (my tours page)
   - Cancel upcoming tours

10. **Chat/Messaging**
    - Real-time messaging with property managers via WebSocket
    - Conversation list and message threads
    - Send and receive text messages instantly

11. **Rental Applications**
    - Submit rental applications with personal, employment, and reference information
    - Upload documents (ID, pay stubs, etc.)
    - Track application status (draft, submitted, under_review, approved, rejected)
    - View submitted applications (my applications page)

12. **Property Reviews**
    - Write reviews for properties after viewing or applying
    - Star ratings (1-5) for overall, location, condition, and value
    - Written review text
    - Read reviews on property detail pages

### Admin Features

1. **Admin Dashboard**
   - Overview statistics: total properties, total inquiries, recent activity
   - Quick links to property management and inquiry management

2. **Property Management (CRUD)**
   - List all properties with search, filter, and pagination
   - Add new property with details: title, description, price, bedrooms, bathrooms, property type, address, amenities, photos (multi-upload)
   - Edit existing property information
   - Delete or archive property listings (soft delete)

3. **Inquiry Management**
   - View all inquiries with status (new, read, responded)
   - Mark inquiries as read
   - Respond to inquiries directly from the dashboard
   - Filter by property or renter

4. **User Management**
   - View list of registered renters
   - View renter details and activity history
   - Suspend or reactivate user accounts

5. **Review Moderation**
   - View all property reviews with status (pending, approved, rejected)
   - Approve or reject pending reviews
   - Filter reviews by property or status

6. **Tour Management**
   - View all booked tours with status (pending, confirmed, cancelled, completed)
   - Confirm or cancel tour bookings
   - Filter tours by property or date range

7. **Application Review**
   - View all rental applications with status (draft, submitted, under_review, approved, rejected)
   - Review application details (personal info, employment, references, documents)
   - Approve or reject applications
   - Filter applications by property or status

8. **Message Management**
   - View all chat conversations
   - View message threads for support or moderation purposes

---

## Functional Requirements

### Authentication

- **FR-AUTH-001**: Users must authenticate with email and password to access protected features.
- **FR-AUTH-002**: JWT access tokens expire after 1 hour; refresh tokens expire after 7 days.
- **FR-AUTH-003**: Refresh tokens are rotated on each use (old token invalidated).
- **FR-AUTH-004**: All authentication tokens are stored in httpOnly, secure, sameSite-strict cookies.
- **FR-AUTH-005**: Guest users can browse properties without authentication.

### Property Search

- **FR-SEARCH-001**: Renters can search properties by location text (city, neighborhood, zip code).
- **FR-SEARCH-002**: Renters can use browser geolocation to find properties near their current location.
- **FR-SEARCH-003**: Results support filtering by price range (min/max), number of bedrooms, and property type.
- **FR-SEARCH-004**: Filters update results in real-time without full page reload.
- **FR-SEARCH-005**: Each result card displays thumbnail image, price, address, bedrooms, and bathrooms.

### Property Details

- **FR-DETAIL-001**: Property detail page displays full photo gallery with navigation.
- **FR-DETAIL-002**: Property page includes description, amenities list, pricing, and property specifications.
- **FR-DETAIL-003**: An embedded Google Map shows the property location with a pin marker.
- **FR-DETAIL-004**: Authenticated renters can toggle the property as a favorite.
- **FR-DETAIL-005**: A Contact/Inquiry button is prominently displayed.

### Inquiries

- **FR-INQ-001**: Inquiry form collects name, email, phone (optional), and message.
- **FR-INQ-002**: Form fields are validated client-side (Zod) and server-side (class-validator).
- **FR-INQ-003**: On successful submission, renter sees a confirmation message.
- **FR-INQ-004**: System notifies admin of new inquiries (in-dashboard notification).

### Admin: Property Management

- **FR-ADM-PROP-001**: Admin can create new property listings with all required fields.
- **FR-ADM-PROP-002**: Admin can upload multiple photos per property.
- **FR-ADM-PROP-003**: Admin can edit all fields of an existing property.
- **FR-ADM-PROP-004**: Admin can soft-delete (archive) a property listing.
- **FR-ADM-PROP-005**: Property list supports search, sort, and pagination.

### Admin: Inquiry Management

- **FR-ADM-INQ-001**: Admin can view all inquiries with status indicators.
- **FR-ADM-INQ-002**: Admin can filter inquiries by property or renter.
- **FR-ADM-INQ-003**: Admin can mark inquiries as read and respond to them.

### Admin: User Management

- **FR-ADM-USER-001**: Admin can view a list of all registered renters.
- **FR-ADM-USER-002**: Admin can view individual renter details and activity.
- **FR-ADM-USER-003**: Admin can suspend or reactivate user accounts.

### Recommendations

- **FR-REC-001**: System generates personalized recommendations based on viewing history, favorites, and search behavior.
- **FR-REC-002**: Each recommendation includes a match score (0–100) and human-readable match reasons.
- **FR-REC-003**: Recommendations update when renter behavior changes.

### Saved Searches

- **FR-SAVED-001**: Authenticated renters can save current search filters with a custom name.
- **FR-SAVED-002**: Renters can view all saved searches and re-run them.
- **FR-SAVED-003**: Renters can delete saved searches.

### Map Search

- **FR-MAP-001**: Renters can view properties on an interactive map.
- **FR-MAP-002**: Map search updates results based on viewport bounds (pan/zoom).
- **FR-MAP-003**: Property markers show price and link to detail page.

### Property Reviews

- **FR-REV-001**: Authenticated renters can write reviews for properties.
- **FR-REV-002**: Reviews include overall rating (1–5 stars) and optional written text.
- **FR-REV-003**: Reviews are subject to admin moderation (pending → approved/rejected).
- **FR-REV-004**: Only approved reviews are visible on property detail pages.
- **FR-REV-005**: Property detail page displays average rating and total review count.

### Notifications

- **FR-NOTIF-001**: System sends notifications for: new messages, tour reminders, application updates, review approvals, and new recommendations.
- **FR-NOTIF-002**: Notifications are delivered in real-time via WebSocket and stored persistently.
- **FR-NOTIF-003**: Users can mark notifications as read individually or all at once.
- **FR-NOTIF-004**: Unread notification count is displayed in the header bell icon.

### Property Tours

- **FR-TOUR-001**: Properties display available tour time slots.
- **FR-TOUR-002**: Authenticated renters can book a tour slot (one booking per slot).
- **FR-TOUR-003**: Renters can view and cancel their upcoming tours.
- **FR-TOUR-004**: Admins can confirm or cancel tour bookings.
- **FR-TOUR-005**: Tour statuses: pending, confirmed, cancelled, completed.

### Chat/Messaging

- **FR-CHAT-001**: Authenticated renters can start conversations with property managers about specific properties.
- **FR-CHAT-002**: Messages are delivered in real-time via WebSocket.
- **FR-CHAT-003**: Conversation list shows last message preview and unread count.
- **FR-CHAT-004**: Messages persist and are retrievable after page refresh.

### Rental Applications

- **FR-APP-001**: Authenticated renters can submit rental applications with personal, employment, and reference information.
- **FR-APP-002**: Applications can include document uploads (ID, pay stubs, etc.).
- **FR-APP-003**: Application statuses: draft, submitted, under_review, approved, rejected.
- **FR-APP-004**: Renters can view their submitted applications and current status.
- **FR-APP-005**: Admins can review application details and approve or reject applications.

### Admin: Review Moderation

- **FR-ADM-REV-001**: Admin can view all reviews with status (pending, approved, rejected).
- **FR-ADM-REV-002**: Admin can approve or reject pending reviews.
- **FR-ADM-REV-003**: Admin can filter reviews by property or status.

### Admin: Tour Management

- **FR-ADM-TOUR-001**: Admin can view all booked tours.
- **FR-ADM-TOUR-002**: Admin can confirm or cancel tour bookings.
- **FR-ADM-TOUR-003**: Admin can filter tours by property or date range.

### Admin: Application Review

- **FR-ADM-APP-001**: Admin can view all rental applications.
- **FR-ADM-APP-002**: Admin can review full application details.
- **FR-ADM-APP-003**: Admin can approve or reject applications.
- **FR-ADM-APP-004**: Admin can filter applications by property or status.

---

## Non-Functional Requirements

### Performance

- **NFR-PERF-001**: Property search results must return within 500ms for typical query loads.
- **NFR-PERF-002**: Image assets should be served with lazy loading and optimized formats (WebP).
- **NFR-PERF-003**: API responses must use pagination for list endpoints (default: 20 items/page).

### Security

- **NFR-SEC-001**: All authenticated endpoints enforce JWT validation via guards.
- **NFR-SEC-002**: Passwords are hashed using bcrypt with appropriate salt rounds.
- **NFR-SEC-003**: Input validation is enforced at the API boundary using class-validator/Zod.
- **NFR-SEC-004**: CORS is configured to allow only the frontend origin.
- **NFR-SEC-005**: Rate limiting is applied to authentication endpoints (login, register, password reset).

### Reliability

- **NFR-REL-001**: Database operations use transactions for multi-step mutations.
- **NFR-REL-002**: Soft delete (`deleted_at`) is used for properties and user accounts (no destructive deletes).
- **NFR-REL-003**: API errors return consistent response format with appropriate HTTP status codes.

### Maintainability

- **NFR-MAIN-001**: Backend follows the 4-layer architecture pattern: Controller → Service → Repository → Entity.
- **NFR-MAIN-002**: All backend layers extend base classes (`BaseController`, `BaseService`, `BaseRepository`, `BaseEntity`).
- **NFR-MAIN-003**: Frontend follows file organization patterns defined in `.claude/react/docs/file-organization.md`.
- **NFR-MAIN-004**: All API endpoints are documented with Swagger/OpenAPI annotations.

### Compatibility

- **NFR-COMP-001**: Frontend supports latest 2 versions of Chrome, Firefox, Safari, and Edge.
- **NFR-COMP-002**: Application is responsive and functional on mobile, tablet, and desktop viewports.

---

## Ontology / Glossary

| Term | Definition |
|------|------------|
| **Property** | A rental property listing with details such as title, description, price, address, bedrooms, bathrooms, property type, amenities, and photos. |
| **Property Type** | The category of rental property (e.g., apartment, house, condo, townhouse, studio). |
| **Listing** | A published property that is visible to renters in search results. |
| **Renter** | A registered user who browses, searches, and saves properties, and submits inquiries. |
| **Admin** | A system administrator with full access to manage properties, users, and inquiries. |
| **Guest** | An unauthenticated visitor who can browse and view property details. |
| **Inquiry** | A contact form submission from a renter about a specific property, containing name, email, phone (optional), and message. |
| **Favorites** | A saved collection of properties that a renter has bookmarked for later reference. |
| **Amenity** | A feature or facility available at a property (e.g., parking, laundry, gym, pool, air conditioning). |
| **Soft Delete** | A record is marked as deleted (`deleted_at` timestamp) but remains in the database, allowing recovery and audit trails. |
| **Archive** | A property listing that has been soft-deleted by an admin, removing it from public search results. |
| **Recommendation Score** | A computed match score (0–100) indicating how well a property matches a renter's preferences and behavior. |
| **Saved Search** | A persisted set of search filters (price, bedrooms, location, etc.) that a renter can save and re-run later. |
| **Property Review** | A renter-submitted evaluation of a property including star ratings and written feedback, subject to admin moderation. |
| **Tour Slot** | A scheduled date and time window during which a property is available for in-person or virtual viewing. |
| **Tour Booking** | A renter's reservation of a tour slot for a specific property. |
| **Notification** | A system-generated alert sent to a user about events (new messages, tour reminders, application updates, etc.). |
| **Chat Conversation** | A message thread between a renter and a property manager (admin) about a specific property. |
| **Rental Application** | A formal request to rent a property, including personal details, employment info, references, and documents. |
| **Application Status** | The current state of a rental application: draft, submitted, under_review, approved, or rejected. |
| **httpOnly Cookie** | A cookie that is inaccessible to client-side JavaScript, used to store JWT tokens securely. |
| **Access Token** | A short-lived JWT (1 hour) that authorizes API requests. |
| **Refresh Token** | A longer-lived JWT (7 days) used to obtain new access tokens without re-authentication. |
| **RBAC** | Role-Based Access Control — restricts system access based on user roles (Renter, Admin). |
| **JwtAuthGuard** | A NestJS guard that validates JWT from httpOnly cookies on protected routes. |
| **RolesGuard** | A NestJS guard that checks user role permissions for accessing specific endpoints. |
| **BaseController** | A base class providing automatic CRUD endpoints for controllers that extend it. |
| **BaseService** | A base class providing automatic CRUD business logic for services that extend it. |
| **BaseRepository** | A base class providing automatic TypeORM CRUD operations for repositories that extend it. |
| **BaseEntity** | A base class providing UUID primary key, timestamps (`createdAt`, `updatedAt`), and soft delete (`deletedAt`) for all entities. |
| **createAsyncThunk** | Redux Toolkit utility for creating async thunk actions for API calls in the frontend. |
| **React Router 7 (Framework Mode)** | The routing system used by the frontend, where routes are defined declaratively using `route()`, `layout()`, and `index()` from `@react-router/dev/routes`. |

---

## Architecture Overview

### Backend: Four-Layer Architecture

```
HTTP Request
    ↓
Controller  (extends BaseController)  — HTTP handling, validation, Swagger docs
    ↓
Service     (extends BaseService)     — Business logic, rules enforcement
    ↓
Repository  (extends BaseRepository)  — Data access, TypeORM queries
    ↓
Entity      (extends BaseEntity)      — Database schema (UUID PK, timestamps, soft delete)
    ↓
PostgreSQL + TypeORM
```

### Frontend Architecture

- **Routing**: React Router 7 framework mode with `routes.ts` defining `route()`, `layout()`, `index()` patterns
- **State Management**: Redux Toolkit with `createAsyncThunk` for API data fetching; Redux slices per domain feature
- **Forms**: React Hook Form + Zod validation following shadcn/ui patterns
- **Auth**: JWT httpOnly cookies with AuthContext, GuestGuard, and AuthGuard components
- **Source Directory**: `app/` (not `src/`), imports use `~/` alias
- **Styling**: Tailwind CSS 4 + Shadcn/UI component library

### Directory Structure

```
nestfind/
├── backend/
│   ├── src/
│   │   ├── core/              # Base classes, guards, decorators, filters
│   │   │   ├── base/          # BaseEntity, BaseRepository, BaseService, BaseController
│   │   │   ├── decorators/    # @Public(), @Roles(), @CurrentUser()
│   │   │   ├── guards/        # JwtAuthGuard, RolesGuard
│   │   │   ├── filters/       # HttpExceptionFilter
│   │   │   ├── interceptors/  # TransformInterceptor, LoggingInterceptor
│   │   │   └── pipes/         # ValidationPipe
│   │   ├── modules/           # Feature modules (entity, repo, service, controller, module)
│   │   ├── infrastructure/    # External services (mail, s3, token)
│   │   └── database/          # Migrations, seeds
│   └── test/                  # E2E tests
├── frontend/
│   └── app/                   # Source directory
│       ├── components/        # ui/, atoms/, modals/, shared/, layouts/, guards/
│       ├── pages/             # Route pages
│       ├── services/          # httpService.ts, httpMethods/, httpServices/
│       ├── redux/             # features/, store/
│       ├── types/             # .d.ts per domain
│       ├── enums/             # Synced from backend
│       ├── contexts/          # AuthContext
│       ├── hooks/             # Custom hooks
│       ├── lib/               # cn() utility
│       ├── utils/             # errorHandler, validations/
│       └── styles/            # Tailwind + theme variables
└── docker-compose.yml
```

### API Base URLs

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:3000/api` |
| Staging | `https://staging.nestfind.com/api` |
| Production | `https://api.nestfind.com/api` |

---

## Related Documentation

- [API Documentation](PROJECT_API.md) — Complete API endpoint specifications
- [Database Schema](PROJECT_DATABASE.md) — Entity definitions and relationships
- [API Integration](PROJECT_API_INTEGRATION.md) — Frontend-backend integration mapping
- [Backend API Status](../status/backend/API_IMPLEMENTATION_STATUS.md) — Backend implementation tracking
- [Frontend Screen Status](../status/frontend/SCREEN_IMPLEMENTATION_STATUS.md) — Frontend implementation tracking
- [Architecture Decisions](../memory/DECISIONS.md) — Key technical decisions log
- [Coding Patterns](../memory/LEARNINGS.md) — Patterns and insights

---

*Generated: 2026-05-19 | Source: seed.yaml + architecture guides*
