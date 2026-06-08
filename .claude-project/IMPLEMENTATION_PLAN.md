# NestFind: Renter Experience 2.0 — Implementation Plan

## Overview

This plan implements **all 3 phases** of renter-facing enhancements to bring NestFind to Zillow/Apartments.com parity:

| Phase | Theme | Priority | Features |
|-------|-------|----------|----------|
| **Phase 1** | Search & Discovery | Critical | Smart recommendations, Saved searches + alerts, Recently viewed, Map-based search |
| **Phase 2** | Trust & Content | High | Property reviews, Neighborhood insights, Share property, Virtual tours |
| **Phase 3** | Action & Conversion | High | Schedule tours, Direct messaging, Renter profiles, Applications |

**User priority:** Smart recommendations is the Phase 1 lead feature.
**Neighborhood insights:** Will use free Google Places API + placeholder scoring system.
**Calendar:** Simple in-house calendar (no external integrations).

---

## Phase 1: Search & Discovery (Weeks 1-3)

### 1.1 Smart Recommendations (Lead Feature)

**Goal:** Suggest properties based on user's favorites, search history, and behavioral signals.

**Algorithm (Simple & Effective):**
1. Collect user behavior: favorites, inquiries, viewed properties, search filters used
2. For a user, find properties that match:
   - Same property type as favorited properties
   - Similar price range (±20% of favorited average)
   - Same city/neighborhood as favorited/viewed
   - Similar amenities overlap
3. Exclude already viewed/favorited properties
4. Score and rank: higher score for more attribute matches
5. Return top 8-12 recommendations

**Database Changes:**

```sql
-- New table: property_views (tracks what renters viewed)
CREATE TABLE property_views (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  view_count integer NOT NULL DEFAULT 1,
  last_viewed_at timestamp NOT NULL DEFAULT now(),
  created_at timestamp NOT NULL DEFAULT now(),
  UNIQUE(user_id, property_id)
);

CREATE INDEX idx_property_views_user ON property_views(user_id);
CREATE INDEX idx_property_views_property ON property_views(property_id);
CREATE INDEX idx_property_views_last_viewed ON property_views(last_viewed_at);
```

**Backend — New Module: `recommendations/`**

| File | Purpose |
|------|---------|
| `src/modules/recommendations/entities/recommendation-signal.entity.ts` | Stores user behavior signals (view, favorite, inquiry, search) |
| `src/modules/recommendations/recommendation.repository.ts` | Custom queries for recommendation scoring |
| `src/modules/recommendations/recommendation.service.ts` | Scoring algorithm + orchestration |
| `src/modules/recommendations/recommendation.controller.ts` | `GET /api/recommendations` endpoint |
| `src/modules/recommendations/recommendation.module.ts` | NestJS module |
| `src/modules/recommendations/dto/recommendation-response.dto.ts` | Response DTO |

**API Endpoint:**

```
GET /api/recommendations
Auth: Required (Renter)
Query: ?limit=12

Response:
{
  "statusCode": 200,
  "data": {
    "items": [ { ...property fields... } ],
    "meta": { "total": 12 }
  }
}
```

**Frontend — New Screen:**

| File | Purpose |
|------|---------|
| `frontend/app/pages/renter/recommendations.tsx` | "Recommended For You" page |
| `frontend/app/services/api/recommendationService.ts` | `getRecommendations()` API call |
| `frontend/app/components/shared/RecommendationCard.tsx` | Horizontal card with "Why recommended" badge |
| `frontend/app/components/shared/RecommendationSection.tsx` | Section component for embedding on landing page |

**Integration Points:**
- Track property views: Call `POST /api/properties/:id/view` when detail page loads
- Landing page: Show "Recommended For You" section (auth required, otherwise hide)
- Search page: Sidebar "You might also like" section

---

### 1.2 Saved Searches + Email Alerts

**Goal:** Renters save filter combinations; new matching properties trigger alerts.

