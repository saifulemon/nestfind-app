# NestFind - Product Requirements Document (PRD)

## 1. Product Overview

NestFind is a full-featured rental property listing platform connecting renters with available properties. It provides a clean, modern browsing experience where renters can search, filter, view details, save favorites, submit inquiries, book tours, chat with landlords, and submit rental applications. An admin dashboard enables property managers to manage listings, respond to inquiries, moderate reviews, manage tours, and review applications.

### 1.1 Target Users
- **Renters**: Browse, search, save favorites, inquire, book tours, chat, apply
- **Administrators**: Manage properties, users, inquiries, reviews, tours, applications
- **Guests**: Browse public listings without authentication

### 1.2 Tech Stack
| Layer | Technology |
|-------|------------|
| Backend | NestJS 11, TypeScript 5.7+ |
| Frontend | React 19, React Router 7 (framework mode) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ORM | TypeORM 0.3.x |
| Auth | JWT via httpOnly cookies |
| State | Redux Toolkit with createAsyncThunk |
| Styling | Tailwind CSS 4, Shadcn/UI |
| Maps | Google Maps Embed API |
| Real-time | Socket.IO |

---

## 2. User Roles & Permissions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Guest** | Unauthenticated visitor | Browse properties, view details, view search |
| **Renter** | Authenticated renter account | All guest + save favorites, submit inquiries, book tours, send messages, submit applications, write reviews, saved searches |
| **Admin** | Property manager / administrator | All renter + CRUD properties, manage users, respond to inquiries, moderate reviews, manage tours, review applications, view all messages |

---

## 3. Core Features

### 3.1 Authentication & Authorization
- **Registration**: Self-service signup with name, email, password, phone. Default role: Renter.
- **Login**: Email + password with bcrypt hashing.
- **JWT Tokens**: Access token (1h) + Refresh token (7d) via httpOnly cookies (`secure`, `sameSite: strict`).
- **Token Refresh**: Automatic rotation on use. Old refresh tokens invalidated.
- **Logout**: Clears all auth cookies and revokes refresh tokens server-side.
- **Forgot/Reset Password**: Token-based reset with 1h expiry.
- **Avatar Upload**: JPEG/PNG/WebP, 2MB limit.
- **Role Guards**: `JwtAuthGuard` + `RolesGuard` enforce RBAC at route/endpoint level.
- **Rate Limiting**: Auth endpoints throttled (register: 5/min, login: 10/min, etc.).

### 3.2 Property Search & Discovery
- **Text Search**: Search by city, neighborhood, zip code, or property title.
- **Filters**: Price range (min/max), bedrooms, property type, city.
- **Sorting**: Price, date, relevance.
- **Pagination**: Configurable page/limit (default 20, max 100).
- **Map Search**: Interactive map with bounding box search. Property markers with price popups.
- **Property Types**: Apartment, House, Condo, Townhouse, Studio.
- **Property Cards**: Thumbnail, price, address, bedrooms, bathrooms.
- **Recently Viewed**: Last 6 viewed properties shown on homepage.

### 3.3 Property Detail Page
- **Photo Gallery**: Main image + thumbnail strip. Click to switch.
- **Key Stats**: Price, bedrooms, bathrooms, square footage, property type.
- **Description**: Full property description.
- **Amenities**: Grid of icons (wifi, AC, laundry, parking, gym, pool, pet-friendly, etc.).
- **Google Map**: Embedded map with property location.
- **Favorite Toggle**: Heart button to save/unsave.
- **Inquiry Form**: Name, email, phone, message. Submits to admin.
- **Book Tour**: View available slots, select slot, book with optional notes.
- **Message Landlord**: Start real-time chat conversation.
- **Apply Now**: Link to rental application form.
- **Reviews**: Average rating, review count, individual reviews.

### 3.4 Favorites
- Save/unsave properties from detail page.
- View all favorites on dedicated page.
- Remove properties from favorites list.

### 3.5 Inquiries
- Submit inquiry from property detail (name, email, phone, message).
- View my inquiries on dedicated page.
- Admin can view all inquiries, mark as read, respond.
- Inquiry statuses: new, read, responded.

### 3.6 Saved Searches
- Save current search filters with custom name.
- Re-run saved searches with one click.
- Delete saved searches.
- Toggle email alerts per saved search.

