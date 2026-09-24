const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Bookmark = require('../models/Bookmark');

let mongoServer;

jest.setTimeout(600000);
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({ binary: { version: '7.0.14' } });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { driverInfo: { name: 'Mongoose', version: '9.10.1' } });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Bookmark.deleteMany({});
});

describe('API Tests', () => {
  const testUser = {
    name: 'testuser',
    email: 'test@example.com',
    password: 'Password123!'
  };
  let token;

  describe('Auth Routes', () => {
    it('POST /api/auth/register - success case', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      if (res.statusCode !== 201) console.log(res.body); expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', testUser.email);
    });

    it('POST /api/auth/register - duplicate email rejected', async () => {
      await request(app).post('/api/auth/register').send(testUser);
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('POST /api/auth/login - correct password succeeds', async () => {
      await request(app).post('/api/auth/register').send(testUser);
      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      token = res.body.token; // save for later tests
    });

    it('POST /api/auth/login - wrong password rejected with 401', async () => {
      await request(app).post('/api/auth/register').send(testUser);
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('GET /api/auth/me - valid JWT succeeds', async () => {
      const regRes = await request(app).post('/api/auth/register').send(testUser);
      const jwtToken = regRes.body.token;
      
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${jwtToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.user).toHaveProperty('email', testUser.email);
    });

    it('GET /api/auth/me - missing JWT rejected', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('Bookmark Routes', () => {
    it('POST /api/bookmarks and DELETE /api/bookmarks/:id', async () => {
      // 1. Register to get token
      const regRes = await request(app).post('/api/auth/register').send(testUser);
      const jwtToken = regRes.body.token;

      // 2. Add bookmark
      const addRes = await request(app)
        .post('/api/bookmarks')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ surahNumber: 1, verseNumber: 1, arabicText: 'Text', translation: 'Trans' });
      
      if (addRes.statusCode !== 201) console.log(addRes.body); expect(addRes.statusCode).toBe(201);
      expect(addRes.body).toHaveProperty('surahNumber', 1);
      const bookmarkId = addRes.body._id;

      // 3. Delete bookmark
      const delRes = await request(app)
        .delete(`/api/bookmarks/${bookmarkId}`)
        .set('Authorization', `Bearer ${jwtToken}`);
      
      expect(delRes.statusCode).toBe(200);
      expect(delRes.body).toHaveProperty('message');
    });
  });

  describe('Health Check', () => {
    it('GET /api/health', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });
});
