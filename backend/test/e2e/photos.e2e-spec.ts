import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, TEST_USER_A } from '../utils/test-utils';

describe('Photos Module E2E Test Suite (/api/photos)', () => {
  let app: INestApplication;
  let createdPhotoId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/photos - Validation Error (missing storagePath) -> 400', () => {
    return request(app.getHttpServer())
      .post('/api/photos')
      .send({ userId: TEST_USER_A, note: 'Ghi chú bài giảng' })
      .expect(400);
  });

  it('POST /api/photos - Create Photo (Happy Path) -> 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/photos')
      .send({
        userId: TEST_USER_A,
        storagePath: 'photos/2026/physics_01.jpg',
        note: 'Ảnh công thức tích phân',
        takenAt: new Date().toISOString(),
      })
      .expect(201);

    const photo = res.body.data || res.body;
    expect(photo).toHaveProperty('id');
    expect(photo.storagePath).toBe('photos/2026/physics_01.jpg');
    createdPhotoId = photo.id;
  });

  it('GET /api/photos/:id - Read Created Photo -> 200', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/photos/${createdPhotoId}`)
      .expect(200);

    const photo = res.body.data || res.body;
    expect(photo.id).toBe(createdPhotoId);
  });

  it('PATCH /api/photos/:id - Update Photo Note -> 200', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/photos/${createdPhotoId}`)
      .send({ note: 'Đã bổ sung ghi chú công thức' })
      .expect(200);

    const photo = res.body.data || res.body;
    expect(photo.note).toBe('Đã bổ sung ghi chú công thức');
  });

  it('DELETE /api/photos/:id - Delete Photo -> 200', async () => {
    await request(app.getHttpServer())
      .delete(`/api/photos/${createdPhotoId}`)
      .expect(200);
  });

  it('GET /api/photos/:id - Verify Deleted -> 404', () => {
    return request(app.getHttpServer())
      .get(`/api/photos/${createdPhotoId}`)
      .expect(404);
  });
});
