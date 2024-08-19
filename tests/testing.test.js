// testing.test.js

const request = require('supertest');
const app = require('../app'); // Your main Express app
const Blog = require('../models/blog');
const User = require('../models/user');

const mongoose = require('mongoose');
// Disconnect from the test database after running the tests
afterAll(async () => {
    await mongoose.connection.close();
  });

beforeAll(async () => {
    await Blog.deleteMany({});
    await User.deleteMany({});});
describe('POST /api/testing/reset', () => {
  beforeEach(async () => {
    // Create some sample data before each test
    const testUser = new User({
      username: 'testuser',
      name: 'Test User',
      password: 'password', // Or use bcrypt to hash the password
    });
    await testUser.save();

    await Blog.create({
        title: 'The importance of testing',
        author: 'John Doe',
        url: 'https://sampleblog.com',
        likes: 0,
      });
      await Blog.create({
        title: 'Abdullah is a SQE expert',
        author: 'Abdullah',
        url: 'https://sampleblog.com',
        likes: 0,
      });
  });

  test('should reset the database', async () => {
    // Check initial data count
    const usersBeforeReset = await User.countDocuments();
    const blogsBeforeReset = await Blog.countDocuments();
    expect(usersBeforeReset).toBe(1);
    expect(blogsBeforeReset).toBe(2);

    // Send the reset request
    const res = await request(app)
      .post('/api/testing/reset')
      .expect(204); // No content expected

    // Check that all data is deleted
    const usersAfterReset = await User.countDocuments();
    const blogsAfterReset = await Blog.countDocuments();
    expect(usersAfterReset).toBe(0);
    expect(blogsAfterReset).toBe(0);
  });

  // Additional Tests (Optional, but recommended)
  test('should not require authentication', async () => {
    const res = await request(app)
      .post('/api/testing/reset')
      .expect(204);
  });

});
