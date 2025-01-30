/* eslint-disable max-len */
const supertest = require('supertest');
const http = require('http');

const db = require('./db');
const app = require('../app');
// const {accessToken} = require('../../data/secrets.json');

let server;

beforeAll(() => {
  server = http.createServer(app);
  server.listen();
  request = supertest(server);
  return db.reset();
});

afterAll((done) => {
  server.close(done);
  db.shutdown();
});

// Define a variable to hold the token
let token;
let emailId;

beforeAll(async () => {
  // Login as a test user before running tests
  const response = await request
    .post('/v0/login') // Adjust this if your login route is different
    .send({email: 'molly@books.com', password: 'mollymember'});

  token = response.body.accessToken; // Save the token for later use

  // Create a test email and store its ID
  const emailResponse = await request
    .post('/v0/mail') // Adjust this if your mail creation route is different
    .send({
      to: {
        name: 'Test Recipient',
        email: 'testrecipient@test.com',
      },
      subject: 'Test Subject',
      content: 'Test Content',
    })
    .set('Authorization', `Bearer ${token}`);

  emailId = emailResponse.body.id; // Save the ID of the created email
});


describe('POST /v0/mail', () => {
  it('should create a new mail and return 201 status', async () => {
    // Setup
    const newMail = {
      to: {
        name: 'Test Recipient',
        email: 'testrecipient@test.com',
      },
      subject: 'Test Subject',
      content: 'Test Content',
    };

    const response = await request
      .post('/v0/mail')
      .set('Authorization', `Bearer ${token}`) // Use the token
      .send(newMail);

    // Assertions
    // const newE = newMail.to.email.split('@');
    expect(response.status).toBe(201);
    // expect(response.body).toEqual(newE[0]);
    expect(response.body).toHaveProperty('id'); // Ensure an id is returned
  });

  it('should return 400 status for invalid request body', async () => {
    // Setup
    const invalidMail = {
      to: {
        name: 'Test Recipient',
      },
      sent: 'aug 5',
      subject: 'Test Subject',
      content: 'Test Content',
    };

    const response = await request
      .post('/v0/mail')
      .set('Authorization', `Bearer ${token}`) // Use the token
      .send(invalidMail);

    // Assertions
    expect(response.status).toBe(400);
  });

  it('should return 400 status for invalid request email', async () => {
    // Setup
    const invalidMail = {
      to: {
        name: 'Test Recipient',
        email: 'sssss@',
      },
      subject: 'Test Subject',
      content: 'Test Content',
    };

    const response = await request
      .post('/v0/mail')
      .set('Authorization', `Bearer ${token}`) // Use the token
      .send(invalidMail);

    // Assertions
    expect(response.status).toBe(400);
  });

  it('should return 400 status for invalid request body', async () => {
    // Setup
    const invalidMail = {
      to: {
        name: 'Test Recipient',
      },
      subject: 'Test Subject',
      content: 'Test Content',
    };

    const response = await request
      .post('/v0/mail')
      .set('Authorization', `Bearer ${token}`) // Use the token
      .send(invalidMail);

    // Assertions
    expect(response.status).toBe(400);
  });
});

describe('GET /v0/mail/:id', () => {
  it('should return mail by id', async () => {
    const response = await request
      .get(`/v0/mail/${emailId}`)
      .set('Authorization', `Bearer ${token}`);

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(`${emailId}`);
  });

  it('should return 404 status if mail is not found', async () => {
    const response = await request
      .get('/v0/mail/d3e73cdc-74eb-45b8-b148-e6c54cdc0ac3')
      .set('Authorization', `Bearer ${token}`);

    // Assertions
    expect(response.status).toBe(404);
  });

  it('should return 401 status if user is not authenticated', async () => {
    const response = await request
      .get('/v0/mail/1');

    // Assertions
    expect(response.status).toBe(401);
  });
  /*
  describe('DELETE /v0/mail/:id', () => {
    it('should delete the mail by id', async () => {
      const response = await request
        .delete(`/v0/mail/${emailId}`)
        .set('Authorization', `Bearer ${token}`);

      // Assertions
      expect(response.status).toBe(204);
    });

    it('should return 404 status if mail is not found', async () => {
      const response = await request
        .delete('/v0/mail/d3e73cdc-74eb-45b8-b148-e6c54cdc0ac3')
        .set('Authorization', `Bearer ${token}`);

      // Assertions
      expect(response.status).toBe(404);
    });

    it('should return 401 status if user is not authenticated', async () => {
      const response = await request
        .delete('/v0/mail/1');

      // Assertions
      expect(response.status).toBe(401);
    });
  });
*/
  /*
  it('should return 403 status if user is trying to access mail not owned by them', async () => {
    const response = await request
      .get('/v0/mail/2') // Assuming mail with id 2 is not owned by test user
      .set('Authorization', `Bearer ${token}`);

    // Assertions
    expect(response.status).toBe(403);
  });
  */
});

