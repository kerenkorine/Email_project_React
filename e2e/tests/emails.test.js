const puppeteer = require('puppeteer');
const http = require('http');
const path = require('path');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

require('dotenv').config();
const app = require('../../backend/src/app');

let backend;
let frontend;
let browser;
let page;

beforeAll(() => {
  backend = http.createServer(app);
  backend.listen(3010, () => {
    console.log('Backend Running at http://localhost:3010');
  });
  frontend = http.createServer(
    express()
      .use('/v0', createProxyMiddleware({ 
        target: 'http://localhost:3010/',
        changeOrigin: true}))
      .use('/static', express.static(
        path.join(__dirname, '..', '..', 'frontend', 'build', 'static')))
      .get('*', function(req, res) {
        res.sendFile('index.html', 
            {root:  path.join(__dirname, '..', '..', 'frontend', 'build')})
      })
  );
  frontend.listen(3000, () => {
    console.log('Frontend Running at http://localhost:3000');
  });
});

afterAll((done) => {
  backend.close(() => { 
    frontend.close(done);
  });
});

beforeEach(async () => {
  browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--headless',
    ],
  });
  page = await browser.newPage();
});

afterEach(async () => {
  await browser.close();
});

test('Login test', async () => {
    await page.goto('http://localhost:3000/');
  
    await page.type('input[name="email"]', 'molly@books.com');
    await page.type('input[name="password"]', 'mollymember');
  
    await page.click('input[type="submit"]');
  
    await page.waitForNavigation({ url: 'http://localhost:3000/MailboxViewer' });
    
    const pageTitle = await page.title();
    expect(pageTitle).toBe('MailboxViewer');
  });
  
  test('MailboxViewer test', async () => {
    await page.goto('http://localhost:3000/MailboxViewer');
    // This will change based on the number of mails you have
    const numberOfMails = await page.$$eval('.mailItem', items => items.length);
    
    // Replace 10 with the number of mails you expect
    expect(numberOfMails).toBe(4);
  });
  
  test('MailViewer test', async () => {
    await page.goto('http://localhost:3000/mail/1');
    
    const mailSubject = await page.$eval('.mailSubject', el => el.innerText);
    
    // Replace "Subject 1" with the expected mail subject
    expect(mailSubject).toBe("Up-sized solution-oriented task-force");
  });
  