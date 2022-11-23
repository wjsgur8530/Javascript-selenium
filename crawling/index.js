var webdriver = require('selenium-webdriver');
var By = require('selenium-webdriver').By;
var cheerio = require('cheerio');
var request = require('request');
var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();
const db_config = require(__dirname + '/database.js');
const conn = db_config.init();
db_config.connect(conn);

// URL 호출
var url = "http://www.menupan.com/restaurant/search/search_main_sub_area.asp?areacode=cc207";
driver.get(url);

// 데이터 수집 배열
var imgList = [];
var titleList = [];

var maxPage = driver.findElement(By.xpath('/html/body/center/div[2]/div[5]/div/div[3]/a[4]'));

maxPage.then(function(value) {
  value.getText().then(function(maxPage) {
    console.log("해당 페이지의 게시판 마지막 번호: ", maxPage);
    return maxPage
  }).then(function(maxPage) {
    console.log("가져온 마지막 페이지 번호: ", maxPage);
    for(let i = 1; i < 2; i++) {
      setTimeout(() => {
        driver.findElement(By.xpath('/html/body/center/div[2]/div[5]/div/div[3]/a['+ (i+2) +']')).click();
      }, 5000 * i)
    }
  })  
});

var imgList = []
var titleList = []
var scoreList = []
var typeList = []
var addressList = []
var crawling = setInterval(() => {
  for(let i = 1; i <= 10; i++){
    driver.findElement(By.css('body > center > div.WrapMain > div.mainSec03 > div > ul > li:nth-child(' + i + ') > div.pho > p > img')).getAttribute('src').then((value) => {
      imgList.push(value); //식당 이미지 삽입
      console.log(imgList);
    });
    driver.findElement(By.css('body > center > div.WrapMain > div.mainSec03 > div > ul > li:nth-child(' + i + ') > div.ifo > dl > dt > a')).getText('a').then((value) => {
      titleList.push(value); //식당 이름 삽입
    });
    driver.findElement(By.css('body > center > div.WrapMain > div.mainSec03 > div > ul > li:nth-child(' + i + ') > div.ifo > dl > dd.rate > p.score > span.total')).getText('span.total').then((value) => {
      scoreList.push(value); //식당 평점 삽입
    });
    driver.findElement(By.css('body > center > div.WrapMain > div.mainSec03 > div > ul > li:nth-child(' + i + ') > div.ifo > dl > dd:nth-child(3)')).getText('dd').then((value) => {
      typeList.push(value); //음식 종류, 주소 삽입
    });
  }
}, 5000)

setTimeout(() => {
  for(var i = 0; i <= typeList.length; i++) {
    var abc = typeList[i].split('|');
    console.log(abc);
  }
}, 5500)

// setTimeout(() => {
//   for(let i = 0; i <= imgList.length; i++) {
//     conn.query('INSERT INTO test(`img`,`title`,`score`,`type`) VALUES (?,?,?,?)', [imgList[i], titleList[i], scoreList[i], typeList[i]]);
//   }
// }, 11000)

// var crawling = setInterval(() => {
//   for(let i = 1; i <= 10; i++){
//     driver.findElement(By.css('body > center > div.WrapMain > div.mainSec03 > div > ul > li:nth-child(' + i + ') > div.pho > p > img')).getAttribute('src').then((value) => {
//       conn.query('INSERT INTO test(`idtest`,`img`) VALUES (?,?)', value);
//       console.log(value)
//     });
//     driver.findElement(By.css('body > center > div.WrapMain > div.mainSec03 > div > ul > li:nth-child(' + i + ') > div.ifo > dl > dt > a')).getText('a').then((value) => {
//       conn.query('INSERT INTO test(`idtest`,`title`) VALUES (?,?)', value);
//     });
//     driver.findElement(By.css('body > center > div.WrapMain > div.mainSec03 > div > ul > li:nth-child(' + i + ') > div.ifo > dl > dd.rate > p.score > span.total')).getText('span.total').then((value) => {
//       conn.query('INSERT INTO test(`idtest`,`score`) VALUES (?,?)', value);
//     });
//   }
// }, 5000)

setTimeout(function() {
  clearTimeout(crawling);
}, 20000)
