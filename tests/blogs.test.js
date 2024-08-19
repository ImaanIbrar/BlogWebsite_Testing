const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Blog = require('../models/blog');
const User = require('../models/user'); // You'll need this for user-related tests


const jwt = require('jsonwebtoken');
const generateAuthTokenForUser = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
  };

  // Generate JWT token with the payload and secret
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  return token;
};
// Disconnect from the test database after running the tests
afterAll(async () => {
  await mongoose.connection.close();
});

// Before each test, clear the database (or use a separate test database)
beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});
});
afterEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});
});
describe('GET /api/blogs', () => {
  test('should return all blogs', async () => {
    // Create a sample blog in the database
    await Blog.create({
      title: 'The importance of testing',
      author: 'John Doe',
      url: 'https://sampleblog.com',
      likes: 0,
    });

    // Make a GET request to retrieve all blogs
    const res = await request(app).get('/api/blogs');

    // Assert that the response is successful and contains the sample blog
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].title).toBe('The importance of testing');
  });
});
// describe('GET /api/blogs', () => {
//   test('should return all blogs', async () => {
//     // Create some sample blogs
//     await Blog.create({
//       title: 'The importance of testing',
//       author: 'John Doe',
//       url: 'https://sampleblog.com',
//       likes: 0,
//     });

//     const res = await request(app).get('/api/blogs');
//     expect(res.status).toBe(200);
//     expect(res.body).toHaveLength(1); 
//   });
// });
// describe('GET /api/blogs/:id', () => {
//   test('should return a specific blog by id', async () => {
//     // Create a sample blog in the database
//     const sampleBlog = await Blog.create({
//       title: 'Sample Blog',
//       author: 'John Doe',
//       url: 'https://sampleblog.com',
//       likes: 0,
//     });

//     // Make a GET request to retrieve the sample blog by id
//     const res = await request(app).get(`/api/blogs/${sampleBlog._id}`);

//     // Assert that the response is successful and contains the sample blog
//     expect(res.status).toBe(200);
//     expect(res.body.title).toBe('Sample Blog');
//   });

//   test('fails with status code 404 if blog id is not found', async () => {
//     const nonExistentId = new mongoose.Types.ObjectId();

//     const res = await request(app).put(`/api/blogs/${nonExistentId}`);

//     expect(res.status).toBe(404);
//     expect(res.body.error).toContain('Blog not found'); // Or your custom error message
//   });

//   test('fails with status code 400 if blog id is invalid', async () => {
//     const invalidId = 'invalid-id';

//     const res = await request(app).put(`/api/blogs/${invalidId}`).send({});

//     expect(res.status).toBe(400);
//   });
// });
describe('GET /api/blogs/:id', () => {
  let testBlog, testUser, token; // Define variables at the top level for reuse

  beforeEach(async () => {
    // Create a test user and blog
    testUser = new User({
      username: 'testuser',
      name: 'Test User',
      password: 'password',
    });
    await testUser.save();

    testBlog = new Blog({
      title: 'Test Blog',
      author: 'Test Author',
      url: 'https://example.com',
      likes: 0,
      user: testUser._id,
    });
    await testBlog.save();

    token = generateAuthTokenForUser(testUser); // Generate a valid token
  });

  afterEach(async () => {
    await Blog.deleteMany({});
    await User.deleteMany({});
  });

  test('should return a specific blog by id', async () => {
    const res = await request(app).get(`/api/blogs/${testBlog._id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title', testBlog.title);
    expect(res.body).toHaveProperty('author', testBlog.author);
    expect(res.body).toHaveProperty('url', testBlog.url);
    expect(res.body).toHaveProperty('likes', testBlog.likes);
    expect(res.body.user.username).toBe(testUser.username);
  });

  test('should return 404 if blog id is not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/blogs/${nonExistentId}`);
    expect(res.status).toBe(404);
  });

  test('should return 400 if blog id is invalid', async () => {
    const invalidId = 'invalid_id';
    const res = await request(app).get(`/api/blogs/${invalidId}`);
    expect(res.status).toBe(400);
  });
});

