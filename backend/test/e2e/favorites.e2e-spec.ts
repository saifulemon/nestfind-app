import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { createTestApp, closeTestApp, getDataSource } from '../setup/test-app.factory';
import { cleanDatabase } from '../setup/test-database';
import { createTestUser, seedTestUsers, testUsers } from '../fixtures/user.fixture';
import { generateAccessToken, authHeader } from '../fixtures/auth.fixture';
import { seedTestProperties } from '../fixtures/property.fixture';
import { User } from '../../src/modules/users/entities/user.entity';
import { Property } from '../../src/modules/properties/entities/property.entity';

import { FavoriteModule } from '../../src/modules/favorites/favorite.module';
import { AuthTestModule } from '../setup/auth-test.module';

describe('Favorites E2E', () => {
  let app: INestApplication;
  let module: TestingModule;
  let dataSource: DataSource;
  let adminToken: string;
  let renterToken: string;
  let renter2Token: string;
  let adminUser: User;
  let renterUser: User;
  let renter2User: User;
  let property1: Property;
  let property2: Property;

  beforeAll(async () => {
    const context = await createTestApp([AuthTestModule, FavoriteModule]);
    app = context.app;
    module = context.module;
    dataSource = getDataSource(module);
  });

  afterAll(async () => {
    await closeTestApp({ app, module });
  });

  beforeEach(async () => {
    await cleanDatabase(dataSource);
    const seededUsers = await seedTestUsers(dataSource);
    adminUser = seededUsers.admin;
    renterUser = seededUsers.renter;
    renter2User = seededUsers.renter2;
    adminToken = generateAccessToken(adminUser);
    renterToken = generateAccessToken(renterUser);
    renter2Token = generateAccessToken(renter2User);

    const seededProps = await seedTestProperties(dataSource);
    property1 = seededProps.downtownApt;
    property2 = seededProps.suburbanHouse;
  });

  // ─── GET /favorites (List) ──────────────────────────────────────
  describe('GET /api/favorites', () => {
    it('should return 200 with paginated favorites list (renter only)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/favorites')
        .set(authHeader(renterToken))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.message).toBe('Favorites retrieved successfully');
      expect(res.body.data).toHaveProperty('items');
      expect(res.body.data).toHaveProperty('meta');
      expect(res.body.data.meta).toHaveProperty('total');
      expect(res.body.data.meta).toHaveProperty('page');
      expect(res.body.data.meta).toHaveProperty('limit');
      expect(res.body.data.meta).toHaveProperty('totalPages');
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });

    it('should return favorite items with correct shape', async () => {
      // First add a favorite so the list isn't empty
      await request(app.getHttpServer())
        .post('/api/favorites')
        .set(authHeader(renterToken))
        .send({ propertyId: property1.id })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/api/favorites')
        .set(authHeader(renterToken))
        .expect(200);

      if (res.body.data.items.length > 0) {
        const item = res.body.data.items[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('property');
        expect(item.property).toHaveProperty('id');
        expect(item.property).toHaveProperty('title');
        expect(item.property).toHaveProperty('price');
        expect(item.property).toHaveProperty('bedrooms');
        expect(item.property).toHaveProperty('bathrooms');
        expect(item.property).toHaveProperty('propertyType');
        expect(item.property).toHaveProperty('address');
        expect(item.property.address).toHaveProperty('city');
        expect(item.property.address).toHaveProperty('state');
        expect(item.property).toHaveProperty('primaryPhoto');
        expect(item).toHaveProperty('createdAt');
      }
    });

    it('should support pagination with page and limit', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/favorites?page=1&limit=10')
        .set(authHeader(renterToken))
        .expect(200);

      expect(res.body.data.meta.page).toBe(1);
      expect(res.body.data.meta.limit).toBe(10);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/api/favorites')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/favorites')
        .set(authHeader('invalid-token'))
        .expect(401);
    });

    it('should return 403 when authenticated as admin (renter only)', async () => {
      await request(app.getHttpServer())
        .get('/api/favorites')
        .set(authHeader(adminToken))
        .expect(403);
    });

    it('should only return favorites for the authenticated renter', async () => {
      // Renter1 favorites property1
      await request(app.getHttpServer())
        .post('/api/favorites')
        .set(authHeader(renterToken))
        .send({ propertyId: property1.id })
        .expect(201);

      // Renter2 favorites property2
      await request(app.getHttpServer())
        .post('/api/favorites')
        .set(authHeader(renter2Token))
        .send({ propertyId: property2.id })
        .expect(201);

      // Renter1's favorites should only include property1
      const res = await request(app.getHttpServer())
        .get('/api/favorites')
        .set(authHeader(renterToken))
        .expect(200);

      const propertyIds = res.body.data.items.map((i: any) => i.property.id);
      expect(propertyIds).toContain(property1.id);
      expect(propertyIds).not.toContain(property2.id);
    });
  });

  // ─── POST /favorites (Add) ─────────────────────────────────────
  describe('POST /api/favorites', () => {
    it('should return 201 when property added to favorites (renter only)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/favorites')
        .set(authHeader(renterToken))
        .send({ propertyId: property1.id })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(201);
      expect(res.body.message).toBe('Property added to favorites');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('propertyId', property1.id);
      expect(res.body.data).toHaveProperty('createdAt');
    });

    it('should be idempotent — adding same property twice returns existing record', async () => {
      // First add
      const first = await request(app.getHttpServer())
        .post('/api/favorites')
        .set(authHeader(renterToken))
        .send({ propertyId: property1.id })
        .expect(201);

      // Second add (same renter, same property)
      const second = await request(app.getHttpServer())
        .post('/api/favorites')
        .set(authHeader(renterToken))
        .send({ propertyId: property1.id })
        .expect(201);

      // Should return same or equivalent response
      expect(second.body.data.propertyId).toBe(property1.id);
    });

    it('should return 400 when propertyId is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/favorites')
        .set(authHeader(renterToken))
        .send({})
        .expect(400);
    });

    it('should return 400 when propertyId is invalid UUID format', async () => {
      await request(app.getHttpServer())
        .post('/api/favorites')
        .set(authHeader(renterToken))
        .send({ propertyId: 'not-a-uuid' })
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/api/favorites')
        .send({ propertyId: property1.id })
        .expect(401);
    });

    it('should return 403 when authenticated as admin (renter only)', async () => {
      await request(app.getHttpServer())
        .post('/api/favorites')
        .set(authHeader(adminToken))
        .send({ propertyId: property1.id })
        .expect(403);
    });

    it('should return 404 when property does not exist', async () => {
      await request(app.getHttpServer())
        .post('/api/favorites')
        .set(authHeader(renterToken))
        .send({ propertyId: '00000000-0000-0000-0000-000000000000' })
        .expect(404);
    });
  });

  // ─── DELETE /favorites/:propertyId (Remove) ─────────────────────
  describe('DELETE /api/favorites/:propertyId', () => {
    beforeEach(async () => {
      // Add a favorite first so we can remove it
      await request(app.getHttpServer())
        .post('/api/favorites')
        .set(authHeader(renterToken))
        .send({ propertyId: property1.id })
        .expect(201);
    });

    it('should return 200 when favorite removed (renter only)', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/favorites/${property1.id}`)
        .set(authHeader(renterToken))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.message).toBe('Property removed from favorites');
      expect(res.body.data).toBeNull();
    });

    it('should return 400 when propertyId is invalid UUID format', async () => {
      await request(app.getHttpServer())
        .delete('/api/favorites/not-a-uuid')
        .set(authHeader(renterToken))
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .delete(`/api/favorites/${property1.id}`)
        .expect(401);
    });

    it('should return 403 when authenticated as admin (renter only)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/favorites/${property1.id}`)
        .set(authHeader(adminToken))
        .expect(403);
    });

    it('should return 404 when favorite not found', async () => {
      // Property exists but is not favorited by this renter
      await request(app.getHttpServer())
        .delete(`/api/favorites/${property2.id}`)
        .set(authHeader(renterToken))
        .expect(404);
    });

    it('should return 404 when removing a favorite that belongs to another renter', async () => {
      // Renter2 tries to remove renter1's favorite
      await request(app.getHttpServer())
        .delete(`/api/favorites/${property1.id}`)
        .set(authHeader(renter2Token))
        .expect(404);
    });
  });
});
