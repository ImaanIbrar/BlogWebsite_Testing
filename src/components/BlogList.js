import { useSelector } from 'react-redux'
import Blog from './Blog'
import BlogForm from './BlogForm'
import Togglable from './Togglable'
import { useRef } from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableContainer,
  Typography,
} from '@mui/material'

const BlogList = () => {
  const blogs = useSelector(({ blogs }) => blogs)
  const blogFormRef = useRef()

  if (!blogs) {
    return (
      <Box display="grid" justifyContent="center" mt={12}>
        <Typography variant="h5">Loading...</Typography>
      </Box>
    )
  }

  return (
    <div>
      <Typography variant="h3" textAlign="center" mb={4}>
        Blogs
      </Typography>
      <Togglable buttonLabel="new blog" ref={blogFormRef}>
        <BlogForm blogFormRef={blogFormRef} />
      </Togglable>
      <Box maxWidth={650} mx="auto" mt={2}>
        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              {[...blogs]
                .sort((a, b) => b.likes - a.likes)
                .map((blog) => (
                  <Blog key={blog.id} blog={blog} />
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </div>
  )
}

export default BlogList
