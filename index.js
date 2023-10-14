const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/scrape', async (req, res) => {
  const { profileUrl } = req.query;

  if (!profileUrl) {
    res.status(400).send('Invalid URL');
    return;
  }

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(profileUrl);

  await page.waitForSelector('.org-top-card-summary-info-list__info-item');

  const followers = await page.evaluate(() => {
    const followersText = document.querySelector('.org-top-card-summary-info-list__info-item').textContent;
    return parseInt(followersText.replace(/\D/g, ''), 10);
  });

  const following = await page.evaluate(() => {
    const followingText = document.querySelectorAll('.org-top-card-summary-info-list__info-item')[1].textContent;
    return parseInt(followingText.replace(/\D/g, ''), 10);
  });

  await browser.close();

  res.json({ followers, following });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