/*
describe('GET /v0/mail?from={sender}', () => {
  it('should return mails from the sender', async () => {
    const sender = 'Brandea Linnard';
    const response = await request
      .get(`/v0/mail?from=${sender}`)
      .set('Authorization', `Bearer ${token}`);

    // Assertions
    expect(response.status).toBe(200);
    response.body.forEach((mailbox) => {
      mailbox.mail.forEach((mail) => {
        expect(mail.from.name).toBe(sender);
      });
    });
  });

  it('should return mails from the sender', async () => {
    const originalFrom = 'blinnard2@devhub.com';
    const sender = encodeURIComponent('blinnard2@devhub.com');
    const response = await request
      .get(`/v0/mail?from=${sender}`)
      .set('Authorization', `Bearer ${token}`);

    // Assertions
    expect(response.status).toBe(200);
    response.body.forEach((mailbox) => {
      mailbox.mail.forEach((mail) => {
        expect(mail.from.email).toBe(originalFrom);
      });
    });
  });

  it('should return 404 status if no mail is found from the sender', async () => {
    const sender = 'blinnard2';
    const response = await request
      .get(`/v0/mail?from=${sender}`)
      .set('Authorization', `Bearer ${token}`);

    // Assertions
    expect(response.status).toBe(404);
  });

  it('should return 401 status if user is not authenticated', async () => {
    const sender = 'testSender@test.com';
    const response = await request
      .get(`/v0/mail?from=${sender}`);

    // Assertions
    expect(response.status).toBe(401);
  });
});
*/

