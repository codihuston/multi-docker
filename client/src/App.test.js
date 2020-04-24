import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  // REMARKING this code b/c our <App/> component makes a request to an
  // external service that won't exist at test time. If this were a real app,
  // we would mock out that service so this test could run.

  // const { getByText } = render(<App />);
  // const linkElement = getByText(/learn react/i);
  // expect(linkElement).toBeInTheDocument();
});
