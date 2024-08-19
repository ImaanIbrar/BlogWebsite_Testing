import { useDispatch, useSelector } from 'react-redux'
import { removeUser } from '../reducers/userReducer'
import { useNotification } from '../hooks'
import { Link, useNavigate } from 'react-router-dom'
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'

const Header = () => {
  const user = useSelector(({ users }) => users.loggedUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { setSuccessNotification } = useNotification()

  const handleLogout = (e) => {
    e.preventDefault()
    const name = user.name
    dispatch(removeUser())
    navigate('/')
    setSuccessNotification(`${name} logged out`)
  }

  return (
    <AppBar>
      <Toolbar>
        {user ? (
          <Box display="flex" gap={2} sx={{ mx: { xs: 'auto', sm: 0 } }}>
            <Button color="inherit" component={Link} to="/">
              blogs
            </Button>
            <Button color="inherit" component={Link} to="/users">
              users
            </Button>
            <Button variant="text" color="inherit" onClick={handleLogout}>
              logout
            </Button>
          </Box>
        ) : (
          <Box display="flex" gap={2}>
            <Button color="inherit" component={Link} to="/">
              sign in
            </Button>
            <Button color="inherit" component={Link} to="/register">
              sign up
            </Button>
          </Box>
        )}
        {user && (
          <Typography
            variant="body2"
            marginLeft="auto"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            {user.name} logged in
          </Typography>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default Header
