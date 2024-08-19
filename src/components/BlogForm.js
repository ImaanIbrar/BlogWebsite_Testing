import { useDispatch } from 'react-redux'
import { useField, useNotification } from '../hooks'
import { createBlog } from '../reducers/blogReducer'
import { Box, Button, TextField } from '@mui/material'

const BlogForm = ({ blogFormRef }) => {
  const dispatch = useDispatch()
  const { setSuccessNotification, setErrorNotification } = useNotification()
  const { reset: resetTitle, ...title } = useField('text')
  const { reset: resetAuthor, ...author } = useField('text')
  const { reset: resetUrl, ...url } = useField('text')

  const resetFields = () => {
    resetTitle('')
    resetAuthor('')
    resetUrl('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        title: title.value,
        author: author.value,
        url: url.value,
      }
      blogFormRef.current.toggleVisibility()
      resetFields()
      const error = await dispatch(createBlog(data))
      if (error) {
        return setErrorNotification(error)
      }
      setSuccessNotification(
        `New blog "${data.title}" by ${data.author} created`,
      )
    } catch (exception) {
      setErrorNotification(exception.message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Box display="grid" gap={2} mb={2}>
        <div>
          <TextField
            name="Title"
            placeholder="write blog title here"
            label="Title"
            {...title}
            size="small"
          />
        </div>
        <div>
          <TextField
            name="Author"
            placeholder="John Doe"
            {...author}
            label="Author"
            size="small"
          />
        </div>
        <div>
          <TextField
            name="Url"
            placeholder="https://yoursite.com"
            {...url}
            label="URL"
            size="small"
          />
        </div>
        <Button variant="contained" type="submit">
          create
        </Button>
      </Box>
    </form>
  )
}

export default BlogForm
