import { TableCell, TableRow, Link as MaterialLink } from '@mui/material'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

const Blog = ({ blog }) => {
  const { id, title, author } = blog

  return (
    <TableRow className="blog">
      <TableCell>
        <MaterialLink
          component={Link}
          underline="hover"
          to={`/blogs/${id}`}
          display="block"
          textAlign="left"
          px={4}
        >
          {title} - {author}
        </MaterialLink>
      </TableCell>
    </TableRow>
  )
}

Blog.propTypes = {
  blog: PropTypes.object.isRequired,
}

export default Blog
