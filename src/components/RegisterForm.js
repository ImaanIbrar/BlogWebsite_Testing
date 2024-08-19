import { useField } from '../hooks'
import { useDispatch } from 'react-redux'
import { registerUser } from '../reducers/userReducer'
import { useNotification } from '../hooks'
import { Link, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  TextField,
  Typography,
  Link as MaterialLink,
} from '@mui/material'

const RegisterForm = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { setSuccessNotification, setErrorNotification } = useNotification()
  const { reset: resetName, ...name } = useField('text')
  const { reset: resetUsername, ...username } = useField('text')
  const { reset: resetPassword, ...password } = useField('password')

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const error = await dispatch(
        registerUser({
          name: name.value,
          username: username.value,
          password: password.value,
        }),
      )
      if (error) {
        return setErrorNotification(error)
      }
      setSuccessNotification('Registered successfully')
    } catch (exception) {
      setErrorNotification(exception)
    } finally {
      resetName()
      resetUsername()
      resetPassword()
      navigate('/')
    }
  }

  return (
    <Box display="grid" justifyContent="center">
      <Typography variant="h3" my={3} textAlign="center">
        Sign up
      </Typography>
      <form onSubmit={handleRegister}>
        <Box display="grid" gap={2}>
          <div>
            <TextField id="username" name="Name" label="name" {...name} />
          </div>
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
            variant="contained"
            color="primary"
            type="submit"
          >
            register
          </Button>
        </Box>
      </form>
      <MaterialLink
        variant="body1"
        component={Link}
        underline="none"
        to="/"
        textAlign="center"
        mt={2}
      >
        Sign in
      </MaterialLink>
    </Box>
  )
}

export default RegisterForm