describe('POST /api/blogs', () => {
  let testUser, token; // Declare variables at the suite level
  beforeEach(async () => {
    // Create a test user and a blog for them before each test
    testUser = new User({
      username: 'testuser',
      name: 'Test User',
      password: 'password',
    });
    await testUser.save();
    // Generate a token for the user
    token = generateAuthTokenForUser(testUser);
  });
  test('should create a new blog when authenticated', async () => {

    // Prepare Blog Data
    const newBlogData = {
      title: 'New Blog Post',
      author: 'Test Author',
      url: 'https://example.com/blog',
      likes: 5,
    };

    // Send POST Request
    const res = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`) // Include the token
      .send(newBlogData);

    // Assertions
    expect(res.status).toBe(201); // Check for successful creation (201 Created)
    expect(res.body.title).toBe(newBlogData.title); // Check title matches
    expect(res.body.user).toBeDefined(); // Check that the user field exists
    expect(res.body.user.username).toBe(testUser.username); // Check associated user
  });
  test('fails with status code 400 if data is invalid', async () => {
    const newBlog = { author: 'John Doe' }; // Missing title, url, etc.

    const res = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`) // Include the token
      .send(newBlog);

    expect(res.status).toBe(400);
  });
  test('should fail to create a new blog without authentication', async () => {
    const newBlogData = {
      title: 'New Blog Post',
      author: 'Test Author',
      url: 'https://example.com/blog',
      likes: 5,
    };
    const res = await request(app).post('/api/blogs').send(newBlogData);

    expect(res.status).toBe(401); // or 403, depending on your error handling
  });
});
describe('PUT /api/blogs/:id', () => {
  test('should update a blog by id when authenticated', async () => {
    // 1. Create a Test User
    const testUser = new User({ username: 'testuser',
    name: 'Test User',
    password: 'password',});
    await testUser.save();

    // 2. Create a Sample Blog (associated with the user)
    const sampleBlog = new Blog({
      title: 'Sample Blog',
      author: 'John Doe',
      url: 'https://sampleblog.com',
      likes: 0,
      user: testUser._id, // Associate the blog with the user
    });
    await sampleBlog.save();

    // 3. Generate Authentication Token
    const token = generateAuthTokenForUser(testUser);

    // 4. Update data for the blog
    const updatedBlogData = {
      title: 'Updated Blog',
      author: 'Jane Doe',
      url: 'https://updatedblog.com',
      likes: 10,
    };

    // 5. Send PUT Request (with authentication)
    const res = await request(app)
      .put(`/api/blogs/${sampleBlog._id}`)
      .set('Authorization', `Bearer ${token}`) 
      .send(updatedBlogData);

    // 6. Assertions
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Blog'); 
    expect(res.body.likes).toBe(10);
  });

  test('should return 404 if blog id is not found', async () => {
    // Generate a valid ObjectId that doesn't exist in the database
    const nonExistentId = new mongoose.Types.ObjectId(); 
    const user1 = new User({
      username: 'user1',
      name: 'User One',
      password: 'password',
    });
    await user1.save();
    const token = generateAuthTokenForUser(user1);

    // Make a PUT request with the non-existent blog id
    const res = await request(app).put(`/api/blogs/${nonExistentId}`).set('Authorization', `Bearer ${token}`).send({});
  
    // Assert that the response is 404
    expect(res.status).toBe(404);
  });

  test('should return 401 if not authenticated', async () => {
    const res = await request(app)
      .put(`/api/blogs/${new mongoose.Types.ObjectId()}`) // Random, invalid ID
      .send({ title: 'Unauthorized Update' }); 

    expect(res.status).toBe(401); 
  });

  test('should return 403 if trying to update another user\'s blog', async () => {
      // 1. Create Two Users
      const user1 = new User({
        username: 'user1',
        name: 'User One',
        password: 'password',
      });
      await user1.save();
    
      const user2 = new User({
        username: 'user2',
        name: 'User Two',
        password: 'password',
      });
      await user2.save();
    
      // 2. Create a Blog Associated with User 1
      const blog = new Blog({
        title: 'User 1\'s Blog',
        author: 'John Doe',
        url: 'https://example.com/blog',
        likes: 5,
        user: user1._id, // Associate with User 1
      });
      await blog.save();
    
      // 3. Generate Token for User 2 (who doesn't own the blog)

      const token = generateAuthTokenForUser(user2);
  
    
      // 4. Prepare Update Data
      const updatedBlogData = {
        title: 'Trying to Update',
        author: 'Unauthorized User',
        url: 'https://example.com/blog',
        likes: 10,
        user: user2._id, // Associate with User 1
      };
    
      // 5. Send PUT Request with User 2's Token
      const res = await request(app)
        .put(`/api/blogs/${blog._id}`)
        .set('Authorization', `Bearer ${token}`) // Using User 2's token
        .send(updatedBlogData);
    
      // 6. Assertions
      expect(res.status).toBe(403); // Forbidden
      expect(res.body.error).toBe('You can only modify your own blogs');
    });
    
  });
  describe('DELETE /api/blogs/:id', () => {
    let testUser, token, blogToDelete; // Declare variables at the suite level
  
    beforeEach(async () => {
      // Create a test user and a blog for them before each test
      testUser = new User({
        username: 'testuser',
        name: 'Test User',
        password: 'password',
      });
      await testUser.save();
  
      blogToDelete = new Blog({
        title: 'Blog to Delete',
        author: 'Test Author',
        url: 'https://example.com',
        likes: 10,
        user: testUser._id, // Associate the blog with the user
      });
      await blogToDelete.save();
  
      // Generate a token for the user
      token = generateAuthTokenForUser(testUser);
    });

  
    test('succeeds with status code 204 if id is valid and user is authorized', async () => {
      const res = await request(app)
        .delete(`/api/blogs/${blogToDelete._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(204);
  
      // Ensure the blog is deleted from the database
      const blogsInDb = await Blog.find({});
      expect(blogsInDb).toHaveLength(0); // No blogs should remain
    });
  
    test('fails with status code 401 if not authenticated', async () => {
      const res = await request(app)
        .delete(`/api/blogs/${blogToDelete._id}`); // No Authorization header
      expect(res.status).toBe(401); // Or 403, depending on your error handling
    });
  
    test('fails with status code 403 if user is not the owner', async () => {
      // Create another user
      const anotherUser = new User({
        username: 'anotheruser',
        name: 'Another User',
        password: 'password',
      });
      await anotherUser.save();
  
      // Generate a token for the other user
      const anotherUserToken = generateAuthTokenForUser(anotherUser);
  
      const res = await request(app)
        .delete(`/api/blogs/${blogToDelete._id}`)
        .set('Authorization', `Bearer ${anotherUserToken}`);
      expect(res.status).toBe(403);
    });
  
    test('fails with status code 404 if blog does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
  
      const res = await request(app)
        .delete(`/api/blogs/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });
  describe('PUT /api/blogs/:id/likes', () => {
    let testBlog; 
    beforeEach(async () => {
      // Create a sample blog before each test
      testBlog = new Blog({
        title: 'Blog with Likes',
        author: 'Test Author',
        url: 'https://example.com',
        likes: 5, // Initial likes
      });
      await testBlog.save();
    });

  
    test('succeeds with status code 200 if id is valid', async () => {
      const res = await request(app)
        .put(`/api/blogs/${testBlog._id}/likes`)
        .send({}); // You don't need to send any data for likes
  
      expect(res.status).toBe(200);
      expect(res.body.likes).toBe(testBlog.likes + 1); // Likes should be incremented
    });
  
    test('fails with status code 404 if blog id is not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
  
      const res = await request(app)
        .put(`/api/blogs/${nonExistentId}/likes`)
        .send({});
      expect(res.status).toBe(404);
    });

    test('fails with status code 400 if blog id is invalid', async () => {
      const invalidId = 'invalid-id';
  
      const res = await request(app).put(`/api/blogs/${invalidId}/likes`).send({});
  
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('malformatted id');

    });
  });
  
  describe('POST /api/blogs/:id/comments', () => {
    let testBlog; // Declare the blog variable at the suite level to avoid duplicate creation
    beforeEach(async () => {
      // Create a test blog before each test (same setup as previous test suite)
      testBlog = new Blog({
        title: 'Blog with Comments',
        author: 'Test Author',
        url: 'https://example.com',
        likes:'6',
        comments: ['Initial comment'], // Initial comments
      });
      await testBlog.save();
    });
  
    afterEach(async () => {
      await Blog.deleteMany({});
    });
  
    test('succeeds with status code 200 if id is valid', async () => {
      const newComment = 'This is a new comment';
  
      const res = await request(app)
        .post(`/api/blogs/${testBlog._id}/comments`)
        .send({ comment: newComment });
  
      expect(res.status).toBe(200);
      expect(res.body.comments).toContain(newComment);
      expect(res.body.comments).toHaveLength(testBlog.comments.length + 1); // Ensure comment was added
    });
  
    test('fails with status code 404 if blog id is not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const newComment = 'This is a comment for a non-existent blog';
  
      const res = await request(app)
        .post(`/api/blogs/${nonExistentId}/comments`)
        .send({ comment: newComment });
  
      expect(res.status).toBe(404);
    });
  
    test('fails with status code 400 if blog id is invalid', async () => {
      const invalidId = 'invalid-id';
      const newComment = 'This is a comment for a blog with an invalid ID';
  
      const res = await request(app)
        .post(`/api/blogs/${invalidId}/comments`)
        .send({ comment: newComment });
  
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('malformatted id');
    });
  });
  