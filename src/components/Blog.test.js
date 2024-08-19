import React from 'react';
import { render } from '@testing-library/react';
import Blog from './Blog';

jest.mock('react-router-dom', () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>,
}));

describe('<Blog />', () => {
  test('renders title and author with correct link', () => {
    const blog = {
      id: '1',
      title: 'Test Blog',
      author: 'Test Author',
    };

    const { getByText } = render(<Blog blog={blog} />);
    const link = getByText(`${blog.title} - ${blog.author}`);
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', `/blogs/${blog.id}`);
  });

  test('throws error if blog prop is missing', () => {
    expect(() => render(<Blog />)).toThrow();
  });
});
