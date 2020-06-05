const puppeteer = require('puppeteer');
const fs = require('fs');
const C = require('./login_details');
const inp =require('./input');
const USERNAME_SELECTOR = '#username';
const PASSWORD_SELECTOR = '#password';
const CTA_SELECTOR = '#app__container > main > div:nth-child(2) > form > div.login__form_action_container > button';
const location='#ember165';

(async () => {
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.linkedin.com/login?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin');
  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(C.username);
  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(C.password);
  await page.click(CTA_SELECTOR);

  await page.waitForNavigation();

  await page.goto('https://www.linkedin.com/mynetwork/invite-connect/connections/');
  
  await page.evaluate(scrollToBottom);
  await page.waitFor(3000);
 
const text = await page.evaluate(() => Array.from(document.querySelectorAll('.mn-connection-card__name.t-16.t-black.t-bold'), element => element.textContent));
const urls = await page.evaluate(() => Array.from(document.querySelectorAll('a.mn-connection-card__link.ember-view'), element => element.getAttribute('href')));

var result =  urls.reduce(function(result, field, index) {
  result[text[index]] = field;
  return result;
}, {})


fs.writeFile('./connections.json', JSON.stringify(result), err => err ? console.log(err): null);

await page.goto('https://www.linkedin.com/search/results/people/?facetNetwork=%5B%22F%22%5D&origin=MEMBER_PROFILE_CANNED_SEARCH');
await page.setViewport({
  width: 1900,
  height: 1080,
});

await page.click(location);
await page.click('#ember169 > input[type=text]');
await page.keyboard.type(inp.query);

await page.waitForSelector('#triggered-expanded-ember168');
await page.waitFor(3000);
await page.click('#triggered-expanded-ember168');
await page.waitFor(3000);
// await page.screenshot({path: 'page1.png'});
await page.click('#ember173');
await page.waitFor(4000);

// await page.screenshot({path: 'page2.png'});

const n2 = await page.evaluate(() => Array.from(document.querySelectorAll('.name.actor-name'), element => element.textContent));
await page.waitFor(3000);
const ul = await page.evaluate(() => Array.from(document.querySelectorAll('a.search-result__result-link.ember-view'), element => element.getAttribute('href')));

var result2 =  ul.reduce(function(result2, field, index) {
  result2[n2[index]] = field;
  return result2;
}, {})
await page.waitFor(3000);

fs.writeFile('./connections_filter.json', JSON.stringify(result2), err => err ? console.log(err): null);

await page.waitFor(3000);
await browser.close();
})();

async function scrollToBottom() {
  await new Promise(resolve => {
    const distance = 80; // should be less than or equal to window.innerHeight
    const delay = 100;
    const timer = setInterval(() => {
      document.scrollingElement.scrollBy(0, distance);
      if (document.scrollingElement.scrollTop + window.innerHeight >= document.scrollingElement.scrollHeight) {
        clearInterval(timer);
        resolve();
      }
    }, delay);
  });
}
