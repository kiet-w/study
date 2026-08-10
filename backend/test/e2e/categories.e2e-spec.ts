import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, TEST_USER_A, TEST_USER_B } from '../utils/test-utils';

describe('Categories Module E2E Test Suite (/api/categories)', () => {
  let app: INestApplication;
  let createdCategoryId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/categories - Validation Error (missing name) -> 400', () => {
    return request(app.getHttpServer())
      .post('/api/categories')
      .send({ userId: TEST_USER_A, color: '#3B82F6', icon: '📚' })
      .expect(400);
  });

  it('POST /api/categories - Create Category (Happy Path) -> 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/categories')
      .send({
        userId: TEST_USER_A,
        name: 'Vật lý 1',
        color: '#3B82F6',
        icon: '🔬',
      })
      .expect(201);

    const category = res.body.data || res.body;
    expect(category).toHaveProperty('id');
    expect(category.name).toBe('Vật lý 1');
    createdCategoryId = category.id;
  });

  it('GET /api/categories/:id - Read Created Category -> 200', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/categories/${createdCategoryId}`)
      .expect(200);

    const category = res.body.data || res.body;
    expect(category.id).toBe(createdCategoryId);
    expect(category.name).toBe('Vật lý 1');
  });

  it('GET /api/categories/:id - User Data Isolation (Unauthorized User B) -> 404', () => {
    return request(app.getHttpServer())
      .get(`/api/categories/${createdCategoryId}?userId=${TEST_USER_B}`)
      .expect(404);
  });

  it('PATCH /api/categories/:id - Update Category Name -> 200', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/categories/${createdCategoryId}`)
      .send({ name: 'Vật lý Đại Cương' })
      .expect(200);

    const category = res.body.data || res.body;
    expect(category.name).toBe('Vật lý Đại Cương');
  });

  it('DELETE /api/categories/:id - Delete Category -> 200', async () => {
    await request(app.getHttpServer())
      .delete(`/api/categories/${createdCategoryId}`)
      .expect(200);
  });

  it('GET /api/categories/:id - Verify Deleted -> 404', () => {
    return request(app.getHttpServer())
      .get(`/api/categories/${createdCategoryId}`)
      .expect(404);
  });
});
