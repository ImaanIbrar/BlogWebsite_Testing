const _ = require('lodash')

// eslint-disable-next-line
const dummy = (blogs) => 1

const totalLikes = (blogs) => blogs.reduce((acc, curr) => acc + curr.likes, 0)

const favorite = (blogs) => {
  if (blogs.length < 1) return null
  return blogs
    .map(({ title, author, likes }) => ({ title, author, likes }))
    .reduce((prev, current) => (prev.likes > current.likes ? prev : current), 0)
}

const mostBlogs = (blogs) => {
  if (blogs.length < 1) return null

  const result = _.chain(blogs)
    .countBy('author')
    .entries()
    .maxBy(_.last)
    .value()

  // result = [ 'Robert C. Martin', 3 ]

  return {
    author: result[0],
    blogs: result[1],
  }
}

const mostLikes = (blogs) => {
  if (blogs.length < 1) return null

  const result = _.chain(blogs)
    .groupBy('author')
    .entries()
    .map((author) => ({
      author: author[0],
      likes: author[1].reduce((acc, curr) => acc + curr.likes, 0),
    }))
    .maxBy('likes')
    .value()

  return result
}

module.exports = {
  dummy,
  totalLikes,
  favorite,
  mostBlogs,
  mostLikes,
}