**Database Changes:**

```sql
-- New table: saved_searches
CREATE TABLE saved_searches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name varchar(100) NOT NULL,
  search_text varchar(200),
  min_price decimal(10,2),
  max_price decimal(10,2),
  bedrooms integer,
  property_type varchar(50),
  city varchar(100),
  alert_enabled boolean NOT NULL DEFAULT true,
  last_alerted_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);
```

**Backend — New Module: `saved-searches/`**

| File | Purpose |
|------|---------|
| `src/modules/saved-searches/entities/saved-search.entity.ts` | Entity definition |
| `src/modules/saved-searches/saved-search.repository.ts` | CRUD + matching queries |
| `src/modules/saved-searches/saved-search.service.ts` | Business logic + alert matching |
| `src/modules/saved-searches/saved-search.controller.ts` | CRUD endpoints |
| `src/modules/saved-searches/saved-search.module.ts` | NestJS module |
| `src/modules/saved-searches/dto/` | Create/Update DTOs |

**API Endpoints:**

```
GET    /api/saved-searches          — List user's saved searches
POST   /api/saved-searches          — Save a new search
PATCH  /api/saved-searches/:id      — Update (rename, toggle alerts)
DELETE /api/saved-searches/:id      — Remove saved search
GET    /api/saved-searches/:id/properties — Get matching properties right now
```

**Frontend — New Screens:**

| File | Purpose |
|------|---------|
| `frontend/app/pages/renter/saved-searches.tsx` | Manage saved searches list |
| `frontend/app/components/modals/SaveSearchModal.tsx` | Modal from search page to save current filters |
| `frontend/app/services/api/savedSearchService.ts` | API methods |
| `frontend/app/redux/features/savedSearchSlice.ts` | Redux slice |

---

### 1.3 Recently Viewed Properties

**Goal:** Quick return to properties the renter has visited.

**Implementation:**
- Uses the `property_views` table from §1.1
- Frontend stores last 20 viewed IDs in sessionStorage as fallback

**Backend Endpoints:**

```
GET /api/properties/recently-viewed
Auth: Required
Response: Paginated list of properties with `viewedAt` timestamp
```

**Frontend:**

| File | Purpose |
|------|---------|
| `frontend/app/components/shared/RecentlyViewedStrip.tsx` | Horizontal scroll strip (shown on landing + search) |
| `frontend/app/services/api/propertyService.ts` | Add `getRecentlyViewed()` method |
| `frontend/app/hooks/api/useRecentlyViewed.ts` | React Query hook (or direct fetch) |

---

### 1.4 Map-Based Property Search

**Goal:** Interactive map view with property pins, allowing spatial exploration.

**Technical Approach:**
- Leverage existing Google Maps integration
- Show pins for properties in current viewport
- Cluster pins when zoomed out
- Click pin → property card popup → navigate to detail

**Backend Endpoints:**

```
GET /api/properties/map-search
Query: ?northLat=..., ?southLat=..., ?eastLng=..., ?westLng=..., ?filters=...
Response: { items: [ { id, title, price, latitude, longitude, thumbnailUrl } ] }
```

**Frontend:**

| File | Purpose |
|------|---------|
| `frontend/app/pages/renter/map-search.tsx` | Full-page map search |
| `frontend/app/components/map/PropertyMap.tsx` | Google Map with markers + clusters |
| `frontend/app/components/map/PropertyMapPopup.tsx` | InfoWindow card on pin click |
| `frontend/app/components/map/MapToggle.tsx` | "List View / Map View" toggle button |

---

## Phase 2: Trust & Decision Making (Weeks 4-6)

### 2.1 Property Reviews & Ratings

**Goal:** Renters leave 1-5 star ratings + text reviews; builds social proof.

**Database Changes:**

