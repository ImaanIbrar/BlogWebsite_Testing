const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'The importance of testing',
    author: 'Gonzalo Coradello',
    url: 'http://localhost:3001/api/blogs/1',
    likes: 2,
  },
  {
    title: 'How to test the backend with Jest and Supertest',
    author: 'Gonzalo Coradello',
    url: 'http://localhost:3001/api/blogs/2',
    likes: 5,
  },
]

const newBlog = {
  title: 'Using async/await in JavaScript',
  author: 'Gonzalo Coradello',
  url: 'http://localhost:3001/api/blogs/3',
  likes: 0,
}

const nonExistingId = async () => {
  const blog = new Blog(newBlog)
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map((user) => user.toJSON())
}

module.exports = {
  initialBlogs,
  newBlog,
  nonExistingId,
  blogsInDb,
  usersInDb,
}
