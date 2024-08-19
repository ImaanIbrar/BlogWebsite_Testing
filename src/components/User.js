import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { getAllUsers } from '../reducers/userReducer'
import {
  Box,
  List,
  ListItem,
  Typography,
  Link as MaterialLink,
} from '@mui/material'
const User = () => {
  const dispatch = useDispatch()
  const id = useParams().id
  const user = useSelector(({ users }) => users.users.find((u) => u.id === id))

  useEffect(() => {
    if (!user) {
      dispatch(getAllUsers())
    }
  }, [])

  if (!user)
    return (
      <Box display="grid" justifyContent="center" mt={12}>
        <Typography variant="h5">Loading...</Typography>
      </Box>
    )

  return (
    <Box display="grid" justifyContent="center">
      <Typography textAlign="center" variant="h3" fontSize={36} mb={4}>
        {user.name}
      </Typography>
      <Typography variant="h5">Added blogs</Typography>
      <List dense sx={{ pl: 2 }}>
        {user.blogs.map((blog) => (
          <ListItem
            key={blog.id}
            sx={{ display: 'list-item', listStyleType: 'disc', pl: 1 }}
          >
            <Typography variant="body1">
              <MaterialLink
                component={Link}
                to={`/blogs/${blog.id}`}
                underline="hover"
              >
                {blog.title}
              </MaterialLink>
            </Typography>
          </ListItem>
        ))}
      </List>
    </Box>
  )
}

export default User
