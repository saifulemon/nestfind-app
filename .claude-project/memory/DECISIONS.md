# Architecture Decisions — nestfind

## 2026-06-08: Renter Experience 2.0 Implementation

### Decision: In-House Recommendation Engine (SQL-Based)

**Context:** Need to generate personalized property recommendations for renters.

**Options Considered:**
1. ML-based recommendation service (separate microservice)
2. SQL-based weighted scoring algorithm
3. Third-party recommendation API

**Decision:** Option 2 — SQL-based weighted scoring in the existing backend.

**Rationale:**
- Simpler to implement and maintain
- No additional infrastructure or dependencies
- No schema changes needed if we switch to ML later
- Sufficient for MVP; can be replaced with ML as data grows

**Trade-offs:**
- Less sophisticated than ML collaborative filtering
- Scoring is heuristic-based, not learned from user behavior patterns

---

### Decision: SQLite-Compatible Types

**Context:** Development database is SQLite. New entities used PostgreSQL-specific types.

**Problem:** `timestamp` and `jsonb` types are not supported by SQLite.

**Fix:**
- `type: 'timestamp'` → `type: 'datetime'`
- `type: 'jsonb'` → `type: 'simple-json'`

**Rationale:** SQLite is the dev database. TypeORM handles `simple-json` by serializing to TEXT, which works across all databases.

---

### Decision: Extend BaseRepository with createQueryBuilder()

**Context:** Map search and recommendation queries need custom SQL (viewport bounds, weighted scoring).

**Problem:** `BaseRepository` did not expose TypeORM's `createQueryBuilder()`.

**Fix:** Added `createQueryBuilder(alias?: string)` method to `BaseRepository` that returns `this.repository.createQueryBuilder(alias)`.

**Rationale:**
- Maintains the 4-layer architecture
- Custom queries stay in repositories, not services
- Minimal change to base class

---

### Decision: Chat Uses Existing WebSocket Gateway Pattern

**Context:** Need real-time chat messaging.

**Decision:** Created a new `ChatGateway` extending the existing `NestfindGateway` pattern, with a `chat` namespace.

**Rationale:**
- Consistent with existing WebSocket architecture
- Reuses `JwtModule` and `WebsocketModule` patterns
- Can be merged with main gateway later if needed

**Trade-offs:**
- Separate namespace means separate connection (or multiplexing on client)
- Slightly more complex client-side connection management

---

### Decision: No External Calendar Integration for Tours

**Context:** Tour booking system needs to manage time slots.

**Decision:** Built in-house tour slot and booking tables instead of integrating Google Calendar or Calendly.

**Rationale:**
- No external API dependencies or API keys needed
- Full control over data model and business logic
- Simpler to test and debug

**Trade-offs:**
- No calendar sync for property managers
- No automatic reminders via external calendar systems

---

### Decision: Google Places API for Neighborhood Insights (Stubbed)

**Context:** Phase 2 includes "Neighborhood Insights" feature using Google Places API.

**Decision:** Added API endpoint structure and frontend page, but stubbed the actual Places API integration.

**Rationale:**
- Requires Google Places API key and billing setup
- Can be enabled later without structural changes
- Frontend page and backend endpoint are ready

---

*Last Updated: 2026-06-08*
