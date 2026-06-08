import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as path from 'path';

const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASS = 'AdminPassword123!';
const RENTER_EMAIL = 'testuser@test.com';
const RENTER_PASS = 'TestPassword123!';

const ADMIN_ID = '00000000-0000-0000-0000-000000000001';
const RENTER_ID = '00000000-0000-0000-0000-000000000002';

async function seed() {
  const entitiesPath = path.join(__dirname, 'src/modules/**/entities/*.entity{.ts,.js}');

  const dataSource = new DataSource({
    type: 'sqlite',
    database: 'nestfind.sqlite',
    entities: [entitiesPath],
    synchronize: false,
  });

  await dataSource.initialize();

  // ─── USERS ────────────────────────────────────────────────────
  const adminExists = await dataSource.query(
    `SELECT 1 FROM users WHERE email = ?`, [ADMIN_EMAIL]
  );
  if (adminExists.length === 0) {
    const hashed = await bcrypt.hash(ADMIN_PASS, 10);
    await dataSource.query(
      `INSERT INTO users (id, name, email, password, phone, role, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [ADMIN_ID, 'Admin User', ADMIN_EMAIL, hashed, '(555) 000-0000', 'admin', 'active']
    );
    console.log('Created admin user:', ADMIN_EMAIL);
  } else {
    console.log('Admin user already exists');
  }

  const renterExists = await dataSource.query(
    `SELECT 1 FROM users WHERE email = ?`, [RENTER_EMAIL]
  );
  if (renterExists.length === 0) {
    const hashed = await bcrypt.hash(RENTER_PASS, 10);
    await dataSource.query(
      `INSERT INTO users (id, name, email, password, phone, role, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [RENTER_ID, 'Test Renter', RENTER_EMAIL, hashed, '(555) 123-4567', 'renter', 'active']
    );
    console.log('Created renter user:', RENTER_EMAIL);
  } else {
    console.log('Renter user already exists');
  }

  // ─── PROPERTIES ─────────────────────────────────────────────────
  const propRows = await dataSource.query(`SELECT id, title FROM properties LIMIT 10`);
  let propertyIds: string[] = propRows.map((r: any) => r.id);

  if (propertyIds.length < 5) {
    const newProperties = [
      ['985c1133-a970-4b3c-a605-bf2b8ced7e66', 'Modern Downtown Apartment', 'A beautiful modern apartment in the heart of downtown.', 2500.00, 2, 1, 950, 'apartment', '123 Market Street', 'San Francisco', 'CA', '94102', 37.7849, -122.4094, '2026-07-01'],
      ['11111111-1111-1111-1111-111111111111', 'Spacious Mission District Home', 'Large 4-bedroom home with a big backyard and garden.', 3200.00, 4, 3, 2400, 'house', '2845 Mission Street', 'San Francisco', 'CA', '94110', 37.7525, -122.4181, '2026-06-15'],
      ['22222222-2222-2222-2222-222222222222', 'Cozy Studio in Hayes Valley', 'Compact studio in the vibrant arts district.', 1450.00, 0, 1, 480, 'studio', '1024 Hayes Street', 'San Francisco', 'CA', '94102', 37.7739, -122.4312, '2026-06-01'],
      ['33333333-3333-3333-3333-333333333333', 'Luxury Condo in SOMA', 'Stunning condo with floor-to-ceiling windows and city views.', 4200.00, 2, 2, 1200, 'condo', '555 4th Street', 'San Francisco', 'CA', '94107', 37.7800, -122.4000, '2026-06-20'],
      ['44444444-4444-4444-4444-444444444444', 'Charming Victorian in Noe Valley', 'Classic Victorian with updated kitchen and private deck.', 3800.00, 3, 2, 1800, 'house', '388 Elizabeth Street', 'San Francisco', 'CA', '94114', 37.7500, -122.4330, '2026-07-01'],
      ['55555555-5555-5555-5555-555555555555', 'Trendy Townhouse in Dogpatch', 'Modern townhouse near the waterfront with garage.', 3600.00, 3, 2, 1600, 'townhouse', '901 Minnesota Street', 'San Francisco', 'CA', '94107', 37.7600, -122.3900, '2026-06-10'],
      ['66666666-6666-6666-6666-666666666666', 'Sunny 1BR in Castro', 'Bright one-bedroom with bay windows and hardwood floors.', 2100.00, 1, 1, 650, 'apartment', '2300 Market Street', 'San Francisco', 'CA', '94114', 37.7625, -122.4350, '2026-06-05'],
      ['77777777-7777-7777-7777-777777777777', 'Penthouse Suite in Financial District', 'Exclusive penthouse with panoramic views.', 6500.00, 2, 2, 1500, 'condo', '555 California Street', 'San Francisco', 'CA', '94104', 37.7930, -122.4000, '2026-07-15'],
      ['88888888-8888-8888-8888-888888888888', 'Quiet Studio near Golden Gate Park', 'Peaceful studio close to the park and museums.', 1650.00, 0, 1, 520, 'studio', '1230 9th Avenue', 'San Francisco', 'CA', '94122', 37.7650, -122.4670, '2026-06-01'],
      ['99999999-9999-9999-9999-999999999999', 'Family Home in Sunset District', 'Spacious 4BR near the beach with backyard.', 3400.00, 4, 2, 2100, 'house', '2340 Irving Street', 'San Francisco', 'CA', '94122', 37.7620, -122.4800, '2026-06-20'],
    ];
    for (const p of newProperties) {
      try {
        await dataSource.query(
          `INSERT INTO properties (id, title, description, price, bedrooms, bathrooms, square_feet, property_type, address_street, address_city, address_state, address_zip_code, address_latitude, address_longitude, available_from, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          p
        );
        propertyIds.push(String(p[0]));
      } catch (e: any) {
        const msg = String(e?.message || '');
        if (msg.includes('UNIQUE constraint failed')) {
          propertyIds.push(String(p[0]));
        } else {
          console.warn('Failed to insert property:', p[1], msg);
        }
      }
    }
    console.log(`Ensured ${propertyIds.length} properties exist`);
  } else {
    console.log(`${propertyIds.length} properties already exist`);
  }

  if (propertyIds.length === 0) {
    console.log('No properties available — skipping dependent data');
    await dataSource.destroy();
    console.log('\nSeed complete!');
    return;
  }

  const p1 = propertyIds[0];
  const p2 = propertyIds[1] || propertyIds[0];
  const p3 = propertyIds[2] || propertyIds[0];
  const p4 = propertyIds[3] || propertyIds[0];
  const p6 = propertyIds[5] || propertyIds[0];

  // ─── TOUR SLOTS ─────────────────────────────────────────────────
  const slotCount = await dataSource.query(`SELECT COUNT(*) as count FROM tour_slots`);
  if (slotCount[0].count === 0) {
    const slots = [
      ['slot-001', p1, ADMIN_ID, '2026-06-10 10:00:00', '2026-06-10 10:30:00', 'in_person', 0],
      ['slot-002', p1, ADMIN_ID, '2026-06-10 14:00:00', '2026-06-10 14:30:00', 'in_person', 0],
      ['slot-003', p2, ADMIN_ID, '2026-06-11 09:00:00', '2026-06-11 09:30:00', 'in_person', 0],
      ['slot-004', p2, ADMIN_ID, '2026-06-11 16:00:00', '2026-06-11 16:30:00', 'virtual', 0],
      ['slot-005', p3, ADMIN_ID, '2026-06-12 11:00:00', '2026-06-12 11:30:00', 'in_person', 0],
    ];
    for (const s of slots) {
      await dataSource.query(
        `INSERT INTO tour_slots (id, property_id, admin_id, start_time, end_time, tour_type, is_booked, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        s
      );
    }
    console.log(`Created ${slots.length} tour slots`);
  }

  // ─── PROPERTY REVIEWS ───────────────────────────────────────────
  const reviewCount = await dataSource.query(`SELECT COUNT(*) as count FROM property_reviews`);
  if (reviewCount[0].count === 0) {
    const reviews = [
      ['rev-001', p1, RENTER_ID, 5, 'Absolutely love it!', 'This apartment exceeded all expectations. Great location, modern amenities.', 0, 3, 'approved'],
      ['rev-002', p1, ADMIN_ID, 4, 'Good but pricey', 'Nice place but rent is a bit high for the area.', 0, 1, 'approved'],
      ['rev-003', p2, RENTER_ID, 5, 'Perfect family home', 'Spacious rooms, great backyard for kids.', 1, 5, 'approved'],
      ['rev-004', p3, RENTER_ID, 3, 'Small but functional', 'Good for one person. Kitchen is tiny.', 0, 0, 'pending'],
      ['rev-005', p4, RENTER_ID, 5, 'Luxury living', 'The views are incredible. Worth every penny.', 1, 2, 'approved'],
    ];
    for (const r of reviews) {
      await dataSource.query(
        `INSERT INTO property_reviews (id, property_id, user_id, rating, title, comment, is_verified, helpful_count, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        r
      );
    }
    console.log(`Created ${reviews.length} reviews`);
  }

  // ─── SAVED SEARCHES ─────────────────────────────────────────────
  const searchCount = await dataSource.query(`SELECT COUNT(*) as count FROM saved_searches`);
  if (searchCount[0].count === 0) {
    const searches = [
      ['ss-001', RENTER_ID, 'SF Apartments Under $3k', '', 0, 3000, 1, 'apartment', 'San Francisco', 1],
      ['ss-002', RENTER_ID, 'Mission 2BR+', 'Mission', 2000, 4000, 2, '', 'San Francisco', 1],
      ['ss-003', RENTER_ID, 'Houses in SF', '', 3000, 5000, 3, 'house', 'San Francisco', 0],
    ];
    for (const s of searches) {
      await dataSource.query(
        `INSERT INTO saved_searches (id, user_id, name, search_text, min_price, max_price, bedrooms, property_type, city, alert_enabled, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        s
      );
    }
    console.log(`Created ${searches.length} saved searches`);
  }

  // ─── PROPERTY VIEWS ───────────────────────────────────────────
  const viewCount = await dataSource.query(`SELECT COUNT(*) as count FROM property_views`);
  if (viewCount[0].count === 0) {
    const views = [
      ['pv-001', RENTER_ID, p1, 5, '2026-06-08 09:00:00'],
      ['pv-002', RENTER_ID, p2, 2, '2026-06-07 14:00:00'],
      ['pv-003', RENTER_ID, p3, 1, '2026-06-06 11:00:00'],
      ['pv-004', RENTER_ID, p4, 3, '2026-06-05 16:00:00'],
    ];
    for (const v of views) {
      await dataSource.query(
        `INSERT INTO property_views (id, user_id, property_id, view_count, last_viewed_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        v
      );
    }
    console.log(`Created ${views.length} property views`);
  }

  // ─── FAVORITES ──────────────────────────────────────────────────
  const favCount = await dataSource.query(`SELECT COUNT(*) as count FROM favorites`);
  if (favCount[0].count === 0) {
    const favorites = [
      ['fav-001', RENTER_ID, p1],
      ['fav-002', RENTER_ID, p4],
      ['fav-003', RENTER_ID, p6],
    ];
    for (const f of favorites) {
      await dataSource.query(
        `INSERT INTO favorites (id, user_id, property_id, created_at, updated_at)
         VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
        f
      );
    }
    console.log(`Created ${favorites.length} favorites`);
  }

  // ─── NOTIFICATIONS ──────────────────────────────────────────────
  const notifCount = await dataSource.query(`SELECT COUNT(*) as count FROM notifications`);
  if (notifCount[0].count === 0) {
    const notifications = [
      ['notif-001', RENTER_ID, 'new_listing', 'New listing in your saved search', 'A new apartment matching "SF Apartments Under $3k" was listed.', '{"savedSearchId":"ss-001"}', 0],
      ['notif-002', RENTER_ID, 'tour_reminder', 'Upcoming tour reminder', 'Your tour for Modern Downtown Apartment is tomorrow at 10:00 AM.', '{"tourId":"tour-001"}', 0],
      ['notif-003', RENTER_ID, 'application_update', 'Application status updated', 'Your rental application for Luxury Condo in SOMA is under review.', '{"applicationId":"app-001"}', 1],
      ['notif-004', RENTER_ID, 'message', 'New message from admin', 'Admin: "Thanks for your inquiry about the property."', '{"conversationId":"conv-001"}', 0],
    ];
    for (const n of notifications) {
      await dataSource.query(
        `INSERT INTO notifications (id, user_id, type, title, message, data, is_read, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        n
      );
    }
    console.log(`Created ${notifications.length} notifications`);
  }

  // ─── CHAT CONVERSATIONS ─────────────────────────────────────────
  const convCount = await dataSource.query(`SELECT COUNT(*) as count FROM chat_conversations`);
  if (convCount[0].count === 0) {
    await dataSource.query(
      `INSERT INTO chat_conversations (id, property_id, renter_id, admin_id, status, subject, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      ['conv-001', p1, RENTER_ID, ADMIN_ID, 'active', 'Question about Modern Downtown Apartment']
    );
    console.log('Created 1 chat conversation');
  }

  // ─── CHAT MESSAGES ──────────────────────────────────────────────
  const msgCount = await dataSource.query(`SELECT COUNT(*) as count FROM chat_messages`);
  if (msgCount[0].count === 0) {
    const messages = [
      ['msg-001', 'conv-001', RENTER_ID, 'renter', 'Hi, is this apartment pet-friendly?', 0],
      ['msg-002', 'conv-001', ADMIN_ID, 'admin', 'Yes, cats are welcome with a $300 deposit. Dogs under 25 lbs are also allowed.', 0],
      ['msg-003', 'conv-001', RENTER_ID, 'renter', 'Great! Can I schedule a tour for this weekend?', 0],
      ['msg-004', 'conv-001', ADMIN_ID, 'admin', 'Absolutely. I have slots available Saturday 10 AM and 2 PM.', 0],
    ];
    for (const m of messages) {
      await dataSource.query(
        `INSERT INTO chat_messages (id, conversation_id, sender_id, sender_role, content, is_read, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        m
      );
    }
    console.log(`Created ${messages.length} chat messages`);
  }

  // ─── RENTAL APPLICATIONS ────────────────────────────────────────
  const appCount = await dataSource.query(`SELECT COUNT(*) as count FROM rental_applications`);
  if (appCount[0].count === 0) {
    const applications = [
      ['app-001', p4, RENTER_ID, 'under_review', 8500.00, 'employed', 'TechCorp Inc.', '(555) 987-6543', '2026-07-01', 0, '', 'I really love this place and would like to move in on July 1st.'],
      ['app-002', p1, RENTER_ID, 'submitted', 6200.00, 'employed', 'StartupXYZ', '(555) 876-5432', '2026-06-15', 1, 'One small cat, fully declawed and vaccinated.', 'Flexible on move-in date.'],
    ];
    for (const a of applications) {
      await dataSource.query(
        `INSERT INTO rental_applications (id, property_id, applicant_id, status, monthly_income, employment_status, employer_name, employer_phone, move_in_date, has_pets, pet_details, additional_notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        a
      );
    }
    console.log(`Created ${applications.length} rental applications`);
  }

  // ─── TOUR BOOKINGS ──────────────────────────────────────────────
  const bookingCount = await dataSource.query(`SELECT COUNT(*) as count FROM tour_bookings`);
  if (bookingCount[0].count === 0) {
    const bookings = [
      ['tour-001', 'slot-001', RENTER_ID, p1, 'Looking forward to seeing the place!', 'confirmed'],
      ['tour-002', 'slot-003', RENTER_ID, p2, 'Bringing my partner to see it too.', 'confirmed'],
    ];
    for (const b of bookings) {
      await dataSource.query(
        `INSERT INTO tour_bookings (id, slot_id, user_id, property_id, notes, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        b
      );
    }
    console.log(`Created ${bookings.length} tour bookings`);
  }

  await dataSource.destroy();
  console.log('\nSeed complete!');
  console.log(`Users: ${ADMIN_EMAIL} / ${ADMIN_PASS}  |  ${RENTER_EMAIL} / ${RENTER_PASS}`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
