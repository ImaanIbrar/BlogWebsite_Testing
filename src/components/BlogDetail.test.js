import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import BlogDetail from './BlogDetail';
import store from '../store'; // Assuming store is exported from '../store'

beforeAll(() => {
    Object.defineProperty(window, 'navigator', {
      value: {
        clipboard: {
          writeText: jest.fn(),
        },
      },
    });
  });
  
describe('<BlogDetail />', () => {
  const blog = {
    id: '1',
    title: 'Unit testing in React',
    author: 'Gonzalo Coradello',
    url: 'http://localhost:3001/api/blogs/1',
    user: { id: '1', name: 'Gonzalo Coradello' },
    likes: 0,
    comments: ['First comment', 'Second comment'],
  };

  beforeEach(() => {
    render(
      <Provider store={store}>
        <Router>
          <BlogDetail />
        </Router>
      </Provider>
    );
  });

  test('renders blog details', async () => {
    // Wait for loading state to resolve
    await waitFor(() => {
      expect(screen.getByText('Unit testing in React')).toBeInTheDocument();
      expect(screen.getByText('Gonzalo Coradello')).toBeInTheDocument();
      expect(screen.getByText('http://localhost:3001/api/blogs/1')).toBeInTheDocument();
      expect(screen.getByText('Gonzalo Coradello')).toBeInTheDocument();
      expect(screen.getByText('add comment')).toBeInTheDocument();
    });

    // Check if the comments are rendered
    expect(screen.getByText('First comment')).toBeInTheDocument();
    expect(screen.getByText('Second comment')).toBeInTheDocument();
  });

  test('handles like button click', async () => {
    // Mock dispatch action
    const mockDispatch = jest.spyOn(store, 'dispatch');
    mockDispatch.mockResolvedValueOnce();

    // Click on the like button
    userEvent.click(screen.getByText('like'));

    // Check if the dispatch was called
    expect(mockDispatch).toHaveBeenCalledWith(addLike(blog.id, { likes: 1 }));
  });

  test('handles comment submission', async () => {
    // Mock dispatch action
    const mockDispatch = jest.spyOn(store, 'dispatch');
    mockDispatch.mockResolvedValueOnce();

    // Enter a comment and submit
    userEvent.type(screen.getByLabelText('Comment'), 'New comment');
    userEvent.click(screen.getByText('add comment'));

    // Check if the dispatch was called with the correct arguments
    expect(mockDispatch).toHaveBeenCalledWith(addComment(blog.id, 'New comment'));

    // Check if the comment input is cleared after submission
    expect(screen.getByLabelText('Comment')).toHaveValue('');
  });
});