```sql
-- New table: property_reviews
CREATE TABLE property_reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title varchar(200),
  comment text NOT NULL,
  is_verified boolean NOT NULL DEFAULT false, -- verified if user inquired/visited
  helpful_count integer NOT NULL DEFAULT 0,
  status varchar(50) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  UNIQUE(property_id, user_id)
);

CREATE INDEX idx_property_reviews_property ON property_reviews(property_id);
CREATE INDEX idx_property_reviews_user ON property_reviews(user_id);
CREATE INDEX idx_property_reviews_status ON property_reviews(status);
```

**Backend — New Module: `reviews/`**

| File | Purpose |
|------|---------|
| `src/modules/reviews/entities/property-review.entity.ts` | Entity |
| `src/modules/reviews/review.repository.ts` | Custom queries (avg rating, approved list) |
| `src/modules/reviews/review.service.ts` | Submit, approve, calculate averages |
| `src/modules/reviews/review.controller.ts` | CRUD + helpful vote endpoints |
| `src/modules/reviews/review.module.ts` | NestJS module |
| `src/modules/reviews/dto/` | CreateReviewDto, UpdateReviewStatusDto |

**API Endpoints:**

```
GET    /api/properties/:id/reviews          — List approved reviews + avg rating
POST   /api/properties/:id/reviews          — Submit a review (renter only)
PATCH  /api/reviews/:id/helpful              — Mark review as helpful (increment)
GET    /api/admin/reviews                    — Admin: list pending reviews
PATCH  /api/admin/reviews/:id/status         — Admin: approve/reject
```

**Frontend:**

| File | Purpose |
|------|---------|
| `frontend/app/components/shared/ReviewCard.tsx` | Individual review display |
| `frontend/app/components/shared/ReviewSection.tsx` | Section with list + summary |
| `frontend/app/components/shared/ReviewForm.tsx` | Star rating + comment form |
| `frontend/app/components/shared/RatingStars.tsx` | Reusable star rating display |
| `frontend/app/pages/admin/reviews.tsx` | Admin review moderation page |

---

### 2.2 Neighborhood Insights

**Goal:** Show nearby amenities, walkability, transit, and area character without expensive APIs.

**Approach:**
- Use **Google Places API** (free tier: $200 credit/month) for nearby places
- Build simple **scoring algorithm** (placeholder for paid APIs like Walk Score):
  - Walkability: Count of nearby amenities within 0.5mi radius
  - Transit: Count of transit stations within 1mi
  - Schools: Count of schools within 2mi
  - Safety: Placeholder score (can integrate real API later)

**Backend — No new module; extend PropertyService:**

```
GET /api/properties/:id/neighborhood
Response:
{
  "walkability": { "score": 78, "nearbyAmenities": [...] },
  "transit": { "score": 65, "stations": [...] },
  "schools": { "count": 5, "topRated": [...] },
  "nearbyPlaces": [ { "name", "type", "distance", "rating" } ]
}
```

**Frontend:**

| File | Purpose |
|------|---------|
| `frontend/app/components/shared/NeighborhoodInsights.tsx` | Tabbed section on property detail |
| `frontend/app/components/shared/WalkScoreBadge.tsx` | Visual score badge |
| `frontend/app/components/shared/NearbyPlacesList.tsx` | List of nearby restaurants, shops, etc. |

---

### 2.3 Share Property

**Goal:** One-click sharing via copy link, email, or social.

**Backend:**
- No backend changes needed (just use existing property URLs)
- Optional: `POST /api/properties/:id/share` to track share events

**Frontend:**

| File | Purpose |
|------|---------|
| `frontend/app/components/shared/ShareButton.tsx` | Button with dropdown (Copy Link, Email, Facebook, Twitter) |
| `frontend/app/components/modals/SharePropertyModal.tsx` | Modal with share options + preview |

---

### 2.4 Virtual Tours / Video Support

**Goal:** Allow admins to upload video walkthroughs; renters view inline.

