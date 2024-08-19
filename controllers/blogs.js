const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const id = request.params.id
  const blog = await Blog.findById(id).populate('user')
  if (!blog) {
    response.status(404).end()
  }
  response.json(blog)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const blogData = request.body
  const user = request.user

  const blog = new Blog({
    ...blogData,
    user: user._id,
  })

  let savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  savedBlog = await savedBlog.populate('user')

  response.status(201).json(savedBlog)
})

blogsRouter.post('/:id/comments', async (request, response) => {
  const id = request.params.id
  const comment = request.body.comment

  const blog = await Blog.findById(id)

  if (!blog) {
    return response.status(404).end()
  }

  const comments = blog.comments || []

  const blogWithNewComment = {
    ...blog.doc,
    comments: comments.concat(comment),
  }

  let updatedBlog = Blog.findByIdAndUpdate(id, blogWithNewComment, {
    new: true,
  })

  updatedBlog = await updatedBlog.populate('user')
  response.json(updatedBlog)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const id = request.params.id
  const user = request.user

  const blog = await Blog.findById(id)

  if (!blog) {
    return response.status(404).end()
  }

  if (blog.user.toString() !== user._id.toString()) {
    return response
      .status(403)
      .json({ error: 'You can only delete your own blogs' })
  }

  await Blog.deleteOne({ _id: blog.id })
  response.status(204).end()
})

blogsRouter.put('/:id', userExtractor, async (request, response) => {
  const id = request.params.id
  const data = request.body
  const user = request.user

  const blogToUpdate = await Blog.findOne({ _id: id })

  if (!blogToUpdate) {
    return response.status(404).end()
  }

  if (blogToUpdate.user.toString() !== user._id.toString()) {
    return response
      .status(403)
      .json({ error: 'You can only modify your own blogs' })
  }

  const newBlog = {
    ...blogToUpdate.doc,
    ...data,
  }

  let updatedBlog = await Blog.findByIdAndUpdate(id, newBlog, { new: true })
  updatedBlog = await updatedBlog.populate('user')
  response.json(updatedBlog)
})

blogsRouter.put('/:id/likes', async (request, response) => {
  const id = request.params.id

  const blogToUpdate = await Blog.findOne({ _id: id })

  if (!blogToUpdate) {
    return response.status(404).end()
  }

  const newBlog = {
    ...blogToUpdate.doc,
    likes: blogToUpdate.likes + 1,
  }

  let updatedBlog = await Blog.findByIdAndUpdate(id, newBlog, { new: true })
  updatedBlog = await updatedBlog.populate('user')
  response.json(updatedBlog)
})

module.exports = blogsRouter
