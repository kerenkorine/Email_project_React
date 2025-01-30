/* eslint-disable max-len */
/*
#######################################################################
#
# Copyright (C) 2020-2022 David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {Pool} = require('pg');
const secrets = require('../data/secrets');
// const users = require('../data/users.json');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

exports.login = async (req, res) => {
  const {email, password} = req.body;
  const {rows: userRows} = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

  if (userRows.length > 0) {
    const user = userRows[0];

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (passwordMatches) {
      const accessToken = jwt.sign(
        {email: user.email, role: user.role},
        secrets.accessToken, {
          expiresIn: '30m',
          algorithm: 'HS256',
        });
      res.status(200).json({name: user.name, accessToken: accessToken});
    } else {
      res.status(401).send('Invalid credentials');
    }
  } else {
    res.status(401).send('Invalid credentials');
  }
};

exports.check = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  jwt.verify(token, secrets.accessToken, async (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    // Check that the user exists in the database
    const {rows: userRows} = await pool.query('SELECT * FROM users WHERE email = $1', [user.email]);
    if (userRows.length === 0) {
      // User not found in the database
      return res.sendStatus(404);
    }
    // User found, add to request object
    req.user = userRows[0];
    next();
  });
};