**Backend Changes:**
- Extend `PropertyPhoto` entity or create `PropertyVideo` entity
- Support video upload (MP4, WebM, max 100MB)
- Store with thumbnail preview

```sql
-- New table: property_videos
CREATE TABLE property_videos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url varchar(500) NOT NULL,
  thumbnail_url varchar(500),
  title varchar(200),
  duration_seconds integer,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now()
);
```

**Frontend:**

| File | Purpose |
|------|---------|
| `frontend/app/components/shared/VideoPlayer.tsx` | HTML5 video player with poster |
| `frontend/app/components/shared/PropertyMediaGallery.tsx` | Combined photo + video gallery |

---

## Phase 3: Action & Conversion (Weeks 7-10)

### 3.1 Schedule Property Tours

**Goal:** In-house calendar booking for property tours (in-person or virtual).

**Database Changes:**

```sql
-- New table: tour_slots (admin defines available slots)
CREATE TABLE tour_slots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL REFERENCES users(id),
  start_time timestamp NOT NULL,
  end_time timestamp NOT NULL,
  tour_type varchar(50) NOT NULL DEFAULT 'in_person', -- in_person, virtual
  is_booked boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now()
);

-- New table: tour_bookings
CREATE TABLE tour_bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_id uuid NOT NULL REFERENCES tour_slots(id),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  notes text,
  status varchar(50) NOT NULL DEFAULT 'confirmed', -- confirmed, completed, cancelled, no_show
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  UNIQUE(slot_id)
);

CREATE INDEX idx_tour_slots_property ON tour_slots(property_id);
CREATE INDEX idx_tour_slots_time ON tour_slots(start_time);
CREATE INDEX idx_tour_bookings_user ON tour_bookings(user_id);
CREATE INDEX idx_tour_bookings_property ON tour_bookings(property_id);
```

**Backend — New Module: `tours/`**

| File | Purpose |
|------|---------|
| `src/modules/tours/entities/tour-slot.entity.ts` | Available time slots |
| `src/modules/tours/entities/tour-booking.entity.ts` | Booked tours |
| `src/modules/tours/tour.repository.ts` | Slot/booking queries |
| `src/modules/tours/tour.service.ts` | Booking logic, conflict detection |
| `src/modules/tours/tour.controller.ts` | CRUD endpoints |
| `src/modules/tours/tour.module.ts` | NestJS module |

**API Endpoints:**

```
GET    /api/properties/:id/tour-slots         — Available slots for property
POST   /api/tours/book                        — Book a slot
GET    /api/tours/my-bookings                 — Renter's booked tours
PATCH  /api/tours/:id/cancel                  — Cancel a booking
GET    /api/admin/tours                       — Admin: all bookings calendar
POST   /api/admin/tours/slots                 — Admin: create available slots
DELETE /api/admin/tours/slots/:id             — Admin: remove slot
```

**Frontend:**

| File | Purpose |
|------|---------|
| `frontend/app/components/shared/TourBookingWidget.tsx` | Inline calendar + time picker |
| `frontend/app/components/shared/TourCalendar.tsx` | Calendar grid with available slots |
| `frontend/app/pages/renter/my-tours.tsx` | "My Scheduled Tours" page |
| `frontend/app/pages/admin/tours.tsx` | Admin booking calendar + slot management |
| `frontend/app/components/shared/TourTypeSelector.tsx` | "In-Person / Virtual" toggle |

---

### 3.2 Direct Messaging (Real-time Chat)

**Goal:** Replace static inquiry form with instant chat between renters and admins.

**Leverages:** Existing WebSocket gateway (`websocket.gateway.ts`)

**Database Changes:**

```sql
-- New table: chat_conversations
CREATE TABLE chat_conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  renter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status varchar(50) NOT NULL DEFAULT 'active', -- active, closed, archived
  subject varchar(200),
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

-- New table: chat_messages
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_role varchar(50) NOT NULL, -- renter, admin
  content text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_conversations_renter ON chat_conversations(renter_id);
CREATE INDEX idx_chat_conversations_admin ON chat_conversations(admin_id);
CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);
```

