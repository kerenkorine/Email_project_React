/* eslint-disable max-len */
// const fs = require('fs');
// const {v4: uuidv4} = require('uuid');
const dbEmail = require('./dbEmail');
const {Pool} = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});


exports.getMailByMailbox = async (req, res) => {
  // Fetch user's ID from the database using their email
  const email = req.user.email;
  const {rows: userRows} = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

  const userId = userRows[0].id;

  const mails = await dbEmail.getMailByMailboxDB(req.query.mailbox, userId);
  if (!mails) {
    res.status(404).send();
  } else {
    res.status(200).json(mails);
  }
};

exports.getMailById = async (req, res) => {
  // Fetch user's ID from the database using their email
  const email = req.user.email;
  const {rows: userRows} = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

  /* // If the user doesn't exist, return an error
  if (userRows.length === 0) {
    res.status(404).send();
    return;
  } */

  const userId = userRows[0].id;

  const mail = await dbEmail.getMailByIdDB(req.params.id, userId);
  if (!mail) {
    res.status(404).send(); // if mail is not found, send 404 status
  } else {
    res.status(200).json(mail); // if mail is found, send the mail as JSON
  }
};


exports.postMail = async (req, res) => {
  // Request body validation
  const {to, subject, content, ...unexpectedProps} = req.body;

  // Check for any unexpected properties
  if (Object.keys(unexpectedProps).length !== 0) {
    return res.status(400).send();
  }

  // Check if the to field has both name and email properties
  if (!to || !to.email) {
    return res.status(400).send();
  }

  if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.email))) {
    return res.status(400).send();
  }

  // Fetch user's ID, name, and email from the database using their email
  const email = req.user.email;
  const {rows: userRows} = await pool.query('SELECT id, name, email FROM users WHERE email = $1', [email]);

  // If the user doesn't exist, return an error
  /* if (userRows.length === 0) {
    res.status(404).send('User not found');
    return;
  } */

  const userId = userRows[0].id;
  const userName = userRows[0].name;
  const userEmail = userRows[0].email;

  const name = to.email.split('@');
  const newMail = {
    to: {
      name: name[0],
      email: to.email,
    },
    subject,
    content,
    from: {
      name: userName,
      email: userEmail,
    },
  };

  const savedMail = await dbEmail.saveNewMail(newMail, userId);
  res.status(201).json(savedMail);
};


exports.moveMail = async (req, res) => {
  const {id} = req.params;
  const {mailbox} = req.query;

  // Fetch user's ID from the database using their email
  const email = req.user.email;
  const {rows: userRows} = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

  /* // If the user doesn't exist, return an error
  if (userRows.length === 0) {
    res.status(404).send('User not found');
    return;
  }*/

  const userId = userRows[0].id;

  // Ensure mailbox name is not 'sent' unless the email is already in 'sent'
  if (mailbox === 'sent') {
    const existingMail = await dbEmail.ifMailboxSent(id, userId);
    if (existingMail !== 'sent') {
      return res.status(409).send();
    } else {
      res.sendStatus(204);
    }
  } else {
    const result = await dbEmail.moveMailToMailboxDB(id, mailbox, userId);

    if (result) {
      res.sendStatus(204);
    } else {
      res.status(404).send();
    }
  }
};


// In your Express router/controller
/*
exports.getMailBySender = async (req, res) => {
  const {from} = req.query;

  // Fetch user's ID from the database using their email
  const email = req.user.email;
  const {rows: userRows} = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

  const userId = userRows[0].id;

  const mails = await dbEmail.getMailBySenderDB(from, userId);

  if (!mails || mails.length === 0) {
    res.status(404).send();
  } else {
    res.status(200).json(mails);
  }
};
*/
exports.getMailByBoth = async (req, res) => {
  const {mailbox, from} = req.query;

  // Fetch user's ID from the database using their email
  const email = req.user.email;
  const {rows: userRows} = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

  const userId = userRows[0].id;

  const mails = await dbEmail.getMailByBothDB(from, mailbox, userId);

  if (!mails || mails.length === 0) {
    res.status(404).send();
  } else {
    res.status(200).json(mails);
  }
};

exports.getMailboxes = async (req, res) => {
  const email = req.user.email;

  // Fetch user's ID from the database using their email
  const {rows: userRows} = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  const userId = userRows[0].id;

  const mailboxRows = await dbEmail.getAllMailboxesDB(userId);

  // Extract the mailbox names into a separate array
  const mailboxNames = mailboxRows.map((row) => row.mailbox);

  res.status(200).json(mailboxNames);
};

exports.createMailbox = async (req, res) => {
  const email = req.user.email;

  // Fetch user's ID from the database using their email
  const {rows: userRows} = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  const userId = userRows[0].id;

  // Fetch the new mailbox name from the request body
  const newMailboxName = req.body.name;

  // Create the new mailbox in the database
  await dbEmail.createMailboxDB(userId, newMailboxName);

  res.status(201).json({message: 'Mailbox created successfully'});
};

