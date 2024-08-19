import { useField } from '../hooks'
import { useDispatch } from 'react-redux'
import { login } from '../reducers/userReducer'
import { useNotification } from '../hooks'
import { Link } from 'react-router-dom'
import {
  Box,
  Button,
  TextField,
  Typography,
  Link as MaterialLink,
} from '@mui/material'

const LoginForm = () => {
  const dispatch = useDispatch()
  const { setSuccessNotification, setErrorNotification } = useNotification()
  const { reset: resetUsername, ...username } = useField('text')
  const { reset: resetPassword, ...password } = useField('password')

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const error = await dispatch(
        login({ username: username.value, password: password.value }),
      )
      if (error) {
        return setErrorNotification('Wrong credentials')
      }
      setSuccessNotification('Logged in successfully')
    } catch (exception) {
      setErrorNotification('Wrong credentials')
    } finally {
      resetUsername()
      resetPassword()
    }
  }

  return (
    <Box display="grid" justifyContent="center">
      <Typography variant="h3" my={3} textAlign="center">
        Sign in
      </Typography>
      <form onSubmit={handleLogin}>
        <Box display="grid" gap={2}>
          <div>
            <TextField
              id="username"
              name="Username"
              label="username"
              {...username}
            />
          </div>
          <div>
            <TextField
              id="password"
              name="Password"
              label="password"
              type="password"
              {...password}
            />
          </div>
          <Button
            sx={{ display: 'block', marginInline: 'auto' }}
            type="submit"
            variant="contained"
            color="primary"
          >
            login
          </Button>
        </Box>
      </form>
      <MaterialLink
        variant="body1"
        component={Link}
        underline="none"
        to="/register"
        textAlign="center"
        mt={2}
      >
        Sign up
      </MaterialLink>
    </Box>
  )
}

export default LoginForm
