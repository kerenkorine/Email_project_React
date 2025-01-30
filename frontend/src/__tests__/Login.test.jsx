import { expect, waitFor, render, fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import Login from '../components/Login';
import { test, assert } from 'vitest';

const URL = 'http://localhost:3010/v0/login';
const server = setupServer(
  rest.post('http://localhost:3010/v0/login', (req, res, ctx) => {
    return res(ctx.json({ user: 'test-user' }))
  }),
);

server.listen();

test('renders Login component without crashing', () => {
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
});

test('Handles Successful Login', async () => {
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
  fireEvent.change(screen.getByPlaceholderText('Email Address'), {
    target: { value: 'molly@books.com' },
  });
  fireEvent.change(screen.getByPlaceholderText('Password'), {
    target: { value: 'mollymember' },
  });
  fireEvent.click(screen.getByText('Sign in'));
   
 /* await waitFor(() => expect(screen.getByText((content, element) => {
    return content === 'Error logging in, please try again';
  })).toBeInTheDocument());*/
});

test('Handles Failed Login', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText('Email Address'), {
      target: { value: 'wrong@mail.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByText('Sign in'));
  
    // Wait for the error message to be displayed
    await waitFor(() => expect(screen.getByText('ERROR: Error logging in, please try again')).toBeInTheDocument());
  });

  test('Handles Server Error', async () => {
    server.use(
      rest.get(URL, (req, res, ctx) => {
        return res(ctx.status(500));
      }),
    );
    render(<Login />);
    fireEvent.click(screen.getByText('Sign in'));
    await screen.findByText('ERROR: ', {exact: false});
  });
  
  test('Handles Remember Me Checkbox Change', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  
    // Get the Remember Me checkbox and verify it's initially unchecked
    const rememberMeCheckbox = screen.getByRole('checkbox', { name: 'Remember me' });
    assert.isFalse(rememberMeCheckbox.checked); // Use assert function to check if it's unchecked
  
    // Click the checkbox to toggle it
    fireEvent.click(rememberMeCheckbox);
  
    // Verify that the remember state has been updated to true
    assert.isTrue(rememberMeCheckbox.checked); // Use assert function to check if it's checked
  });