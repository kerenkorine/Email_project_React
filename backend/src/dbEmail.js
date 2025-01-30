/* eslint-disable max-len */
const {Pool} = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});


exports.getMailByMailboxDB = async (mailboxName, userId) => {
  // Check if the mailbox exists for the user
  const mailboxExistQuery = {
    text: 'SELECT * FROM mail WHERE mailbox = $1 AND user_id = $2',
    values: [mailboxName, userId],
  };

  const {rows: mailboxRows} = await pool.query(mailboxExistQuery);

  // If the mailbox does not exist, return nothing
  if (!mailboxRows[0]) {
    return;
  }

  // If the mailbox exists, fetch the mails from the mailbox for the user
  const selectMail = 'SELECT * FROM mail WHERE mailbox = $1 AND user_id = $2';

  const mailQuery = {
    text: selectMail,
    values: [mailboxName, userId],
  };

  const {rows} = await pool.query(mailQuery);

  const response = [
    {
      name: mailboxName,
      mail: rows,
    },
  ];
    // Return the response
  return response;
};

/*
const removeContentProperty = (mails) => {
  return mails.map((row) => {
    // Deconstruct row into id, mailbox, and mail
    const {id, mail} = row;
    // eslint-disable-next-line no-unused-vars
    const {content, ...mailWithoutContent} = mail;
    // Include id in returned object
    return {id, ...mailWithoutContent};
  });
};*/


exports.getMailByIdDB = async (id, userId) => {
  const selectMail = 'SELECT id, mailbox, mail FROM mail WHERE id = $1 AND user_id = $2';

  const mailQuery = {
    text: selectMail,
    values: [id, userId],
  };

  const {rows} = await pool.query(mailQuery);

  if (rows.length === 0) {
    return null;
  }

  return {
    id: rows[0].id,
    ...rows[0].mail,
  };
};

exports.saveNewMail = async (newMail, userId) => {
  const queryText = 'INSERT INTO mail(mailbox, mail, user_id) VALUES($1, $2, $3) RETURNING *';
  const mailboxName = 'sent';

  const currentTime = new Date().toISOString();

  // Add missing properties
  newMail.sent = currentTime;
  newMail.received = currentTime;

  const values = [mailboxName, newMail, userId];

  const {rows} = await pool.query(queryText, values);

  return {
    id: rows[0].id,
    ...rows[0].mail,
  };
};


exports.moveMailToMailboxDB = async (id, mailboxName, userId) => {
  const updateMail = 'UPDATE mail SET mailbox = $1 WHERE id = $2 AND user_id = $3 RETURNING *';
  const mailQuery = {
    text: updateMail,
    values: [mailboxName, id, userId],
  };
  const {rows} = await pool.query(mailQuery);

  if (rows.length === 0) {
    return null;
  }

  return {
    id: rows[0].id,
    ...rows[0].mail,
  }; // return the updated mail
};

exports.ifMailboxSent = async (id, userId) => {
  const existingMail = 'SELECT id, mailbox, mail FROM mail WHERE id = $1 AND user_id = $2';

  const mailQuery = {
    text: existingMail,
    values: [id, userId],
  };
  const {rows} = await pool.query(mailQuery);

  return rows[0].mailbox;
};
/*
exports.getMailBySenderDB = async (sender, userId) => {
  let queryText;
  const values = [`%${sender.toLowerCase()}%`, userId];

  // Check if sender is a correctly formatted email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sender)) {
    queryText = `
          SELECT id, mailbox, mail
          FROM mail
          WHERE user_id = $2 AND lower(mail->'from'->>'email') LIKE $1
        `;
  } else {
    // If not a correctly formatted email, assume sender is a name
    queryText = `
          SELECT id, mailbox, mail
          FROM mail
          WHERE user_id = $2 AND lower(mail->'from'->>'name') LIKE $1
        `;
  }

  const {rows} = await pool.query(queryText, values);

  // Object to group emails by mailbox
  const groupedEmails = {};

  rows.forEach((row) => {
    const {id, mailbox, mail} = row;
    // eslint-disable-next-line no-unused-vars
    const email = {id, ...mail};

    // If the mailbox doesn't exist in groupedEmails, create it
    groupedEmails[mailbox] = {name: mailbox, mail: []};
  });

  // Return an array of mailboxes
  return Object.values(groupedEmails);
}; */

exports.getMailByBothDB = async (sender, mailboxName, userId) => {
  let queryText;
  const values = [`%${sender.toLowerCase()}%`, mailboxName, userId];

  // Check if sender is a correctly formatted email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sender)) {
    queryText = `
        SELECT id, mailbox, mail
        FROM mail
        WHERE user_id = $3 AND lower(mail->'from'->>'email') LIKE $1 AND mailbox = $2
      `;
  } else {
    // If not a correctly formatted email, assume sender is a name
    queryText = `
        SELECT id, mailbox, mail
        FROM mail
        WHERE user_id = $3 AND lower(mail->'from'->>'name') LIKE $1 AND mailbox = $2
      `;
  }

  const {rows} = await pool.query(queryText, values);

  // Object to group emails by mailbox
  const groupedEmails = {};

  rows.forEach((row) => {
    const {id, mailbox, mail} = row;
    const email = {id, ...mail};

    // If the mailbox doesn't exist in groupedEmails, create it
    if (!groupedEmails[mailbox]) {
      groupedEmails[mailbox] = {name: mailbox, mail: []};
      // Push email into appropriate mailbox
      groupedEmails[mailbox].mail.push(email);
    } else {
      // Push email into appropriate mailbox
      groupedEmails[mailbox].mail.push(email);
    }
  });

  // Return an array of mailboxes
  return Object.values(groupedEmails);
};


exports.getAllMailboxesDB = async (userId) => {
  const {rows: mailboxRows} = await pool.query('SELECT DISTINCT mailbox FROM mail WHERE user_id = $1', [userId]);
  return mailboxRows;
};

exports.createMailboxDB = async (userId, newMailboxName) => {
  // Create an empty email object
  const emptyMail = {
    from: {
      name: '',
      email: '',
    },
    to: {
      name: '',
      email: '',
    },
    received: '',
    sent: '',
    content: '',
    subject: '',
  };

  // Insert a new mailbox into the 'mail' table
  await pool.query('INSERT INTO mail(mailbox, mail, user_id) VALUES ($1, $2, $3)', [newMailboxName, JSON.stringify(emptyMail), userId]);
};

