// users.test.js
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/user');
const Blog = require('../models/blog');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
// const jwt = require('jsonwebtoken');

// Disconnect from the test database after running the tests
afterAll(async () => {
    await mongoose.connection.close();
  });
  beforeEach(async () => {
    await User.deleteMany({});
    await Blog.deleteMany({});
  });
  afterEach(async () => {
    await Blog.deleteMany({});
    await User.deleteMany({});
  });
  describe('User API tests', () => {
    let testUser, testBlog, token;
  
    beforeEach(async () => {
  
      // Create a test user and blog (shared across tests)
      const passwordHash = await bcrypt.hash('password123', 10);
      testUser = new User({
        username: 'testuser',
        name: 'Test User',
        password: passwordHash,
      });
      await testUser.save();
  
      testBlog = new Blog({
        title: 'Test Blog',
        author: 'Test User',
        url: 'https://example.com',
        likes: 0,
        user: testUser._id,
      });
      await testBlog.save();
 
    });
  
    describe('GET /api/users', () => {
      test('should return all users as JSON with their blogs', async () => {
        const anotherUser = new User({
          username: 'anotheruser',
          name: 'Another User',
          password: await bcrypt.hash('securepass', 10),
        });
        await anotherUser.save();
  
        // Create a blog for anotherUser
        const anotherBlog = new Blog({ 
          title: 'Another Blog', 
          author: 'Another User', 
          url: 'http://anotherblog.com', 
          user: anotherUser._id 
        });
        await anotherBlog.save();
  
        const res = await supertest(app).get('/api/users');
        
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
  
        // // Verify details for both users
        // expect(res.body).toEqual(expect.arrayContaining([
        //     expect.objectContaining({ 
        //       username: 'user1',
        //       blogs: expect.arrayContaining([expect.objectContaining({ title: 'Blog 1' })]) 
        //     }),
        //     expect.objectContaining({ 
        //       username: 'user2',
        //       blogs: expect.arrayContaining([expect.objectContaining({ title: 'Blog 2' })]) 
        //         }),
        // ]));
      });
    });
describe('GET /api/users/:id', () => {


  test('should return the correct user associated with each blog', async () => {
    const res = await supertest(app)
      .get(`/api/users/${testUser._id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  
    // Check overall response structure
    expect(res.body).toHaveProperty('username', testUser.username);
    expect(res.body).toHaveProperty('name', testUser.name);
    expect(res.body).toHaveProperty('blogs');
    expect(Array.isArray(res.body.blogs)).toBe(true);
  
    // Iterate through each blog in the response
    res.body.blogs.forEach(blog => {
      // Crucial Check: Ensure the blog's author matches the requested user
      expect(blog).toHaveProperty('author', testUser.username);  
  
      // Additional checks for blog data (optional)
      expect(blog).toHaveProperty('_id'); // Ensure blog ID exists
      expect(blog).toHaveProperty('title'); // Ensure title exists
  });
      
  });

  test('should return 404 if user is not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    await supertest(app).get(`/api/users/${nonExistentId}`).expect(404);
  });

  test('should return 400 if id is invalid', async () => {
    const invalidId = 'invalid-id';
    await supertest(app).get(`/api/users/${invalidId}`).expect(400);
  });
});


});
describe('POST /api/users', () => {
  let testUser;

    test('should create a new user with valid data', async () => {
      const newUser = {
        username: 'newuser',
        name: 'New User',
        password: 'securepassword', 
      };
  
      const res = await supertest(app)
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/);
  
      expect(res.body).toHaveProperty('username', newUser.username);
      expect(res.body).toHaveProperty('name', newUser.name);
  
      // Ensure the password is not returned in the response
      expect(res.body).not.toHaveProperty('password'); 
  
      // Verify that the password was hashed in the database
      const usersInDb = await User.find({});
      const user = usersInDb[0];
      const passwordCorrect = await bcrypt.compare(newUser.password, user.password); 
      expect(passwordCorrect).toBe(true);
    });
  
    test('should return 400 if password is too short', async () => {
      const newUser = {
        username: 'shortpassworduser',
        name: 'User with Short Password',
        password: 'pw', // Too short
      };
  
      const res = await supertest(app)
        .post('/api/users')
        .send(newUser)
        .expect(400);
  
      expect(res.body.error).toBe('Password must be at least three characters long');
    });
    //username is not given
    test('should return 400 if username is not given', async () => {
      const newUser = {
        name: 'User with no Username',
        password: 'securepassword',
      };
  
      const res = await supertest(app)
        .post('/api/users')
        .send(newUser)
        .expect(400);
  
      expect(res.body.error).toContain('username'); // Assuming your error message contains "username"
    });
  
    //Username already exists
    test('should return 400 if username already exists', async () => {
        testUser = new User({
            username: 'testuser',
            name: 'Test User',
            password: 'passwordHash',
          });
          await testUser.save();
      const newUser = {
        username: 'testuser', // Same username as the existing user
        name: 'New User',
        password: 'securepassword',
      };
      const response = await supertest(app)
        .post('/api/users')
        .send(newUser)
        .expect(400);
  
      expect(response.body.error).toContain('Username already taken');
    });
  });