**Backend — New Module: `chat/`**

| File | Purpose |
|------|---------|
| `src/modules/chat/entities/chat-conversation.entity.ts` | Conversation entity |
| `src/modules/chat/entities/chat-message.entity.ts` | Message entity |
| `src/modules/chat/chat.repository.ts` | Message/conversation queries |
| `src/modules/chat/chat.service.ts` | Message history, unread counts |
| `src/modules/chat/chat.controller.ts` | REST endpoints (history, mark read) |
| `src/modules/chat/chat.gateway.ts` | WebSocket handlers for real-time messaging |
| `src/modules/chat/chat.module.ts` | NestJS module |

**API Endpoints:**

```
GET    /api/chat/conversations                — List user's conversations
POST   /api/chat/conversations                — Start new conversation
GET    /api/chat/conversations/:id/messages   — Get message history
POST   /api/chat/conversations/:id/messages   — Send message (REST fallback)
PATCH  /api/chat/messages/:id/read            — Mark message as read
GET    /api/chat/unread-count                 — Get total unread count
```

**WebSocket Events:**

```
Client → Server: 'sendMessage'    { conversationId, content }
Server → Client: 'newMessage'     { conversationId, message }
Server → Client: 'typing'         { conversationId, userId }
```

**Frontend:**

| File | Purpose |
|------|---------|
| `frontend/app/components/chat/ChatWindow.tsx` | Floating chat window (like Intercom) |
| `frontend/app/components/chat/ChatMessage.tsx` | Individual message bubble |
| `frontend/app/components/chat/ChatConversationList.tsx` | Sidebar list of conversations |
| `frontend/app/components/chat/ChatInput.tsx` | Message input with typing indicator |
| `frontend/app/components/chat/ChatNotificationBadge.tsx` | Navbar unread badge |
| `frontend/app/services/socketService.ts` | Extend with chat events |
| `frontend/app/pages/renter/messages.tsx` | Full-page message inbox |
| `frontend/app/pages/admin/messages.tsx` | Admin message center |

---

### 3.3 Renter Profile & Preferences

**Goal:** Richer renter profiles with preferences for better recommendations and verified renter badges.

**Database Changes (extend `users` table):**

```sql
-- Add columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_property_types text[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS min_price decimal(10,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS max_price decimal(10,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_bedrooms integer;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_locations text[]; -- cities
ALTER TABLE users ADD COLUMN IF NOT EXISTS move_in_date date;
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_pets boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false;
```

**Backend:**
- Extend `UserService` with preference methods
- Extend `ProfileController`/`ProfileService` with preference endpoints

**API Endpoints:**

```
GET    /api/users/me/preferences              — Get preferences
PATCH  /api/users/me/preferences              — Update preferences
GET    /api/users/me/stats                    — Favorites count, inquiries count, tours count
```

**Frontend:**

| File | Purpose |
|------|---------|
| `frontend/app/pages/renter/profile-setup.tsx` | Step-by-step preference wizard (post-register) |
| `frontend/app/pages/profile.tsx` — extend | Add Preferences tab |
| `frontend/app/components/shared/PreferenceChips.tsx` | Visual preference display |
| `frontend/app/components/shared/ProfileCompletionBar.tsx` | "Complete your profile" progress bar |

---

### 3.4 Rental Application System

**Goal:** Submit formal rental applications with documents and income verification.

**Database Changes:**