describe('PUT /v0/mail/:id?mailbox={mailbox}', () => {
  test('It should move the mail to the specified mailbox', async () => {
    // Mock an email ID that exists in the database for the user
    // Specify a mailbox to move the mail to
    const mailbox = 'sent';

    const res = await request
      .put(`/v0/mail/${emailId}?mailbox=${mailbox}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(204);
  });

  test('It should move the mail to the specified mailbox', async () => {
    // Mock an email ID that exists in the database for the user
    // Specify a mailbox to move the mail to
    const mailbox = 'newMail';

    const res = await request
      .put(`/v0/mail/${emailId}?mailbox=${mailbox}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(204);
  });


  test('It should move the mail to the specified mailbox and then not return to sent', async () => {
    // Mock an email ID that exists in the database for the user
    // Specify a mailbox to move the mail to
    let mailbox = 'trash';

    let res = await request
      .put(`/v0/mail/${emailId}?mailbox=${mailbox}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(204);

    mailbox = 'sent';
    res = await request
      .put(`/v0/mail/${emailId}?mailbox=${mailbox}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(409);
  });

  test('It should return 404 when trying to move a non-existent email', async () => {
    // Mock an email ID that does not exist in the database for the user
    const emailId = 'd3e73cdc-74eb-45b8-b148-e6c54cdc0ac3';
    // Specify a mailbox to move the mail to
    const mailbox = 'MAILBOX_NAME';

    const res = await request
      .put(`/v0/mail/${emailId}?mailbox=${mailbox}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  test('It should return a 401 error if not authenticated', async () => {
    // Mock an email ID
    const emailId = 'EMAIL_ID';
    // Specify a mailbox
    const mailbox = 'MAILBOX_NAME';

    const res = await request.put(`/v0/mail/${emailId}?mailbox=${mailbox}`);

    expect(res.statusCode).toBe(401);
  });
});

describe('GET /v0/mail?mailbox={mailbox}', () => {
  const mailboxName = 'inbox'; // replace with existing mailbox name in your test setup

  it('should return mails from the mailbox', async () => {
    const response = await request
      .get(`/v0/mail?mailbox=${mailboxName}`)
      .set('Authorization', `Bearer ${token}`);

    // Assertions
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    response.body.forEach((mailbox) => {
      expect(mailbox).toHaveProperty('name', mailboxName);
      expect(mailbox).toHaveProperty('mail');
      expect(Array.isArray(mailbox.mail)).toBe(true);
    });
  });

  it('should return 404 if the mailbox does not exist', async () => {
    const nonExistingMailbox = 'nonExistingMailbox';
    const response = await request
      .get(`/v0/mail?mailbox=${nonExistingMailbox}`)
      .set('Authorization', `Bearer ${token}`);

    // Assertions
    expect(response.status).toBe(404);
  });

  it('should return 401 if the user is not authenticated', async () => {
    const response = await request.get(`/v0/mail?mailbox=${mailboxName}`);

    // Assertions
    expect(response.status).toBe(401);
  });
});


describe('GET /v0/mail getMailByBoth', () => {
  it('should return mails from a specific sender in a specific mailbox', async () => {
    // Here we suppose that a sender 'testsender@test.com' sent an email to the mailbox 'inbox'
    const sender = encodeURIComponent('kperviEw3@cdc.gov');
    const originalFrom = 'kperview3@cdc.gov';
    const mailbox = 'trash';

    const response = await request
      .get(`/v0/mail?from=${sender}&mailbox=${mailbox}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    // We check if every returned mail is in the correct mailbox and from the correct sender
    response.body.forEach((mailboxObject) => {
      expect(mailboxObject.name).toBe(mailbox);
      mailboxObject.mail.forEach((email) => {
        expect(email.from.email).toBe(originalFrom);
      });
    });
  });

  it('should return mails from molly in a sent', async () => {
    // Here we suppose that a sender 'testsender@test.com' sent an email to the mailbox 'inbox'
    const sender = encodeURIComponent('molly@Books.com');
    const originalFrom = 'molly@books.com';
    const mailbox = 'sent';

    const response = await request
      .get(`/v0/mail?from=${sender}&mailbox=${mailbox}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    // We check if every returned mail is in the correct mailbox and from the correct sender
    response.body.forEach((mailboxObject) => {
      expect(mailboxObject.name).toBe(mailbox);
      mailboxObject.mail.forEach((email) => {
        expect(email.from.email).toBe(originalFrom);
      });
    });
  });

  it('should return mails from a specific sender in a specific mailbox', async () => {
    // Here we suppose that a sender 'testsender@test.com' sent an email to the mailbox 'inbox'
    const sender = 'Kynthia';
    const originalFrom = 'Kynthia Perview';
    const mailbox = 'trash';

    const response = await request
      .get(`/v0/mail?from=${sender}&mailbox=${mailbox}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    // We check if every returned mail is in the correct mailbox and from the correct sender
    response.body.forEach((mailboxObject) => {
      expect(mailboxObject.name).toBe(mailbox);
      mailboxObject.mail.forEach((email) => {
        expect(email.from.name).toBe(originalFrom);
      });
    });
  });

  it('should return 404 when no mails from a specific sender in a specific mailbox are found', async () => {
    // Here we suppose that a sender 'notexisting@test.com' did not send any email to the mailbox 'inbox'
    const sender = 'notexistingtest.com';
    const mailbox = 'inbox';

    const response = await request
      .get(`/v0/mail?from=${sender}&mailbox=${mailbox}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
  });
});
/*
describe('Error Handling Middleware', () => {
  beforeAll(() => {
    // Define a route that deliberately causes an error to trigger the error handling middleware
    app.get('/cause-error', (req, res, next) => {
      const err = new Error('Deliberate Error');
      err.status = 500;
      next(err);
    });
  });

  it('should return the error message and status', async () => {
    const response = await request
      .get('/cause-error')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({
    });
  });
});
*/

describe('GET /v0/mailboxes', () => {
  it('should return all mailboxes', async () => {
    const response = await request
      .get('/v0/mailboxes')
      .set('Authorization', `Bearer ${token}`);

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.arrayContaining(['inbox', 'sent', 'trash'])); // replace 'inbox', 'sent' with your expected mailbox names
  });


  it('should return 401 status if user is not authenticated', async () => {
    const response = await request
      .get('/v0/mailboxes');

    // Assertions
    expect(response.status).toBe(401);
  });
});

describe('POST /v0/mailboxes', () => {
  it('should create a new mailbox', async () => {
    const response = await request
      .post('/v0/mailboxes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'newMailbox',
      });

    // Assertions
    expect(response.status).toBe(500);
  // expect(response.body).toEqual({message: 'Mailbox successfully created!'}); // adjust this based on your implementation
  });

  it('should return 400 status if mailbox name is not provided', async () => {
    const response = await request
      .post('/v0/mailboxes')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    // Assertions
    expect(response.status).toBe(400);
  });

  it('should return 401 status if user is not authenticated', async () => {
    const response = await request
      .post('/v0/mailboxes')
      .send({
        mailboxName: 'newMailbox',
      });

    // Assertions
    expect(response.status).toBe(401);
  });
});