### 3.7 Property Reviews
- Write reviews (rating 1-5, title, comment).
- Reviews require admin moderation (pending → approved/rejected).
- Mark reviews as helpful.
- Average rating and review count on property detail.

### 3.8 Notifications
- Real-time notification bell in header.
- Types: new message, inquiry response, tour reminder, application update, review approved.
- Mark as read (individual or all).
- Unread count badge.
- Delivered via WebSocket + stored persistently.

### 3.9 Property Tours
- Admin creates available tour slots (in-person or virtual).
- Renter views slots on property detail and books.
- Renter views/cancels upcoming tours on My Tours page.
- Admin can view all bookings.

### 3.10 Chat / Messaging (Real-time)
- Start conversation from property detail (links to property + admin).
- Real-time messaging via Socket.IO.
- Conversation list with last preview and unread count.
- Messages persist and load on page refresh.
- URL persistence: `?conv=` + sessionStorage fallback.
- Unread badge on conversation list.
- Auto-scroll to bottom on new messages.

### 3.11 Rental Applications
- Submit application from property detail.
- Fields: monthly income, employment status, employer name/phone, move-in date, pets, pet details, notes.
- Track status: submitted → under_review → approved / rejected.
- Admin reviews all applications, updates status.
- Notification sent to applicant on status change.

### 3.12 Smart Recommendations
- Personalized recommendations based on viewing history, favorites, search behavior.
- Match score and reason explanation.
- Dedicated recommendations page.

---

## 4. Admin Features

### 4.1 Admin Dashboard
- Overview statistics: total properties, inquiries, users, recent activity.
- Quick links to property/inquiry management.

### 4.2 Property Management (CRUD)
- List all properties with search, filter, pagination.
- Create new property: title, description, price, bedrooms, bathrooms, type, address, amenities, photos.
- Edit existing property.
- Soft delete (archive) property.
- Photo management: upload (up to 10, 5MB each), delete, set primary, reorder.

### 4.3 Inquiry Management
- View all inquiries with status.
- Filter by property, renter, status.
- Mark as read, respond.

### 4.4 User Management
- View list of all users with filter by role/status.
- View user details.
- Suspend / reactivate accounts.
- Create admin accounts.

### 4.5 Review Moderation
- View all reviews (pending, approved, rejected).
- Approve or reject pending reviews.
- Filter by property or status.

### 4.6 Tour Management
- View all booked tours.
- Create/delete tour slots.
- View slot bookings.

### 4.7 Application Review
- View all rental applications with status.
- Review full application details.
- Update status (submitted → under_review → approved/rejected).
- Filter by property or status.
- Notifications sent to applicants on status change.

### 4.8 Messages
- View all chat conversations.
- Real-time messaging with renters.
- Search conversations by renter name or property.
- Unread counts per conversation.

---

## 5. Functional Requirements

### 5.1 Authentication
| ID | Requirement |
|----|-------------|
| FR-AUTH-001 | Users authenticate with email + password |
| FR-AUTH-002 | Access tokens expire after 1h; refresh tokens after 7d |
| FR-AUTH-003 | Refresh tokens rotate on each use (old invalidated) |
| FR-AUTH-004 | All tokens in httpOnly, secure, sameSite=strict cookies |
| FR-AUTH-005 | Guest users can browse properties without auth |
| FR-AUTH-006 | Self-registration defaults to Renter role |
| FR-AUTH-007 | Admin accounts created by existing admins or seeding |

### 5.2 Property Search
| ID | Requirement |
|----|-------------|
| FR-SEARCH-001 | Search by location text (city, neighborhood, zip) |
| FR-SEARCH-002 | Filter by price range, bedrooms, property type, city |
| FR-SEARCH-003 | Sort by price, date, relevance |
| FR-SEARCH-004 | Pagination with configurable page size |
| FR-SEARCH-005 | Result cards show thumbnail, price, address, beds, baths |

### 5.3 Property Details
| ID | Requirement |
|----|-------------|
| FR-DETAIL-001 | Photo gallery with thumbnail navigation |
| FR-DETAIL-002 | Description, amenities, pricing, specs |
| FR-DETAIL-003 | Embedded Google Map with property location |
| FR-DETAIL-004 | Authenticated renters can favorite/unfavorite |
| FR-DETAIL-005 | Inquiry form, Book Tour, Message Landlord, Apply Now |
| FR-DETAIL-006 | Reviews section with average rating |

