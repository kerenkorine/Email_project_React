/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
const supertest = require('supertest');
const http = require('http');

const db = require('./db');
const app = require('../app');
const {Pool} = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

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

test('POST Login Valid Credentials', async () => {
  await request
    .post('/v0/login')
    .send({
      email: 'molly@books.com',
      password: 'mollymember',
    })
    .expect(200)
    .expect('Content-Type', /json/)
    .then((res) => {
      expect(res).toBeDefined();
      expect(res.body).toBeDefined();
      expect(res.body.name).toEqual('Molly Member');
      expect(res.body.accessToken).toBeDefined();
    });
});

test('POST Login Invalid Credentials', async () => {
  await request
    .post('/v0/login')
    .send({
      email: 'molly@books.com',
      password: 'wrongPassword',
    })
    .expect(401);
});

test('POST Login Invalid Credentials', async () => {
  await request
    .post('/v0/login')
    .send({
      email: 'dddddooks.com',
      password: 'wrongPassword',
    })
    .expect(401)
    .then((res) => {
      // Add assertions based on your server's response when the user does not exist
      // For example, if your server returns an error message, you might do:
      expect(res.body.message).toBeUndefined();
    });
});

describe('check middleware', () => {
  test('it should return 401 when the token is not provided', async () => {
    const res = await request.get('/v0/mail');

    expect(res.statusCode).toBe(401);
  });
  let token;

  beforeAll(async () => {
    const response = await request
      .post('/v0/login')
      .send({email: 'molly@books.com', password: 'mollymember'}); // replace with Molly's real password

    token = response.body.accessToken;
  });

  test('it should return 200 when the token is valid', async () => {
    const mailbox = 'sent';
    const res = await request
      .get(`/v0/mail?mailbox=${mailbox}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });

  test('it should return 403 when the token is invalid', async () => {
    const mailbox = 'sent';
    const res = await request
      .get(`/v0/mail?mailbox=${mailbox}`)
      .set('Authorization', 'Bearer invalidToken');

    expect(res.statusCode).toBe(403);
  });

  test('it should return 404 when the token is valid but the user does not exist in the database', async () => {
    // delete the user from the database
    // await deleteUser('molly@books.com');
    await deleteUser('molly@books.com');
    const mailbox = 'sent';
    const res = await request
      .get(`/v0/mail?mailbox=${mailbox}`)
      .set('Authorization', `Bearer ${token}`); // token of the deleted user

    expect(res.statusCode).toBe(404);

    // re-insert the user
    await insertUser(
      'molly@books.com',
      '$2b$10$Y00XOZD/f5gBSpDusPUgU.iJufk6Nxx6gAoHRG8t2eHyGgoP2bK4y',
      'member',
      'Molly Member',
    );

    async function deleteUser(email) {
      const {rows: userRows} = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      const userId = userRows[0].id;

      // First delete the mails associated with the user
      await pool.query('DELETE FROM mail WHERE user_id = $1', [userId]);

      // Then delete the user
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    }

    async function insertUser(email, password, role, name) {
      await pool.query(
        'INSERT INTO users(email, password, role, name) VALUES ($1, $2, $3, $4)',
        [email, password, role, name],
      );
    }
  });
});

describe('Authentication Middleware', () => {
  // ...

  it('should return 401 Unauthorized if the Authorization header is not provided', async () => {
    const response = await request
      .get('/v0/mail') // replace with an actual protected endpoint in your app
    // Do not set Authorization header
      .send();

    expect(response.status).toBe(401);
  });

  // ...
});


