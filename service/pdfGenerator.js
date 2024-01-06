const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AnonymizeUAPlugin = require('puppeteer-extra-plugin-anonymize-ua');
const path = require('path');
// const translate = require('@vitalets/google-translate-api');

const mainUrl = 'https://medium.com/';
const loginUrl =
  'https://medium.com/m/connect/google?state=google-%7Chttps%3A%2F%2Fmedium.com%2F';
const targetUrl = 'https://medium.com/?tag=software-engineering';

puppeteer.use(StealthPlugin());
puppeteer.use(AnonymizeUAPlugin());

async function isLoggedIn(page) {
  console.log('======function isLoggedIn======');
  const signInTag = await page.evaluate(() => {
    const searchInput = document.querySelector(
      'input[aria-controls="searchResults"]',
    );
    console.log(searchInput);
    return searchInput;
  });
  console.log(signInTag);
  return signInTag;
}

async function login(page) {
  console.log('======function login======');
  await page.goto(loginUrl);
  // email
  await page.type('input[type="email"]', 'tworry@gmail.com');
  console.log('input email');
  await page.waitForTimeout(1000);
  await page.click('div#identifierNext > div > button');
  console.log('clicked next button');
  await page.waitForTimeout(2000);
  // password
  await page.waitForSelector('input[type="password"]');
  await page.waitForTimeout(2000);
  await page.type('input[type="password"]', 'wangrui1');
  console.log('input password');
  await page.waitForTimeout(1000);
  await page.waitForSelector('div#passwordNext > div > button');
  await page.waitForTimeout(1000);
  await page.click('div#passwordNext > div > button');
  await page.waitForTimeout(1000);
  await page.waitForNavigation();

  if (page.url() === 'https://medium.com/') {
    console.log('Login successful');
  } else {
    console.log('Login failed');
  }
  await page.waitForTimeout(1000);
}

async function generatePdf() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    ignoreDefaultArgs: ['--disable-extensions'],
    args: [
      '--start-maximized',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--user-data-dir=${path.join(__dirname, 'dev-user-data')}`,
    ],
  });
  const page = await browser.newPage();
  await page.goto(mainUrl, { waitUntil: 'networkidle2' });

  const loggedIn = await isLoggedIn(page);
  if (!loggedIn) {
    await login(page);
  }

  await page.goto(targetUrl, { waitUntil: 'networkidle0' });
  await page.waitForTimeout(1000);

  const articles = await page.$$('article');
  const pagePromises = [];

  for (let i = 0; i < Math.min(articles.length, 10); i++) {
    const article = articles[i];

    const linkHandle = await article.evaluate((node) => {
      const anchorNodes = node.getElementsByTagName('a');
      for (let i = 0; i < anchorNodes.length; i++) {
        if (anchorNodes[i].querySelector('h2')) {
          return anchorNodes[i].href;
        }
      }
    });

    if (linkHandle) {
      const pagePromise = (async () => {
        const newPage = await browser.newPage();
        await newPage.goto(linkHandle, { waitUntil: 'networkidle2' });
        await newPage.pdf({
          path: `public/pdfs/article${i + 1}.pdf`,
          format: 'A4',
        });
        await newPage.close();
      })();
      pagePromises.push(pagePromise);
    }
  }

  await Promise.all(pagePromises);

  await browser.close();

  return true
}

module.exports = generatePdf;