```sql
-- New table: rental_applications
CREATE TABLE rental_applications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  applicant_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status varchar(50) NOT NULL DEFAULT 'submitted', -- submitted, under_review, approved, rejected, withdrawn
  monthly_income decimal(10,2),
  employment_status varchar(50), -- employed, self_employed, student, unemployed, retired
  employer_name varchar(200),
  employer_phone varchar(20),
  move_in_date date,
  has_pets boolean DEFAULT false,
  pet_details text,
  additional_notes text,
  submitted_at timestamp NOT NULL DEFAULT now(),
  reviewed_at timestamp,
  reviewed_by uuid REFERENCES users(id),
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

-- New table: application_documents
CREATE TABLE application_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id uuid NOT NULL REFERENCES rental_applications(id) ON DELETE CASCADE,
  document_type varchar(50) NOT NULL, -- id_proof, pay_stub, bank_statement, reference_letter, other
  file_url varchar(500) NOT NULL,
  file_name varchar(200) NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_rental_applications_applicant ON rental_applications(applicant_id);
CREATE INDEX idx_rental_applications_property ON rental_applications(property_id);
CREATE INDEX idx_rental_applications_status ON rental_applications(status);
```

**Backend — New Module: `applications/`**

| File | Purpose |
|------|---------|
| `src/modules/applications/entities/rental-application.entity.ts` | Application entity |
| `src/modules/applications/entities/application-document.entity.ts` | Document entity |
| `src/modules/applications/application.repository.ts` | CRUD + status queries |
| `src/modules/applications/application.service.ts` | Submission, status workflow |
| `src/modules/applications/application.controller.ts` | CRUD endpoints |
| `src/modules/applications/application.module.ts` | NestJS module |

**API Endpoints:**

```
POST   /api/applications                    — Submit application
GET    /api/applications/my                 — My submitted applications
GET    /api/applications/:id                — Application detail
PATCH  /api/applications/:id/withdraw       — Withdraw application
GET    /api/admin/applications              — Admin: list all applications
PATCH  /api/admin/applications/:id/status   — Admin: update status
GET    /api/admin/applications/:id          — Admin: view application detail
```

**Frontend:**

| File | Purpose |
|------|---------|
| `frontend/app/pages/renter/application-form.tsx` | Multi-step application form |
| `frontend/app/pages/renter/my-applications.tsx` | Track application status |
| `frontend/app/pages/admin/applications.tsx` | Admin application review list |
| `frontend/app/pages/admin/application-detail.tsx` | Admin review page with documents |
| `frontend/app/components/shared/ApplicationStatusBadge.tsx` | Visual status badge |
| `frontend/app/components/shared/DocumentUploader.tsx` | Multi-file upload with type selection |

---

## Cross-Cutting Concerns

### Notifications System

A lightweight notification system needed for alerts, chat, and application updates.

```sql
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type varchar(50) NOT NULL, -- new_property_match, inquiry_response, tour_reminder, chat_message, application_update
  title varchar(200) NOT NULL,
  message text NOT NULL,
  data jsonb, -- arbitrary payload
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
```

**Endpoints:**
```
GET    /api/notifications
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all
GET    /api/notifications/unread-count
```

**WebSocket:** `notification` event pushed to user room.

**Frontend:** Notification bell in navbar with dropdown.

---

## New Frontend Routes

Add to `frontend/app/routes/renter.routes.ts`:

```typescript
route('recommendations', 'pages/renter/recommendations.tsx'),
route('saved-searches', 'pages/renter/saved-searches.tsx'),
route('map-search', 'pages/renter/map-search.tsx'),
route('recently-viewed', 'pages/renter/recently-viewed.tsx'),
route('messages', 'pages/renter/messages.tsx'),
route('tours', 'pages/renter/my-tours.tsx'),
route('applications', 'pages/renter/my-applications.tsx'),
route('applications/new/:propertyId', 'pages/renter/application-form.tsx'),
```

Add to `frontend/app/routes/admin.routes.ts`:

```typescript
route('reviews', 'pages/admin/reviews.tsx'),
route('tours', 'pages/admin/tours.tsx'),
route('applications', 'pages/admin/applications.tsx'),
route('applications/:id', 'pages/admin/application-detail.tsx'),
route('messages', 'pages/admin/messages.tsx'),
```

