const express = require('express');
const cors = require('cors');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const OpenApiValidator = require('express-openapi-validator');

const dummy = require('./dummy');
const auth = require('./auth');
const email = require('./email');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const apiSpec = path.join(__dirname, '../api/openapi.yaml');
const apidoc = yaml.load(fs.readFileSync(apiSpec, 'utf8'));

app.use(
  '/v0/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(apidoc),
);

app.use(
  OpenApiValidator.middleware({
    apiSpec: apiSpec,
    validateRequests: true,
    validateResponses: true,
  }),
);

// Your routes go here
app.get('/v0/dummy', dummy.get);
app.post('/v0/login', auth.login);
app.get('/v0/mail', auth.check, function(req, res) {
  if (req.query.mailbox && req.query.from) {
    email.getMailByBoth(req, res);
  } else {
    // Handle case with mailbox query parameter
    email.getMailByMailbox(req, res);
  }
});

app.get('/v0/mailboxes', auth.check, email.getMailboxes);

// GET /v0/mail/{id}
app.get('/v0/mail/:id', auth.check, email.getMailById);


// POST /v0/mail
app.post('/v0/mail', auth.check, email.postMail);

app.post('/v0/mailboxes', auth.check, email.createMailbox);

// PUT /v0/mail/{id}?mailbox={mailbox}

app.put('/v0/mail/:id', auth.check, email.moveMail);

app.use((err, req, res, next) => {
  res.status(err.status).json({
    message: err.message,
    errors: err.errors,
    status: err.status,
  });
});

module.exports = app;
