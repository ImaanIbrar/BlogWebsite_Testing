import { createSlice } from '@reduxjs/toolkit'
import loginService from '../services/login'
import blogService from '../services/blogs'
import userService from '../services/users'

const initialState = {
  loggedUser: null,
  users: [],
}

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUser(state, action) {
      const user = action.payload
      blogService.setToken(user.token)
      state.loggedUser = user
    },
    removeUser(state) {
      window.localStorage.removeItem('user')
      state.loggedUser = null
    },
    setUserList(state, action) {
      const users = action.payload
      state.users = users
    },
    register(state, action) {
      const newUser = action.payload
      state.users.push(newUser)
      blogService.setToken(newUser.token)
      state.loggedUser = newUser
    },
  },
})

export const { setUser, removeUser, setUserList, register } = userSlice.actions

export const login = (credentials) => {
  return async (dispatch) => {
    try {
      const user = await loginService.login(credentials)
      window.localStorage.setItem('user', JSON.stringify(user))
      dispatch(setUser(user))
    } catch (exception) {
      return exception.response.data.error
    }
  }
}

export const initializeUser = () => {
  return async (dispatch) => {
    const loggedUser = window.localStorage.getItem('user')
    if (loggedUser) {
      const user = JSON.parse(loggedUser)
      dispatch(setUser(user))
    }
  }
}

export const getAllUsers = () => {
  return async (dispatch) => {
    const users = await userService.getAll()
    dispatch(setUserList(users))
  }
}

export const registerUser = ({ name, username, password }) => {
  return async (dispatch) => {
    try {
      const newUser = await userService.register({ name, username, password })
      dispatch(register(newUser))
    } catch (exception) {
      return exception.response.data.error
    }
  }
}

export default userSlice.reducer
