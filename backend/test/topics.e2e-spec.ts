import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, TEST_USER_A } from './test-utils';

describe('Topics Module E2E Test Suite (/api/topics)', () => {
  let app: INestApplication;
  let createdTopicId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/topics - Validation Error (missing name) -> 400', () => {
    return request(app.getHttpServer())
      .post('/api/topics')
      .send({ userId: TEST_USER_A, color: '#10B981' })
      .expect(400);
  });

  it('POST /api/topics - Create Topic (Happy Path) -> 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/topics')
      .send({
        userId: TEST_USER_A,
        name: 'Chương 1: Động lực học',
        color: '#10B981',
        icon: '🧮',
      })
      .expect(201);

    const topic = res.body.data || res.body;
    expect(topic).toHaveProperty('id');
    expect(topic.name).toBe('Chương 1: Động lực học');
    createdTopicId = topic.id;
  });

  it('GET /api/topics/:id - Read Created Topic -> 200', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/topics/${createdTopicId}`)
      .expect(200);

    const topic = res.body.data || res.body;
    expect(topic.id).toBe(createdTopicId);
  });

  it('PATCH /api/topics/:id - Update Topic Name -> 200', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/topics/${createdTopicId}`)
      .send({ name: 'Chương 1: Động lực học Chất điểm' })
      .expect(200);

    const topic = res.body.data || res.body;
    expect(topic.name).toBe('Chương 1: Động lực học Chất điểm');
  });

  it('DELETE /api/topics/:id - Delete Topic -> 200', async () => {
    await request(app.getHttpServer())
      .delete(`/api/topics/${createdTopicId}`)
      .expect(200);
  });

  it('GET /api/topics/:id - Verify Deleted -> 404', () => {
    return request(app.getHttpServer())
      .get(`/api/topics/${createdTopicId}`)
      .expect(404);
  });
});