---

## New Backend Modules Registration

Update `app.module.ts` to include:

```typescript
RecommendationModule,
SavedSearchModule,
ReviewModule,
TourModule,
ChatModule,
ApplicationModule,
NotificationModule,
```

---

## Implementation Order (Suggested)

### Week 1: Phase 1 Foundation
1. Create `property_views` table
2. Implement view tracking on property detail page
3. Build Smart Recommendations backend (scoring algorithm)
4. Build Smart Recommendations frontend (page + landing section)

### Week 2: Phase 1 Continuation
5. Saved Searches backend (CRUD + matching logic)
6. Saved Searches frontend (save modal + management page)
7. Recently Viewed frontend strip

### Week 3: Phase 1 Completion
8. Map Search backend (viewport-based query)
9. Map Search frontend (Google Maps integration)

### Week 4: Phase 2 Start
10. Property Reviews backend (entity + CRUD)
11. Property Reviews frontend (cards + form + admin moderation)
12. Share Property component (no backend needed)

### Week 5: Phase 2 Continuation
13. Neighborhood Insights (Google Places integration)
14. Video upload support (extend photo system)

### Week 6: Phase 2 Completion
15. Notification system (shared across all features)
16. Property detail page updates (add all new sections)

### Week 7: Phase 3 Start
17. Tour system backend (slots + bookings)
18. Tour calendar frontend (booking widget + admin calendar)

### Week 8: Phase 3 Continuation
19. Chat system backend (entities + WebSocket gateway)
20. Chat frontend (floating window + inbox pages)

### Week 9: Phase 3 Continuation
21. Renter preferences backend (extend user entity)
22. Renter preferences frontend (profile wizard + settings)

### Week 10: Phase 3 Completion
23. Rental Applications backend
24. Rental Applications frontend
25. Admin dashboard updates (show all new metrics)

---

## Files to Create (Summary)

### Backend (NestJS Modules)
```
backend/src/modules/
├── recommendations/
│   ├── entities/recommendation-signal.entity.ts
│   ├── recommendation.repository.ts
│   ├── recommendation.service.ts
│   ├── recommendation.controller.ts
│   ├── recommendation.module.ts
│   └── dto/
├── saved-searches/
│   ├── entities/saved-search.entity.ts
│   ├── saved-search.repository.ts
│   ├── saved-search.service.ts
│   ├── saved-search.controller.ts
│   ├── saved-search.module.ts
│   └── dto/
├── reviews/
│   ├── entities/property-review.entity.ts
│   ├── review.repository.ts
│   ├── review.service.ts
│   ├── review.controller.ts
│   ├── review.module.ts
│   └── dto/
├── tours/
│   ├── entities/tour-slot.entity.ts
│   ├── entities/tour-booking.entity.ts
│   ├── tour.repository.ts
│   ├── tour.service.ts
│   ├── tour.controller.ts
│   ├── tour.module.ts
│   └── dto/
├── chat/
│   ├── entities/chat-conversation.entity.ts
│   ├── entities/chat-message.entity.ts
│   ├── chat.repository.ts
│   ├── chat.service.ts
│   ├── chat.controller.ts
│   ├── chat.gateway.ts
│   ├── chat.module.ts
│   └── dto/
├── applications/
│   ├── entities/rental-application.entity.ts
│   ├── entities/application-document.entity.ts
│   ├── application.repository.ts
│   ├── application.service.ts
│   ├── application.controller.ts
│   ├── application.module.ts
│   └── dto/
└── notifications/
    ├── entities/notification.entity.ts
    ├── notification.repository.ts
    ├── notification.service.ts
    ├── notification.controller.ts
    ├── notification.module.ts
    └── dto/
```

