var webdriver = require('selenium-webdriver');
var By = require('selenium-webdriver').By;
var cheerio = require('cheerio');
var request = require('request');
var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();
const db_config = require(__dirname + '/database.js');
const conn = db_config.init();
db_config.connect(conn);

//식당 기본 정보 리스트
var imgList = [];
var titleList = [];
var typeList = [];
var telList = [];
var addrList = [];
var scoreList = [];
var priceList = [];

//식당 상세 정보 리스트
var timeList = [];
var holidayList = [];
var roomList = [];
var smokeList = [];
var toiletList = [];
var balletList = [];
var alcoholList = [];
var reserList = [];
var introList = [];

function sleep(sec) {
    return new Promise(resolve => setTimeout(resolve, sec * 1000));
} 

(async () => {
    let url = "https://www.menupan.com/restaurant/search/search_main_sub_area.asp?areacode=cc207";
    driver.get(url);
    for(var i = 1; i <= 3; i++){
        await sleep(3);
        await driver.findElements(By.css('body > center > div.WrapMain > div.mainSec03 > div > ul > li')).then(async elements => {
            for(let i = 1; i <= elements.length; i++){
                await driver.findElement(By.css('body > center > div.WrapMain > div.mainSec03 > div > ul > li:nth-child('+ i +') > div.ifo > dl > dt > a')).click();
                var windows = await driver.getAllWindowHandles();
                await driver.switchTo().window(windows[1]);
                await sleep(3);

                //식당 이미지
                await driver.findElement(By.xpath('/html/body/center/div[2]/div[2]/div[1]/dl/dt/img')).getAttribute('src').then(async (value) => {
                    imgList.push(value);
                    console.log(imgList);
                });

                //식당 이름
                await driver.findElement(By.css('body > center > div.WrapMain > div.mainArea01 > div.areaBasic > dl.restName > dd')).getText('dd').then(async (value) => {
                    titleList.push(value);
                    console.log(titleList);
                });

                //음식 종류
                await driver.findElement(By.css('body > center > div.WrapMain > div.mainArea01 > div.areaBasic > dl.restType > dd')).getText('dd').then(async (value) => {
                    typeList.push(value);
                    console.log(typeList);
                });

                //식당 번호
                await driver.findElement(By.css('body > center > div.WrapMain > div.mainArea01 > div.areaBasic > dl.restTel > dd')).getText('dd').then(async (value) => {
                    telList.push(value);
                    console.log(telList);
                });

                //식당 주소
                await driver.findElement(By.css('body > center > div.WrapMain > div.mainArea01 > div.areaBasic > dl.restAdd > dd')).getText('dd').then(async (value) => {
                    addrList.push(value);
                    console.log(addrList);
                });

                //식당 평점
                await driver.findElement(By.css('body > center > div.WrapMain > div.mainArea01 > div.areaBasic > dl.restGrade > dd.rate > p.score > span.total')).getText('span.total').then(async (value) => {
                    scoreList.push(value);
                    console.log(scoreList);
                });

                //식당 가격
                await driver.findElement(By.css('body > center > div.WrapMain > div.mainArea01 > div.areaBasic > dl.restMood > dd > div.restPrice > p.price')).getText('p.price').then(async (value) => {
                    priceList.push(value);
                    console.log(priceList);
                });
                
                //[식당 상세 정보]
                //영업 시간
                await driver.findElement(By.css('body > center > div.WrapMain > div.mainArea01 > div.tabInfo > div.infoTable > ul.tableTopA > li:nth-child(1) > dl > dd')).getText('dd').then(async (value) => {
                    timeList.push(value);
                    console.log(timeList);
                });

                //식당 휴일
                await driver.findElement(By.css('body > center > div.WrapMain > div.mainArea01 > div.tabInfo > div.infoTable > ul.tableTopA > li:nth-child(3) > dl > dd')).getText('dd').then(async (value) => {
                    holidayList.push(value);
                    console.log(holidayList);
                });

                //식당 좌석
                await driver.findElement(By.css('body > center > div.WrapMain > div.mainArea01 > div.tabInfo > div.infoTable > ul.tableLR > li:nth-child(1) > dl:nth-child(1) > dd')).getText('dd').then(async (value) => {
                    roomList.push(value);
                    console.log(roomList);
                });

                //금연석
                await driver.findElement(By.css('body > center > div.WrapMain > div.mainArea01 > div.tabInfo > div.infoTable > ul.tableLR > li:nth-child(2) > dl:nth-child(1) > dd')).getText('dd').then(async (value) => {
                    smokeList.push(value);
                    console.log(smokeList);
                });

                //화장실
                await driver.findElement(By.css('body > center > div.WrapMain > div.mainArea01 > div.tabInfo > div.infoTable > ul.tableLR > li:nth-child(3) > dl:nth-child(1) > dd')).getText('dd').then(async (value) => {
                    toiletList.push(value);
                    console.log(toiletList);
                });

                //식당 주차
                await driver.findElement(By.css('body > center > div.WrapMain > div.mainArea01 > div.tabInfo > div.infoTable > ul.tableLR > li:nth-child(4) > dl:nth-child(1) > dd')).getText('dd').then(async (value) => {
                    balletList.push(value);
                    console.log(balletList);
                });

                //주류 판매
                await driver.findElement(By.css('body > center > div.WrapMain > div.mainArea01 > div.tabInfo > div.infoTable > ul.tableLR > li:nth-child(1) > dl:nth-child(2) > dd')).getText('dd').then(async (value) => {
                    alcoholList.push(value);
                    console.log(alcoholList);
                });

                //예약 정보
                await driver.findElement(By.css('body > center > div.WrapMain > div.mainArea01 > div.tabInfo > div.infoTable > ul.tableLR > li:nth-child(2) > dl:nth-child(2) > dd')).getText('dd').then(async (value) => {
                    reserList.push(value);
                    console.log(reserList);
                });

                //맛집 소개
                await driver.findElement(By.css('body > center > div.WrapMain > div.mainArea01 > div.tabInfo > div.infoTable > ul.tableBottom > li > dl > dd > div > div > div#info_ps_f')).getText('div#info_ps_f').then(async (value) => {
                    new_str = value.replace(/\n/g, "");
                    introList.push(new_str);
                    console.log(introList);
                });

                await driver.close();
                await driver.switchTo().window(windows[0]);
            }
        });
        await driver.findElement(By.xpath('/html/body/center/div[2]/div[5]/div/div[3]/a['+ (i+2) +']')).click();
    }
    (async () => {
        for(let i = 0; i <= 27; i++){
        await conn.query('INSERT INTO restaurant(`img`,`title`,`type`,`tel`,`addr`,`score`,`price`,`time`,`holiday`,`room`,`smoke`,`toilet`,`ballet`,`alcohol`,`reservation`,`introduce`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [imgList[i],titleList[i],typeList[i],telList[i],addrList[i],scoreList[i],priceList[i],timeList[i],holidayList[i],roomList[i],smokeList[i],toiletList[i],balletList[i],alcoholList[i],reserList[i],introList[i]]);
        }
    })();
})();

