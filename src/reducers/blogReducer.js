import { createSlice } from '@reduxjs/toolkit'
import blogService from '../services/blogs'

const blogSlice = createSlice({
  name: 'blogs',
  initialState: [],
  reducers: {
    add(state, action) {
      state.push(action.payload)
    },
    update(state, action) {
      const { id, updatedBlog } = action.payload
      state.find((blog) => blog.id === id)
      return state.map((blog) => (blog.id === id ? updatedBlog : blog))
    },
    remove(state, action) {
      return state.filter((blog) => blog.id !== action.payload)
    },
    setBlogs(state, action) {
      return action.payload
    },
  },
})

export const { add, update, remove, setBlogs } = blogSlice.actions

export const initializeBlogs = () => {
  return async (dispatch) => {
    const blogs = await blogService.getAll()
    dispatch(setBlogs(blogs))
  }
}

export const createBlog = (blog) => {
  return async (dispatch) => {
    try {
      const newBlog = await blogService.create(blog)
      dispatch(add(newBlog))
    } catch (exception) {
      return exception.response.data.error
    }
  }
}

export const deleteBlog = (id) => {
  return async (dispatch) => {
    await blogService.deleteBlog(id)
    dispatch(remove(id))
  }
}

export const updateBlog = (id, data) => {
  return async (dispatch) => {
    const updatedBlog = await blogService.update(id, data)
    dispatch(update({ id, updatedBlog }))
  }
}

export const addComment = (id, comment) => {
  return async (dispatch) => {
    const blogWithComment = await blogService.addComment(id, comment)
    dispatch(update({ id, updatedBlog: blogWithComment }))
  }
}

export const addLike = (id) => {
  return async (dispatch) => {
    const updatedBlog = await blogService.addLike(id)
    dispatch(update({ id, updatedBlog }))
  }
}

export default blogSlice.reducer