### Frontend (React Pages)
```
frontend/app/pages/
├── renter/
│   ├── recommendations.tsx
│   ├── saved-searches.tsx
│   ├── map-search.tsx
│   ├── recently-viewed.tsx
│   ├── messages.tsx
│   ├── my-tours.tsx
│   ├── my-applications.tsx
│   └── application-form.tsx
├── admin/
│   ├── reviews.tsx
│   ├── tours.tsx
│   ├── applications.tsx
│   ├── application-detail.tsx
│   └── messages.tsx
```

### Frontend (Components)
```
frontend/app/components/
├── shared/
│   ├── RecommendationCard.tsx
│   ├── RecommendationSection.tsx
│   ├── RecentlyViewedStrip.tsx
│   ├── ReviewCard.tsx
│   ├── ReviewSection.tsx
│   ├── ReviewForm.tsx
│   ├── RatingStars.tsx
│   ├── NeighborhoodInsights.tsx
│   ├── WalkScoreBadge.tsx
│   ├── NearbyPlacesList.tsx
│   ├── ShareButton.tsx
│   ├── VideoPlayer.tsx
│   ├── PropertyMediaGallery.tsx
│   ├── TourBookingWidget.tsx
│   ├── TourCalendar.tsx
│   ├── TourTypeSelector.tsx
│   ├── ChatWindow.tsx
│   ├── ChatMessage.tsx
│   ├── ChatConversationList.tsx
│   ├── ChatInput.tsx
│   ├── ChatNotificationBadge.tsx
│   ├── ApplicationStatusBadge.tsx
│   ├── DocumentUploader.tsx
│   ├── PreferenceChips.tsx
│   ├── ProfileCompletionBar.tsx
│   ├── NotificationBell.tsx
│   └── NotificationDropdown.tsx
├── map/
│   ├── PropertyMap.tsx
│   ├── PropertyMapPopup.tsx
│   └── MapToggle.tsx
└── modals/
    ├── SaveSearchModal.tsx
    └── SharePropertyModal.tsx
```

### Frontend (Services)
```
frontend/app/services/api/
├── recommendationService.ts
├── savedSearchService.ts
├── reviewService.ts
├── tourService.ts
├── chatService.ts
├── applicationService.ts
└── notificationService.ts
```

### Frontend (Redux Slices)
```
frontend/app/redux/features/
├── recommendationSlice.ts
├── savedSearchSlice.ts
├── reviewSlice.ts
├── tourSlice.ts
├── chatSlice.ts
├── applicationSlice.ts
└── notificationSlice.ts
```

---

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **Recommendation scoring in SQL** | Simple weighted attribute matching; can migrate to ML later |
| **Google Places for neighborhood** | Free tier sufficient; easy to swap for Walk Score API later |
| **WebSocket for chat** | Already have gateway; minimal incremental work |
| **In-house calendar** | No external dependencies; full control over UX |
| **Notifications table** | Enables both in-app and future email/push expansion |
| **Soft delete on reviews** | Consistent with project pattern; allows admin moderation |
| **Document upload reuse** | Reuse existing photo upload pattern for applications |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| **10-week timeline too long** | Phase 1 delivers immediate value; can ship after Phase 1 |
| **Google Places API limits** | Implement caching layer; fallback to static neighborhood data |
| **WebSocket scaling** | Current room-based approach works for <10k concurrent users |
| **Recommendation accuracy** | Start simple; add ML pipeline later without schema changes |
| **Admin overwhelmed with new features** | Build admin pages in parallel with renter features |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Property detail page views → favorites conversion | +25% |
| Average session duration | +40% |
| Return visitor rate | +30% |
| Inquiry → tour booking rate | +50% (from chat + tours) |
| Admin response time to inquiries | -60% (from chat) |

---

*Plan Version: 1.0*
*Estimated Total Effort: 10 weeks (full-time developer)*
*Priority: Phase 1 → Phase 2 → Phase 3*
*Lead Feature: Smart Recommendations (Phase 1)*
