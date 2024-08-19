const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const api = supertest(app)
mongoose.set('bufferTimeoutMS', 30000)

let token = ''

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', password: passwordHash })
  await user.save()

  const response = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })

  token = response.body.token

  const userInDB = await User.findOne({ username: 'root' })

  await Blog.deleteMany({}).set('Authorization', `Bearer ${token}`)

  const blogObjects = helper.initialBlogs.map(
    (blog) => new Blog({ ...blog, user: userInDB._id }),
  )
  const promiseArray = blogObjects.map((blog) => blog.save())
  await Promise.all(promiseArray)
}, 100000)

describe('when there is initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  }, 100000)

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('the unique identifier property is named id', async () => {
    const result = await api.get('/api/blogs')

    expect(result.body[0].id).toBeDefined()
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')

    const blogsWithoutId = response.body.map(
      ({ title, author, url, likes }) => ({ title, author, url, likes }),
    )

    expect(blogsWithoutId).toContainEqual(helper.initialBlogs[0])
  })
})

describe('viewing a specific blog', () => {
  test('succeeds with a valid id', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blog = blogsAtStart[0]

    const response = await api
      .get(`/api/blogs/${blog.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.title).toEqual(blog.title)
  })

  test('fails with statuscode 404 if note does not exist', async () => {
    await api.get(`/api/blogs/${await helper.nonExistingId()}`).expect(404)
  })

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api.get(`/api/blogs/${invalidId}`).expect(400)
  })
})

describe('addition of a new blog', () => {
  test('succeeds with valid data when a valid token is set in the authorization header', async () => {
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(helper.newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    const blogsWithoutId = blogsAtEnd.map(({ title, author, url, likes }) => ({
      title,
      author,
      url,
      likes,
    }))

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    expect(blogsWithoutId).toContainEqual(helper.newBlog)
  })

  test('adds the likes property with the default value of 0 when it is missing', async () => {
    const newBlog = {
      title: 'Red, green, refactor',
      author: 'Gonzalo Coradello',
      url: 'http://localhost:3001/api/blogs/4',
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
    expect(response.body.likes).toEqual(0)
  })

  test('fails with status code 400 when data is missing', async () => {
    const blogWithoutTitle = {
      author: 'Gonzalo Coradello',
      url: 'http://localhost:3001/api/blogs',
      likes: 0,
    }

    const blogWithoutUrl = {
      title: 'Testing is fun',
      author: 'Gonzalo Coradello',
      likes: 1,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(blogWithoutTitle)
      .expect(400)

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(blogWithoutUrl)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('fails with status code 401 when you do not provide an authorization token', async () => {
    const response = await api
      .post('/api/blogs')
      .send(helper.newBlog)
      .expect(401)

    expect(response.body.error).toContain('jwt must be provided')
  })

  test('fails with status code 401 when token is invalid', async () => {
    const response = await api
      .post('/api/blogs')
      .send(helper.newBlog)
      .set(
        'Authorization',
        'Bearer keJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImdvbnphbG9jIiwiaWQiOiI2NDkxOWQ3ZGEwNTA0ZWQ1MjEwNzRlNjYiLCJpYXQiOjE2ODcyNjY5NDV9.O1-5RCLNtEHLewjihXmSwRLZIXkE9EI9xTPSYThFA2A',
      )
      .expect(401)

    expect(response.body.error).toContain('invalid token')
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status 204 when the blog is found', async () => {
    const blogsAtStart = await helper.blogsInDb()

    await api
      .delete(`/api/blogs/${blogsAtStart[0].id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)
  })

  test('fails with status 404 when the id is not found', async () => {
    await api
      .delete(`/api/blogs/${await helper.nonExistingId()}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

describe('updating a blog', () => {
  test('succeeds with valid id and data', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const response = await api
      .put(`/api/blogs/${blogsAtStart[0].id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ likes: 10 })
      .expect(200)

    expect(response.body.likes).toEqual(10)
  })

  test('fails with status 400 when data is invalid', async () => {
    const blogsAtStart = await helper.blogsInDb()

    await api
      .put(`/api/blogs/${blogsAtStart[0].id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ likes: 'Hello' })
      .expect(400)
  })

  test('fails with status 404 when the id is not found', async () => {
    await api
      .put(`/api/blogs/${await helper.nonExistingId()}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ likes: 10 })
      .expect(404)
  })

  test('fails with status 400 when the id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .put(`/api/blogs/${invalidId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ likes: 10 })
      .expect(400)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})