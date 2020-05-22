const puppeteer = require('puppeteer');
const fs = require('fs');
const C = require('./constants');
const USERNAME_SELECTOR = '#username';
const PASSWORD_SELECTOR = '#password';
const CTA_SELECTOR = '#app__container > main > div:nth-child(2) > form > div.login__form_action_container > button';
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
  await page.waitFor(4*1000);
  await autoScroll(page);
  //FETCHING NAMES AND URLS
const text = await page.evaluate(() => Array.from(document.querySelectorAll('.mn-connection-card__name.t-16.t-black.t-bold'), element => element.textContent));
const urls = await page.evaluate(() => Array.from(document.querySelectorAll('a.mn-connection-card__link.ember-view'), element => element.getAttribute('href')));

//MERGING TWO ARRAYS
var result =  urls.reduce(function(result, field, index) {
  result[text[index]] = field;
  return result;
}, {})

// console.log(result);
// console.log(urls);
await page.screenshot({path: 'linkedln.png'});

fs.writeFile('./info.json', JSON.stringify(result), err => err ? console.log(err): null); //STORING DATA IN JSON FILE
  await browser.close();
})();

//FOR MAKING THE PAGE SCROLL TILL END
async function autoScroll(page){
  await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
          var totalHeight = 0;
          var distance = 100;
          var timer = setInterval(() => {
              var scrollHeight = document.body.scrollHeight;
              window.scrollBy(0, distance);
              totalHeight += distance;
              if(totalHeight >= scrollHeight){
                  clearInterval(timer);
                  resolve();
              }
          }, 100);
      });
  });
}