### 5.4 Inquiries
| ID | Requirement |
|----|-------------|
| FR-INQ-001 | Form: name, email, phone (opt), message |
| FR-INQ-002 | Client + server validation |
| FR-INQ-003 | Confirmation message on submit |
| FR-INQ-004 | Admin notified of new inquiries |

### 5.5 Chat
| ID | Requirement |
|----|-------------|
| FR-CHAT-001 | Real-time messages via WebSocket |
| FR-CHAT-002 | Conversation list with last preview + unread count |
| FR-CHAT-003 | Messages persist and load after refresh |
| FR-CHAT-004 | URL persistence with `?conv=` param |
| FR-CHAT-005 | Auto-scroll to bottom |

### 5.6 Applications
| ID | Requirement |
|----|-------------|
| FR-APP-001 | Submit with income, employment, move-in, pets, notes |
| FR-APP-002 | Status: submitted, under_review, approved, rejected |
| FR-APP-003 | Renter views submitted applications |
| FR-APP-004 | Admin reviews and updates status |
| FR-APP-005 | Applicant notified on status change |

### 5.7 Tours
| ID | Requirement |
|----|-------------|
| FR-TOUR-001 | Properties display available slots |
| FR-TOUR-002 | Authenticated renters book slots |
| FR-TOUR-003 | Renter views/cancels upcoming tours |
| FR-TOUR-004 | Admin creates/deletes slots |
| FR-TOUR-005 | Types: in_person, virtual |

### 5.8 Notifications
| ID | Requirement |
|----|-------------|
| FR-NOTIF-001 | Types: message, inquiry, tour, application, review, recommendation |
| FR-NOTIF-002 | Real-time via WebSocket + persistent storage |
| FR-NOTIF-003 | Mark read individually or all at once |
| FR-NOTIF-004 | Unread count in header bell |

### 5.9 Reviews
| ID | Requirement |
|----|-------------|
| FR-REV-001 | Authenticated renters write reviews (rating 1-5, text) |
| FR-REV-002 | Admin moderation: pending → approved/rejected |
| FR-REV-003 | Only approved reviews visible on detail page |
| FR-REV-004 | Average rating + count on detail page |
| FR-REV-005 | Mark helpful |

### 5.10 Saved Searches
| ID | Requirement |
|----|-------------|
| FR-SAVED-001 | Save current filters with custom name |
| FR-SAVED-002 | Re-run saved searches |
| FR-SAVED-003 | Delete saved searches |
| FR-SAVED-004 | Toggle email alerts |

---

## 6. Non-Functional Requirements

### 6.1 Performance
| ID | Requirement |
|----|-------------|
| NFR-PERF-001 | Search results < 500ms |
| NFR-PERF-002 | Images lazy-loaded with WebP |
| NFR-PERF-003 | API pagination default 20 items/page |

### 6.2 Security
| ID | Requirement |
|----|-------------|
| NFR-SEC-001 | All auth endpoints enforce JWT validation |
| NFR-SEC-002 | Passwords hashed with bcrypt |
| NFR-SEC-003 | Input validation at API boundary |
| NFR-SEC-004 | CORS configured for frontend origin only |
| NFR-SEC-005 | Rate limiting on auth endpoints |
| NFR-SEC-006 | CSRF protection on state-changing requests |

### 6.3 Reliability
| ID | Requirement |
|----|-------------|
| NFR-REL-001 | Transactions for multi-step mutations |
| NFR-REL-002 | Soft delete for properties and users |
| NFR-REL-003 | Consistent error response format |

### 6.4 Maintainability
| ID | Requirement |
|----|-------------|
| NFR-MAIN-001 | 4-layer backend: Controller → Service → Repository → Entity |
| NFR-MAIN-002 | All layers extend base classes |
| NFR-MAIN-003 | Frontend follows `app/` directory with `~/` alias |
| NFR-MAIN-004 | Swagger/OpenAPI docs on all endpoints |

### 6.5 Compatibility
| ID | Requirement |
|----|-------------|
| NFR-COMP-001 | Latest 2 versions of Chrome, Firefox, Safari, Edge |
| NFR-COMP-002 | Responsive: mobile, tablet, desktop |

