import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  addComment,
  addLike,
  deleteBlog,
  initializeBlogs,
} from '../reducers/blogReducer'
import { useNotification } from '../hooks'
import {
  Typography,
  Link as MaterialLink,
  Box,
  Button,
  TextField,
  List,
  ListItem,
} from '@mui/material'

const BlogDetail = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const id = useParams().id
  const blog = useSelector(({ blogs }) => blogs.find((b) => b.id === id))
  const user = useSelector(({ users }) => users.loggedUser)
  const { setSuccessNotification, setErrorNotification } = useNotification()
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (!blog) {
      dispatch(initializeBlogs())
    }
  }, [])

  const handleUpdate = (id, data) => {
    try {
      dispatch(addLike(id, data))
    } catch (exception) {
      setErrorNotification(exception.message)
    }
  }

  const handleLike = () => {
    handleUpdate(id, { likes: blog.likes + 1 })
  }

  const handleDelete = () => {
    if (
      window.confirm(
        `Do you want to remove blog ${blog.title} by ${blog.author}?`,
      )
    ) {
      try {
        dispatch(deleteBlog(id))
        setSuccessNotification('Blog deleted')
        navigate('/')
      } catch (exception) {
        setErrorNotification(exception.message)
      }
    }
  }

  const handleComment = (e) => {
    e.preventDefault()
    dispatch(addComment(id, comment))
    setComment('')
  }

  if (!blog)
    return (
      <Box display="grid" justifyContent="center" mt={12}>
        <Typography variant="h5">Loading...</Typography>
      </Box>
    )

  return (
    <Box display="grid" justifyContent="center">
      <Typography textAlign="center" variant="h3" fontSize={36} mb={1}>
        {blog.title}
      </Typography>
      <Typography textAlign="center" variant="subtitle1">
        {blog.author}
      </Typography>
      <Typography variant="subtitle2" mt={2}>
        Added by:
        <MaterialLink
          component={Link}
          underline="none"
          to={`/users/${blog.user.id}`}
          ml={1}
        >
          {blog.user.name}
        </MaterialLink>
      </Typography>
      <Typography variant="subtitle2">
        Link:
        <MaterialLink
          href={blog.url}
          target="_blank"
          rel="noopener noreferrer"
          ml={1}
        >
          {blog.url}
        </MaterialLink>
      </Typography>

      <Box my={4} display="flex" justifyContent="center" gap={2}>
        <Typography variant="subtitle1" lineHeight={2}>
          {blog.likes} likes
        </Typography>
        <Button variant="contained" size="small" onClick={handleLike}>
          like
        </Button>
        {blog.user.name === user.name && (
          <Button
            variant="contained"
            size="small"
            onClick={handleDelete}
            style={{ display: 'block' }}
          >
            remove
          </Button>
        )}
      </Box>
      <div>
        <Typography variant="h5">Comments</Typography>
        <List dense>
          {blog.comments.map((comment) => (
            <ListItem key={comment}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                fill="currentColor"
                className="bi bi-chat-left-text"
                viewBox="0 0 16 16"
              >
                {' '}
                <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />{' '}
                <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6zm0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z" />{' '}
              </svg>
              <Typography variant="body2" ml={1}>
                {comment}
              </Typography>
            </ListItem>
          ))}
        </List>
        <Box display="grid" justifyContent="center" my={2}>
          <form onSubmit={handleComment}>
            <TextField
              type="text"
              size="small"
              label="Comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              size="small"
              sx={{ mx: 'auto', display: 'block', mt: 1 }}
            >
              add comment
            </Button>
          </form>
        </Box>
      </div>
    </Box>
  )
}

export default BlogDetail
