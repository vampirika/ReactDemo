import React from 'react';
import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { routes } from './router'; // Import the routes array

// Create a memory router for testing purposes
const testRouter = createMemoryRouter(routes, {
  initialEntries: ['/'], // Adjust initial entry point if necessary
});

test('renders header', () => {
  render(
    <React.StrictMode>
      <RouterProvider router={testRouter} />
    </React.StrictMode>
  );
  const headerElement = screen.getByText(/React Demo/i);
  expect(headerElement).toBeInTheDocument();
});
