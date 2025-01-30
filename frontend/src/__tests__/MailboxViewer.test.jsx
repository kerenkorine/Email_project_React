import { render, screen, waitFor } from '@testing-library/react';
import { fireEvent, expect, test, beforeAll, afterAll, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
//import { rest } from 'msw';
import { setupServer } from 'msw/node';
import MailboxViewer from '../components/MailboxViewer';
import MailboxSelector from '../components/MailboxSelector';
const server = setupServer(
  // Your mocked API routes...
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('Renders MailboxViewer component with inbox mails', async () => {
  render(
    <MemoryRouter initialEntries={['/inbox']}>
      <Routes>
        <Route path="/:mailbox" element={<MailboxViewer />} />
      </Routes>
    </MemoryRouter>
  );

  // Wait for the component to fetch and display the mailbox content
  await waitFor(() => screen.getByText('inbox'));

  // Assert that the component renders the mailbox name and test email subject
  expect(screen.getByText('inbox')).toBeInTheDocument();
  expect(screen.getByText('Test Subject 1')).toBeInTheDocument();
});


test('Renders MailboxViewer component without crashing', () => {
    render(<MailboxViewer />);
  });

  test('Renders MailboxSelector component', () => {
    render(<MailboxViewer />);
    // Your expect statements here to check if MailboxSelector is rendered
  });

  test('Renders MailboxSelector component', async () => {
    render(<MailboxViewer />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Select Mailbox/i })).toBeInTheDocument();
    });
  });

  test('Renders MailboxSelector component separately', async () => {
    render(<MailboxSelector />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Select Mailbox/i })).toBeInTheDocument();
    });
  });

  // Test for MailboxSelector component
test('Renders MailboxSelector component', async () => {
    render(<MailboxSelector />);
  
    // Check if the "Select Mailbox" button is present
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Select Mailbox/i })).toBeInTheDocument();
    });
  
    // Check if the "Slug Mail" header is present
    expect(screen.getByRole('heading', { name: /Slug Mail/i })).toBeInTheDocument();
  
    // Check if the "Settings" button is present
    expect(screen.getByRole('button', { name: /Settings/i })).toBeInTheDocument();
  
    // Add more tests for other elements as needed
  });
  
  // Test for MailboxViewer component
  test('Renders MailboxViewer component with inbox mails', async () => {
    render(<MailboxViewer mailbox="inbox" />);
  
    // Wait for the component to fetch and display the mailbox content
    await waitFor(() => screen.getByText(/inbox/i));
  
    // Assert that the component renders the mailbox name and test email subject
    expect(screen.getByText(/inbox/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Subject 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Subject 2/i)).toBeInTheDocument();
    // Add more assertions for other elements as needed
  });
  
  // Test for handling new mailbox creation in MailboxSelector
  test('Creates new mailbox in MailboxSelector', async () => {
    render(<MailboxSelector />);
  
    // Open the "New Mailbox" dialog
    fireEvent.click(screen.getByRole('button', { name: /New Mailbox/i }));
  
    // Fill the mailbox name in the input field
    fireEvent.change(screen.getByLabelText(/Mailbox Name/i), { target: { value: 'New Mailbox' } });
  
    // Click the "Create" button
    fireEvent.click(screen.getByRole('button', { name: /Create/i }));
  
    // Wait for the dialog to close
    await waitFor(() => expect(screen.queryByText(/Please enter the name for the new mailbox./i)).not.toBeInTheDocument());
  
    // Assert that the new mailbox is added to the list
    expect(screen.getByText(/New Mailbox/i)).toBeInTheDocument();
  });
  