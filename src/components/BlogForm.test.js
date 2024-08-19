require('@testing-library/jest-dom/extend-expect')
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useDispatch } from 'react-redux' // Import useDispatch
import BlogForm from './BlogForm'

// Mock useDispatch
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}))

describe('<BlogForm />', () => {
  test('the event handler is called with the right details', async () => {
    const createBlog = jest.fn()

    // Mock useDispatch to return a mock dispatch function
    useDispatch.mockReturnValue(jest.fn())

    render(<BlogForm createBlog={createBlog} />)

    const titleInput = screen.getByPlaceholderText('write blog title here')
    const authorInput = screen.getByPlaceholderText('John Doe')
    const urlInput = screen.getByPlaceholderText('https://yoursite.com')
    const button = screen.getByText('create')

    await userEvent.type(titleInput, 'Learning React Testing Library')
    await userEvent.type(authorInput, 'Gonzalo Coradello')
    await userEvent.type(urlInput, 'http://localhost:3001/api/blogs/12')
    await userEvent.click(button)

    // Now, expect the createBlog function to be called
    expect(createBlog).toHaveBeenCalled()
    expect(createBlog).toHaveBeenCalledWith({
      title: 'Learning React Testing Library',
      author: 'Gonzalo Coradello',
      url: 'http://localhost:3001/api/blogs/12',
    })
  })
})