---

## 7. Database Schema Summary

| Table | Purpose |
|-------|---------|
| `users` | Accounts (renters, admins) |
| `refresh_tokens` | JWT refresh token storage |
| `password_reset_tokens` | Password reset tokens |
| `properties` | Property listings (soft delete) |
| `property_photos` | Property images |
| `amenities` | Available amenities |
| `property_amenities` | Many-to-many junction |
| `favorites` | User's favorite properties |
| `inquiries` | Property inquiries |
| `property_views` | View history tracking |
| `saved_searches` | Saved search criteria |
| `property_reviews` | Property reviews |
| `notifications` | User notifications |
| `tour_slots` | Available tour time slots |
| `tour_bookings` | Confirmed tour bookings |
| `chat_conversations` | Chat conversations |
| `chat_messages` | Chat messages |
| `rental_applications` | Rental applications |

---

## 8. API Summary

| Module | Key Endpoints |
|--------|--------------|
| Auth | register, login, refresh, logout, forgot-password, reset-password, me, avatar |
| Users | admin user creation |
| Profile | get, update |
| Properties | CRUD, photos, map-search |
| Amenities | CRUD (admin) |
| Favorites | list, add, remove |
| Inquiries | submit, list, respond, reply, delete |
| Property Views | track, recently-viewed |
| Saved Searches | CRUD, alert toggle |
| Reviews | list, submit, helpful, moderate (admin) |
| Notifications | list, unread-count, mark-read, read-all |
| Tours | slots, book, my-bookings, cancel, admin slot mgmt |
| Chat | conversations, messages, mark-read |
| Applications | submit, my, all (admin), status update (admin) |
| Recommendations | personalized |
| Admin | dashboard, users, user status |
| WebSocket | real-time notifications, chat |

---

## 9. Frontend Pages

| Route | Page | Access |
|-------|------|--------|
| `/` | Landing | Public |
| `/login` | Login | Public |
| `/signup` | Signup | Public |
| `/forgot-password` | Forgot Password | Public |
| `/reset-password` | Reset Password | Public |
| `/search` | Property Search | Renter |
| `/property/:id` | Property Detail | Renter |
| `/favorites` | Favorites | Renter |
| `/inquiries` | My Inquiries | Renter |
| `/profile` | Profile | Renter |
| `/recommendations` | Recommendations | Renter |
| `/saved-searches` | Saved Searches | Renter |
| `/map-search` | Map Search | Renter |
| `/tours` | My Tours | Renter |
| `/messages` | Messages | Renter |
| `/applications` | My Applications | Renter |
| `/applications/new/:propertyId` | Application Form | Renter |
| `/admin/dashboard` | Admin Dashboard | Admin |
| `/admin/properties` | Admin Properties | Admin |
| `/admin/properties/new` | Property Form | Admin |
| `/admin/properties/:id/edit` | Property Form | Admin |
| `/admin/inquiries` | Admin Inquiries | Admin |
| `/admin/users` | Admin Users | Admin |
| `/admin/reviews` | Admin Reviews | Admin |
| `/admin/tours` | Admin Tours | Admin |
| `/admin/applications` | Admin Applications | Admin |
| `/admin/messages` | Admin Messages | Admin |

---

## 10. Glossary

| Term | Definition |
|------|------------|
| **Property** | A rental listing with title, description, price, address, specs, amenities, photos |
| **Listing** | A published property visible in search results |
| **Renter** | A registered user who browses and interacts with properties |
| **Admin** | A system administrator with full management access |
| **Guest** | An unauthenticated visitor |
| **Inquiry** | A contact form submission about a property |
| **Favorites** | Saved/bookmarked properties |
| **Amenity** | A property feature (parking, gym, pool, etc.) |
| **Soft Delete** | Record marked deleted but kept in database |
| **Tour Slot** | Scheduled time window for property viewing |
| **Tour Booking** | Renter's reservation of a tour slot |
| **Conversation** | Message thread between renter and admin about a property |
| **Application** | Formal rental request with personal/employment info |
| **Saved Search** | Persisted search filters for re-use |
| **httpOnly Cookie** | Cookie inaccessible to JavaScript, stores JWT securely |

---

*Last Updated: 2026-06-09*
