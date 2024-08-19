import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllUsers } from '../reducers/userReducer'
import { Link } from 'react-router-dom'
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Link as MaterialLink,
  Box,
} from '@mui/material'

const UserList = () => {
  const dispatch = useDispatch()
  const users = useSelector(({ users }) => users.users)

  useEffect(() => {
    dispatch(getAllUsers())
  }, [])

  if (!users)
    return (
      <Box display="grid" justifyContent="center" mt={12}>
        <Typography variant="h5">Loading...</Typography>
      </Box>
    )

  return (
    <div>
      <Typography variant="h3" textAlign="center" mb={4}>
        Users
      </Typography>
      <Box maxWidth={750} mx="auto">
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Blogs created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <MaterialLink
                      component={Link}
                      to={`/users/${u.id}`}
                      underline="hover"
                    >
                      {u.name}
                    </MaterialLink>
                  </TableCell>
                  <TableCell>{u.blogs.length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </div>
  )
}

export default UserList
