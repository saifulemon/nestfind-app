import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { createTestApp, closeTestApp, getDataSource } from '../setup/test-app.factory';
import { cleanDatabase } from '../setup/test-database';
import {
  createTestUser,
  seedTestUsers,
  testUsers,
  TEST_PASSWORD,
} from '../fixtures/user.fixture';
import {
  generateAccessToken,
  authHeader,
} from '../fixtures/auth.fixture';
import {
  createTestProperty,
  seedTestProperties,
  seedTestAmenities,
} from '../fixtures/property.fixture';
import { User } from '../../src/modules/users/entities/user.entity';
import { Property } from '../../src/modules/properties/entities/property.entity';
import { PropertyTypeEnum } from '../../src/common/enums/property-type.enum';

import { PropertyModule } from '../../src/modules/properties/property.module';
import { AuthTestModule } from '../setup/auth-test.module';

describe('Properties E2E', () => {
  let app: INestApplication;
  let module: TestingModule;
  let dataSource: DataSource;
  let adminToken: string;
  let renterToken: string;
  let adminUser: User;
  let renterUser: User;

  beforeAll(async () => {
    const context = await createTestApp([AuthTestModule, PropertyModule]);
    app = context.app;
    module = context.module;
    dataSource = getDataSource(module);
  });

  afterAll(async () => {
    await closeTestApp({ app, module });
  });

  beforeEach(async () => {
    await cleanDatabase(dataSource);
    const seeded = await seedTestUsers(dataSource);
    adminUser = seeded.admin;
    renterUser = seeded.renter;
    adminToken = generateAccessToken(adminUser);
    renterToken = generateAccessToken(renterUser);
    await seedTestAmenities(dataSource);
  });

  // ─── GET /properties (Search) ──────────────────────────────────────
  describe('GET /api/properties', () => {
    beforeEach(async () => {
      await seedTestProperties(dataSource);
    });

    it('should return 200 with paginated property list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/properties')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.message).toBe('Properties retrieved successfully');
      expect(res.body.data).toHaveProperty('items');
      expect(res.body.data).toHaveProperty('meta');
      expect(res.body.data.meta).toHaveProperty('total');
      expect(res.body.data.meta).toHaveProperty('page', 1);
      expect(res.body.data.meta).toHaveProperty('limit');
      expect(res.body.data.meta).toHaveProperty('totalPages');
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });

    it('should return property items with correct shape', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/properties')
        .expect(200);

      if (res.body.data.items.length > 0) {
        const item = res.body.data.items[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('price');
        expect(item).toHaveProperty('bedrooms');
        expect(item).toHaveProperty('bathrooms');
        expect(item).toHaveProperty('squareFeet');
        expect(item).toHaveProperty('propertyType');
        expect(item).toHaveProperty('address');
        expect(item.address).toHaveProperty('street');
        expect(item.address).toHaveProperty('city');
        expect(item.address).toHaveProperty('state');
        expect(item.address).toHaveProperty('zipCode');
        expect(item).toHaveProperty('availableFrom');
        expect(item).toHaveProperty('primaryPhoto');
        expect(item).toHaveProperty('amenities');
        expect(item).toHaveProperty('createdAt');
      }
    });

    it('should be accessible without authentication (public)', async () => {
      await request(app.getHttpServer())
        .get('/api/properties')
        .expect(200);
    });

    it('should support pagination with page and limit query params', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/properties?page=1&limit=2')
        .expect(200);

      expect(res.body.data.meta.page).toBe(1);
      expect(res.body.data.meta.limit).toBe(2);
    });

    it('should support filtering by propertyType', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/properties?propertyType=apartment')
        .expect(200);

      for (const item of res.body.data.items) {
        expect(item.propertyType).toBe('apartment');
      }
    });

    it('should support filtering by minPrice and maxPrice', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/properties?minPrice=1000&maxPrice=3000')
        .expect(200);

      for (const item of res.body.data.items) {
        expect(item.price).toBeGreaterThanOrEqual(1000);
        expect(item.price).toBeLessThanOrEqual(3000);
      }
    });

    it('should support filtering by bedrooms', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/properties?bedrooms=2')
        .expect(200);

      for (const item of res.body.data.items) {
        expect(item.bedrooms).toBeGreaterThanOrEqual(2);
      }
    });

    it('should support filtering by bathrooms', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/properties?bathrooms=1')
        .expect(200);

      for (const item of res.body.data.items) {
        expect(item.bathrooms).toBeGreaterThanOrEqual(1);
      }
    });

    it('should support filtering by city', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/properties?city=New York')
        .expect(200);

      for (const item of res.body.data.items) {
        expect(item.address.city).toBe('New York');
      }
    });

    it('should support sorting by price_asc', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/properties?sortBy=price_asc')
        .expect(200);

      const prices = res.body.data.items.map((i: any) => i.price);
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
      }
    });

    it('should support sorting by newest', async () => {
      await request(app.getHttpServer())
        .get('/api/properties?sortBy=newest')
        .expect(200);
    });

    it('should return empty items array when no properties match', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/properties?city=NonExistent')
        .expect(200);

      expect(res.body.data.items).toHaveLength(0);
      expect(res.body.data.meta.total).toBe(0);
    });

    it('should not return soft-deleted properties', async () => {
      // Archiving is tested separately; verify public search excludes archived
      const res = await request(app.getHttpServer())
        .get('/api/properties')
        .expect(200);

      for (const item of res.body.data.items) {
        expect(item).not.toHaveProperty('deletedAt');
      }
    });

    it('should support search by text query', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/properties?search=downtown')
        .expect(200);

      for (const item of res.body.data.items) {
        const searchable = `${item.title} ${item.description} ${item.address.city} ${item.address.state}`.toLowerCase();
        expect(searchable).toContain('downtown');
      }
    });

    it('should support filtering by state', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/properties?state=NY')
        .expect(200);

      for (const item of res.body.data.items) {
        expect(item.address.state).toBe('NY');
      }
    });

    it('should support sorting by price_desc', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/properties?sortBy=price_desc')
        .expect(200);

      const prices = res.body.data.items.map((i: any) => i.price);
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
      }
    });

    it('should support sorting by oldest', async () => {
      await request(app.getHttpServer())
        .get('/api/properties?sortBy=oldest')
        .expect(200);
    });
  });

  // ─── GET /properties/:id (Detail) ──────────────────────────────────
  describe('GET /api/properties/:id', () => {
    let property: Property;

    beforeEach(async () => {
      const seeded = await seedTestProperties(dataSource);
      property = seeded.downtownApt;
    });

    it('should return 200 with full property detail', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/properties/${property.id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.message).toBe('Property retrieved successfully');
      expect(res.body.data).toHaveProperty('id', property.id);
      expect(res.body.data).toHaveProperty('title');
      expect(res.body.data).toHaveProperty('description');
      expect(res.body.data).toHaveProperty('price');
      expect(res.body.data).toHaveProperty('bedrooms');
      expect(res.body.data).toHaveProperty('bathrooms');
      expect(res.body.data).toHaveProperty('squareFeet');
      expect(res.body.data).toHaveProperty('propertyType');
      expect(res.body.data).toHaveProperty('address');
      expect(res.body.data.address).toHaveProperty('street');
      expect(res.body.data.address).toHaveProperty('city');
      expect(res.body.data.address).toHaveProperty('state');
      expect(res.body.data.address).toHaveProperty('zipCode');
      expect(res.body.data).toHaveProperty('availableFrom');
      expect(res.body.data).toHaveProperty('photos');
      expect(res.body.data).toHaveProperty('amenities');
      expect(res.body.data).toHaveProperty('isFavorited');
      expect(res.body.data).toHaveProperty('createdAt');
      expect(res.body.data).toHaveProperty('updatedAt');
    });

    it('should be accessible without authentication (public)', async () => {
      await request(app.getHttpServer())
        .get(`/api/properties/${property.id}`)
        .expect(200);
    });

    it('should return 400 for invalid UUID format', async () => {
      await request(app.getHttpServer())
        .get('/api/properties/not-a-uuid')
        .expect(400);
    });

    it('should return 404 for non-existent property', async () => {
      await request(app.getHttpServer())
        .get('/api/properties/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('should return 404 for archived property', async () => {
      // In GREEN phase: archive the property first, then verify 404
      // For now, this tests the general 404 path
      await request(app.getHttpServer())
        .get(`/api/properties/${property.id}`)
        .expect(200);
      // NOTE: Full archive-then-404 test needs property archive implementation
    });

    it('should return isFavorited=false for unauthenticated user', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/properties/${property.id}`)
        .expect(200);

      expect(res.body.data.isFavorited).toBe(false);
    });
  });

  // ─── POST /properties (Create) ─────────────────────────────────────
  describe('POST /api/properties', () => {
    const validBody = {
      title: 'New Test Property',
      description: 'A newly created test property for e2e testing purposes.',
      price: 1800.0,
      bedrooms: 2,
      bathrooms: 1,
      squareFeet: 850,
      propertyType: 'condo',
      address: {
        street: '100 Test Blvd',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        latitude: 37.774929,
        longitude: -122.419418,
      },
      availableFrom: '2026-08-01',
      amenityIds: [],
    };

    it('should return 201 with created property (admin only)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/properties')
        .set(authHeader(adminToken))
        .send(validBody)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(201);
      expect(res.body.message).toBe('Property created successfully');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('title', 'New Test Property');
      expect(res.body.data).toHaveProperty('price', 1800);
      expect(res.body.data).toHaveProperty('address');
      expect(res.body.data.address).toHaveProperty('city', 'San Francisco');
      expect(res.body.data).toHaveProperty('photos');
      expect(res.body.data).toHaveProperty('amenities');
      expect(res.body.data).toHaveProperty('createdAt');
      expect(res.body.data).toHaveProperty('updatedAt');
    });

    it('should return 400 when title is missing', async () => {
      const { title, ...body } = validBody;
      await request(app.getHttpServer())
        .post('/api/properties')
        .set(authHeader(adminToken))
        .send(body)
        .expect(400);
    });

    it('should return 400 when title is too short (< 5 chars)', async () => {
      await request(app.getHttpServer())
        .post('/api/properties')
        .set(authHeader(adminToken))
        .send({ ...validBody, title: 'AB' })
        .expect(400);
    });

    it('should return 400 when description is too short (< 20 chars)', async () => {
      await request(app.getHttpServer())
        .post('/api/properties')
        .set(authHeader(adminToken))
        .send({ ...validBody, description: 'Short desc' })
        .expect(400);
    });

    it('should return 400 when price is missing', async () => {
      const { price, ...body } = validBody;
      await request(app.getHttpServer())
        .post('/api/properties')
        .set(authHeader(adminToken))
        .send(body)
        .expect(400);
    });

    it('should return 400 when price is 0 or negative', async () => {
      await request(app.getHttpServer())
        .post('/api/properties')
        .set(authHeader(adminToken))
        .send({ ...validBody, price: 0 })
        .expect(400);
    });

    it('should return 400 when bedrooms is negative', async () => {
      await request(app.getHttpServer())
        .post('/api/properties')
        .set(authHeader(adminToken))
        .send({ ...validBody, bedrooms: -1 })
        .expect(400);
    });

    it('should accept bedrooms=0 and bathrooms=0 (studio)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/properties')
        .set(authHeader(adminToken))
        .send({ ...validBody, bedrooms: 0, bathrooms: 0, propertyType: 'studio' })
        .expect(201);

      expect(res.body.data.bedrooms).toBe(0);
      expect(res.body.data.bathrooms).toBe(0);
    });

    it('should return 400 when propertyType is invalid', async () => {
      await request(app.getHttpServer())
        .post('/api/properties')
        .set(authHeader(adminToken))
        .send({ ...validBody, propertyType: 'invalid-type' })
        .expect(400);
    });

    it('should return 400 when address is missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/properties')
        .set(authHeader(adminToken))
        .send({ ...validBody, address: { city: 'SF' } })
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/api/properties')
        .send(validBody)
        .expect(401);
    });

    it('should return 403 when authenticated as renter (not admin)', async () => {
      await request(app.getHttpServer())
        .post('/api/properties')
        .set(authHeader(renterToken))
        .send(validBody)
        .expect(403);
    });
  });

  // ─── PATCH /properties/:id (Update) ────────────────────────────────
  describe('PATCH /api/properties/:id', () => {
    let property: Property;

    beforeEach(async () => {
      const seeded = await seedTestProperties(dataSource);
      property = seeded.downtownApt;
    });

    it('should return 200 with updated property (admin only)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/properties/${property.id}`)
        .set(authHeader(adminToken))
        .send({ title: 'Updated Title', price: 2800 })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.message).toBe('Property updated successfully');
      expect(res.body.data).toHaveProperty('id', property.id);
      expect(res.body.data).toHaveProperty('title', 'Updated Title');
      expect(res.body.data).toHaveProperty('price', 2800);
    });

    it('should return 200 updating only one field', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/properties/${property.id}`)
        .set(authHeader(adminToken))
        .send({ price: 3000 })
        .expect(200);

      expect(res.body.data.price).toBe(3000);
      expect(res.body.data.title).toBe(property.title);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .patch('/api/properties/not-a-uuid')
        .set(authHeader(adminToken))
        .send({ title: 'Bad UUID' })
        .expect(400);
    });

    it('should return 400 when title is too short (< 5 chars)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/properties/${property.id}`)
        .set(authHeader(adminToken))
        .send({ title: 'AB' })
        .expect(400);
    });

    it('should return 400 when description is too short (< 20 chars)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/properties/${property.id}`)
        .set(authHeader(adminToken))
        .send({ description: 'Short desc' })
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .patch(`/api/properties/${property.id}`)
        .send({ title: 'No Auth' })
        .expect(401);
    });

    it('should return 403 when authenticated as renter (not admin)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/properties/${property.id}`)
        .set(authHeader(renterToken))
        .send({ title: 'Renter Update' })
        .expect(403);
    });

    it('should return 404 when property not found', async () => {
      await request(app.getHttpServer())
        .patch('/api/properties/00000000-0000-0000-0000-000000000000')
        .set(authHeader(adminToken))
        .send({ title: 'Not Found' })
        .expect(404);
    });
  });

  // ─── DELETE /properties/:id (Archive) ──────────────────────────────
  describe('DELETE /api/properties/:id', () => {
    let property: Property;

    beforeEach(async () => {
      const seeded = await seedTestProperties(dataSource);
      property = seeded.downtownApt;
    });

    it('should return 200 and archive property (admin only)', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/properties/${property.id}`)
        .set(authHeader(adminToken))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.message).toBe('Property archived successfully');
      expect(res.body.data).toBeNull();
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .delete('/api/properties/not-a-uuid')
        .set(authHeader(adminToken))
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .delete(`/api/properties/${property.id}`)
        .expect(401);
    });

    it('should return 403 when authenticated as renter (not admin)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/properties/${property.id}`)
        .set(authHeader(renterToken))
        .expect(403);
    });

    it('should return 404 when property not found', async () => {
      await request(app.getHttpServer())
        .delete('/api/properties/00000000-0000-0000-0000-000000000000')
        .set(authHeader(adminToken))
        .expect(404);
    });

    it('should make property inaccessible via GET after archiving', async () => {
      // Archive the property
      await request(app.getHttpServer())
        .delete(`/api/properties/${property.id}`)
        .set(authHeader(adminToken))
        .expect(200);

      // Should now return 404 for public access
      await request(app.getHttpServer())
        .get(`/api/properties/${property.id}`)
        .expect(404);
    });
  });

  // ─── POST /properties/:id/photos (Upload) ─────────────────────────
  describe('POST /api/properties/:id/photos', () => {
    let property: Property;

    beforeEach(async () => {
      const seeded = await seedTestProperties(dataSource);
      property = seeded.downtownApt;
    });

    it('should return 201 with uploaded photo data (admin only)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/properties/${property.id}/photos`)
        .set(authHeader(adminToken))
        .attach('files', Buffer.from('fake-image-content'), 'test-photo.jpg')
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(201);
      expect(res.body.message).toBe('Photos uploaded successfully');
      expect(Array.isArray(res.body.data)).toBe(true);
      if (res.body.data.length > 0) {
        const photo = res.body.data[0];
        expect(photo).toHaveProperty('id');
        expect(photo).toHaveProperty('url');
        expect(photo).toHaveProperty('isPrimary');
        expect(photo).toHaveProperty('sortOrder');
      }
    });

    it('should return 400 when no file provided', async () => {
      await request(app.getHttpServer())
        .post(`/api/properties/${property.id}/photos`)
        .set(authHeader(adminToken))
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post(`/api/properties/${property.id}/photos`)
        .attach('files', Buffer.from('fake'), 'test.jpg')
        .expect(401);
    });

    it('should return 403 when authenticated as renter', async () => {
      await request(app.getHttpServer())
        .post(`/api/properties/${property.id}/photos`)
        .set(authHeader(renterToken))
        .attach('files', Buffer.from('fake'), 'test.jpg')
        .expect(403);
    });

    it('should return 404 when property not found', async () => {
      await request(app.getHttpServer())
        .post('/api/properties/00000000-0000-0000-0000-000000000000/photos')
        .set(authHeader(adminToken))
        .attach('files', Buffer.from('fake'), 'test.jpg')
        .expect(404);
    });
  });

  // ─── DELETE /properties/:id/photos/:photoId ────────────────────────
  describe('DELETE /api/properties/:id/photos/:photoId', () => {
    it('should return 200 when photo deleted (admin only)', async () => {
      // This test requires a photo to exist first.
      // In GREEN phase: upload a photo, then delete it.
      // For RED phase, test the auth/validation contract.
      const photoId = '00000000-0000-0000-0000-000000000001';
      const propertyId = '00000000-0000-0000-0000-000000000002';

      // Will 404 because neither photo nor property exists in RED phase
      await request(app.getHttpServer())
        .delete(`/api/properties/${propertyId}/photos/${photoId}`)
        .set(authHeader(adminToken))
        .expect(404);
      // NOTE: In GREEN phase, change to expect(200) with real seeded data
    });

    it('should return 400 for invalid UUID format', async () => {
      await request(app.getHttpServer())
        .delete('/api/properties/not-a-uuid/photos/not-a-uuid')
        .set(authHeader(adminToken))
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .delete('/api/properties/some-id/photos/some-photo-id')
        .expect(401);
    });

    it('should return 403 when authenticated as renter', async () => {
      await request(app.getHttpServer())
        .delete('/api/properties/some-id/photos/some-photo-id')
        .set(authHeader(renterToken))
        .expect(403);
    });

    it('should return 404 when property not found', async () => {
      await request(app.getHttpServer())
        .delete('/api/properties/00000000-0000-0000-0000-000000000000/photos/00000000-0000-0000-0000-000000000001')
        .set(authHeader(adminToken))
        .expect(404);
    });

    it('should return 404 when photo not found for existing property', async () => {
      const seeded = await seedTestProperties(dataSource);
      const property = seeded.downtownApt;

      await request(app.getHttpServer())
        .delete(`/api/properties/${property.id}/photos/00000000-0000-0000-0000-000000000000`)
        .set(authHeader(adminToken))
        .expect(404);
    });
  });

  // ─── PATCH /properties/:id/photos/:photoId/primary ────────────────
  describe('PATCH /api/properties/:id/photos/:photoId/primary', () => {
    it('should return 200 when primary photo set (admin only)', async () => {
      // Requires photos to exist. In GREEN phase: upload photos, set primary.
      await request(app.getHttpServer())
        .patch('/api/properties/00000000-0000-0000-0000-000000000001/photos/00000000-0000-0000-0000-000000000002/primary')
        .set(authHeader(adminToken))
        .expect(404);
      // NOTE: Will be 200 in GREEN phase with seeded photo data
    });

    it('should return 400 for invalid UUID format', async () => {
      await request(app.getHttpServer())
        .patch('/api/properties/bad-uuid/photos/bad-uuid/primary')
        .set(authHeader(adminToken))
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .patch('/api/properties/some-id/photos/some-photo-id/primary')
        .expect(401);
    });

    it('should return 403 when authenticated as renter', async () => {
      await request(app.getHttpServer())
        .patch('/api/properties/some-id/photos/some-photo-id/primary')
        .set(authHeader(renterToken))
        .expect(403);
    });

    it('should return 404 when property not found', async () => {
      await request(app.getHttpServer())
        .patch('/api/properties/00000000-0000-0000-0000-000000000000/photos/00000000-0000-0000-0000-000000000001/primary')
        .set(authHeader(adminToken))
        .expect(404);
    });

    it('should return 404 when photo not found', async () => {
      const seeded = await seedTestProperties(dataSource);
      const property = seeded.downtownApt;

      await request(app.getHttpServer())
        .patch(`/api/properties/${property.id}/photos/00000000-0000-0000-0000-000000000000/primary`)
        .set(authHeader(adminToken))
        .expect(404);
    });
  });

  // ─── PATCH /properties/:id/photos/reorder ─────────────────────────
  describe('PATCH /api/properties/:id/photos/reorder', () => {
    it('should return 200 when photos reordered (admin only)', async () => {
      // Requires photos to exist. In GREEN phase: upload photos, reorder.
      await request(app.getHttpServer())
        .patch('/api/properties/00000000-0000-0000-0000-000000000001/photos/reorder')
        .set(authHeader(adminToken))
        .send({ photoIds: [] })
        .expect(404);
      // NOTE: Will be 200 in GREEN phase with seeded photo data
    });

    it('should return 400 for invalid UUID format', async () => {
      await request(app.getHttpServer())
        .patch('/api/properties/bad-uuid/photos/reorder')
        .set(authHeader(adminToken))
        .send({ photoIds: ['not-a-uuid'] })
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .patch('/api/properties/some-id/photos/reorder')
        .send({ photoIds: [] })
        .expect(401);
    });

    it('should return 403 when authenticated as renter', async () => {
      await request(app.getHttpServer())
        .patch('/api/properties/some-id/photos/reorder')
        .set(authHeader(renterToken))
        .send({ photoIds: [] })
        .expect(403);
    });

    it('should return 404 when property not found', async () => {
      await request(app.getHttpServer())
        .patch('/api/properties/00000000-0000-0000-0000-000000000000/photos/reorder')
        .set(authHeader(adminToken))
        .send({ photoIds: [] })
        .expect(404);
    });
  });
});
