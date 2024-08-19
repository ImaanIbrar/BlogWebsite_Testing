const supertest = require('supertest');
const app = require('../app');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
// Disconnect from the test database after running the tests
afterAll(async () => {
    await mongoose.connection.close();
  });

// Mock external dependencies
jest.mock('../models/user');
jest.mock('bcrypt');

describe('POST /api/login', () => {
  let testUser;

  beforeEach(async () => {
    // Clear mock implementation for User model
    User.mockClear();

    // Clear mock implementation for bcrypt
    bcrypt.hash.mockClear();

    // Mock User.findOne method to return a test user
    User.findOne.mockResolvedValue({
      username: 'testuser',
      name: 'Test User',
      password: 'hashedPassword', // Mock hashed password
    });
  });

  test('should login with correct credentials', async () => {
    // Mock bcrypt.compare method to resolve true
    bcrypt.compare.mockResolvedValue(true);

    const credentials = {
      username: 'testuser',
      password: 'password',
    };

    const res = await supertest(app)
      .post('/api/login')
      .send(credentials);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.username).toBe('testuser');
    expect(res.body.name).toBe('Test User');
  });

  test('should return 401 with incorrect password', async () => {
    // Mock bcrypt.compare method to resolve false
    bcrypt.compare.mockResolvedValue(false);

    const credentials = {
      username: 'testuser',
      password: 'wrongpassword',
    };

    const res = await supertest(app)
      .post('/api/login')
      .send(credentials);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid username or password');
  });

  test('should return 401 with non-existent username', async () => {
    // Mock User.findOne method to return null (non-existent user)
    User.findOne.mockResolvedValue(null);

    const credentials = {
      username: 'nonexistentuser',
      password: 'password',
    };

    const res = await supertest(app)
      .post('/api/login')
      .send(credentials);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid username or password');
  });

  test('should return 400 if username is missing', async () => {
    const credentials = {
      password: 'password',
    };

    const res = await supertest(app)
      .post('/api/login')
      .send(credentials);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Missing or empty username or password');
  });

  test('should return 400 if password is missing', async () => {
    const credentials = {
      username: 'testuser',
    };

    const res = await supertest(app)
      .post('/api/login')
      .send(credentials);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Missing or empty username or password');
  });

  test('should return 400 if username or password is empty', async () => {
    const credentials = {
      username: '',
      password: '',
    };

    const res = await supertest(app)
      .post('/api/login')
      .send(credentials);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Missing or empty username or password');
  });
});
