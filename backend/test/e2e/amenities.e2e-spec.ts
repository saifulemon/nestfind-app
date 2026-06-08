import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { createTestApp, closeTestApp, getDataSource } from '../setup/test-app.factory';
import { cleanDatabase } from '../setup/test-database';
import { createTestUser, seedTestUsers, testUsers } from '../fixtures/user.fixture';
import { generateAccessToken, authHeader } from '../fixtures/auth.fixture';
import { seedTestAmenities } from '../fixtures/property.fixture';
import { User } from '../../src/modules/users/entities/user.entity';
import { Amenity } from '../../src/modules/properties/entities/amenity.entity';

import { AmenityModule } from '../../src/modules/amenities/amenity.module';

describe('Amenities E2E', () => {
  let app: INestApplication;
  let module: TestingModule;
  let dataSource: DataSource;
  let adminToken: string;
  let renterToken: string;

  beforeAll(async () => {
    const context = await createTestApp([AmenityModule]);
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
    adminToken = generateAccessToken(seeded.admin);
    renterToken = generateAccessToken(seeded.renter);
  });

  // ─── GET /amenities (List) ─────────────────────────────────────────
  describe('GET /api/amenities', () => {
    beforeEach(async () => {
      await seedTestAmenities(dataSource);
    });

    it('should return 200 with list of all amenities (public)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/amenities')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.message).toBe('Amenities retrieved successfully');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('path', '/api/amenities');
    });

    it('should return amenity items with correct shape', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/amenities')
        .expect(200);

      if (res.body.data.length > 0) {
        const item = res.body.data[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('icon');
      }
    });

    it('should be accessible without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/amenities')
        .expect(200);
    });

    it('should return empty array when no amenities exist', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/amenities')
        .expect(200);

      expect(res.body.data).toEqual([]);
    });

    it('should return all seeded amenities', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/amenities')
        .expect(200);

      expect(res.body.data.length).toBe(4);
      const names = res.body.data.map((a: any) => a.name);
      expect(names).toContain('Parking');
      expect(names).toContain('Gym');
      expect(names).toContain('Pool');
      expect(names).toContain('Pet Friendly');
    });
  });

  // ─── POST /amenities (Create) ─────────────────────────────────────
  describe('POST /api/amenities', () => {
    const validBody = {
      name: 'Rooftop Access',
      icon: 'rooftop',
    };

    it('should return 201 with created amenity (admin only)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/amenities')
        .set(authHeader(adminToken))
        .send(validBody)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(201);
      expect(res.body.message).toBe('Amenity created successfully');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('name', 'Rooftop Access');
      expect(res.body.data).toHaveProperty('icon', 'rooftop');
      expect(res.body.data).toHaveProperty('createdAt');
      expect(res.body.data).toHaveProperty('updatedAt');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('path', '/api/amenities');
    });

    it('should return 400 when name is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/amenities')
        .set(authHeader(adminToken))
        .send({ icon: 'rooftop' })
        .expect(400);
    });

    it('should return 400 when name is empty string', async () => {
      await request(app.getHttpServer())
        .post('/api/amenities')
        .set(authHeader(adminToken))
        .send({ name: '', icon: 'rooftop' })
        .expect(400);
    });

    it('should return 400 when name exceeds 50 chars', async () => {
      await request(app.getHttpServer())
        .post('/api/amenities')
        .set(authHeader(adminToken))
        .send({ name: 'A'.repeat(51), icon: 'rooftop' })
        .expect(400);
    });

    it('should return 400 when icon is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/amenities')
        .set(authHeader(adminToken))
        .send({ name: 'Rooftop Access' })
        .expect(400);
    });

    it('should return 400 when icon exceeds 50 chars', async () => {
      await request(app.getHttpServer())
        .post('/api/amenities')
        .set(authHeader(adminToken))
        .send({ name: 'Rooftop Access', icon: 'A'.repeat(51) })
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/api/amenities')
        .send(validBody)
        .expect(401);
    });

    it('should return 403 when authenticated as renter (not admin)', async () => {
      await request(app.getHttpServer())
        .post('/api/amenities')
        .set(authHeader(renterToken))
        .send(validBody)
        .expect(403);
    });

    it('should return 409 when amenity name already exists', async () => {
      await seedTestAmenities(dataSource);

      await request(app.getHttpServer())
        .post('/api/amenities')
        .set(authHeader(adminToken))
        .send({ name: 'Parking', icon: 'parking-v2' })
        .expect(409);
    });
  });

  // ─── PATCH /amenities/:id (Update) ────────────────────────────────
  describe('PATCH /api/amenities/:id', () => {
    let amenity: Amenity;

    beforeEach(async () => {
      const amenities = await seedTestAmenities(dataSource);
      amenity = amenities[0]; // Parking
    });

    it('should return 200 with updated amenity (admin only)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/amenities/${amenity.id}`)
        .set(authHeader(adminToken))
        .send({ name: 'Updated Amenity' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.message).toBe('Amenity updated successfully');
      expect(res.body.data).toHaveProperty('id', amenity.id);
      expect(res.body.data).toHaveProperty('name', 'Updated Amenity');
      expect(res.body.data).toHaveProperty('updatedAt');
    });

    it('should return 200 updating icon only', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/amenities/${amenity.id}`)
        .set(authHeader(adminToken))
        .send({ icon: 'new-icon' })
        .expect(200);

      expect(res.body.data.icon).toBe('new-icon');
      expect(res.body.data.name).toBe(amenity.name);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .patch('/api/amenities/not-a-uuid')
        .set(authHeader(adminToken))
        .send({ name: 'Bad UUID' })
        .expect(400);
    });

    it('should return 400 when name exceeds 50 chars', async () => {
      await request(app.getHttpServer())
        .patch(`/api/amenities/${amenity.id}`)
        .set(authHeader(adminToken))
        .send({ name: 'A'.repeat(51) })
        .expect(400);
    });

    it('should return 400 when icon exceeds 50 chars', async () => {
      await request(app.getHttpServer())
        .patch(`/api/amenities/${amenity.id}`)
        .set(authHeader(adminToken))
        .send({ icon: 'A'.repeat(51) })
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .patch(`/api/amenities/${amenity.id}`)
        .send({ name: 'No Auth' })
        .expect(401);
    });

    it('should return 403 when authenticated as renter (not admin)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/amenities/${amenity.id}`)
        .set(authHeader(renterToken))
        .send({ name: 'Renter Update' })
        .expect(403);
    });

    it('should return 404 when amenity not found', async () => {
      await request(app.getHttpServer())
        .patch('/api/amenities/00000000-0000-0000-0000-000000000000')
        .set(authHeader(adminToken))
        .send({ name: 'Not Found' })
        .expect(404);
    });

    it('should return 409 when updating to an existing amenity name', async () => {
      const amenities = await seedTestAmenities(dataSource);
      const otherName = amenities[1].name; // Gym

      await request(app.getHttpServer())
        .patch(`/api/amenities/${amenity.id}`)
        .set(authHeader(adminToken))
        .send({ name: otherName })
        .expect(409);
    });
  });

  // ─── DELETE /amenities/:id ─────────────────────────────────────────
  describe('DELETE /api/amenities/:id', () => {
    let amenity: Amenity;

    beforeEach(async () => {
      const amenities = await seedTestAmenities(dataSource);
      amenity = amenities[0]; // Parking
    });

    it('should return 200 and soft-delete amenity (admin only)', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/amenities/${amenity.id}`)
        .set(authHeader(adminToken))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.message).toBe('Amenity deleted successfully');
      expect(res.body.data).toBeNull();
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('path', `/api/amenities/${amenity.id}`);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .delete('/api/amenities/not-a-uuid')
        .set(authHeader(adminToken))
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .delete(`/api/amenities/${amenity.id}`)
        .expect(401);
    });

    it('should return 403 when authenticated as renter (not admin)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/amenities/${amenity.id}`)
        .set(authHeader(renterToken))
        .expect(403);
    });

    it('should return 404 when amenity not found', async () => {
      await request(app.getHttpServer())
        .delete('/api/amenities/00000000-0000-0000-0000-000000000000')
        .set(authHeader(adminToken))
        .expect(404);
    });

    it('should remove amenity from listing but retain for associated properties', async () => {
      // Soft-delete the amenity
      await request(app.getHttpServer())
        .delete(`/api/amenities/${amenity.id}`)
        .set(authHeader(adminToken))
        .expect(200);

      // Amenity should no longer appear in the list
      const res = await request(app.getHttpServer())
        .get('/api/amenities')
        .expect(200);

      const ids = res.body.data.map((a: any) => a.id);
      expect(ids).not.toContain(amenity.id);
    });
  });
});
