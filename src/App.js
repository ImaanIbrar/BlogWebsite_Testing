import './index.css'
import { useEffect } from 'react'
import LoginForm from './components/LoginForm'
import Notification from './components/Notification'
import { useDispatch, useSelector } from 'react-redux'
import { initializeBlogs } from './reducers/blogReducer'
import { initializeUser } from './reducers/userReducer'
import { Routes, Route } from 'react-router-dom'
import BlogList from './components/BlogList'
import UserList from './components/UserList'
import Header from './components/Header'
import User from './components/User'
import BlogDetail from './components/BlogDetail'
import RegisterForm from './components/RegisterForm'
import { Container, Box } from '@mui/material'

const App = () => {
  const dispatch = useDispatch()
  const user = useSelector(({ users }) => users.loggedUser)

  useEffect(() => {
    dispatch(initializeUser())
    dispatch(initializeBlogs())
  }, [])

  return (
    <Container>
      <Header />
      <Box pt={12} pb={4}>
        <Notification />
        <Routes>
          <Route path="/" element={user ? <BlogList /> : <LoginForm />} />
          <Route path="/blogs/:id" element={<BlogDetail />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/users/:id" element={<User />} />
          <Route path="/register" element={<RegisterForm />} />
        </Routes>
      </Box>
    </Container>
  )
}

export default App
