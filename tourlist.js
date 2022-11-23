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
var addrList = [];
var scoreList = [];
var timeList = [];
var telList = [];
var walletList = [];
var instaList = [];
var hashtagList = [];
var introList = [];
//네이버 리뷰
var review_title_List = [];
var review_detail_List = [];
var review_image_List = [];
var review_author_List = [];
var review_time_list = [];
//주변 맛집
var arround_title_List = [];
var arround_type_List = [];
var arround_detail_List = [];
var arround_distance_List = [];

function sleep(sec) {
    return new Promise(resolve => setTimeout(resolve, sec * 1000));
} 

(async () => {
    let url = "https://trip.place.naver.com/list?query=%EC%B6%A9%EC%A3%BC%20%EA%B0%80%EB%B3%BC%EB%A7%8C%ED%95%9C%EA%B3%B3&level=top";
    driver.get(url);
    await sleep(4);
    await driver.findElements(By.css('#_list_scroll_container > div > div > div:nth-child(2) > div > ul > li')).then(async elements => {
        for(let i = 1; i <= elements.length; i++){
            await driver.findElement(By.css('#_list_scroll_container > div > div > div:nth-child(2) > div > ul > li:nth-child('+ i +') > div.YgcU0 > a > div.TaEbI > div > span.xBZDS')).click();
            await sleep(5);
            
            //관광지 이미지
            try {
                await driver.findElement(By.xpath('/html/body/div[3]/div/div/div/div[1]/div/div[1]/div/a/div')).getCssValue('background-image').then(async (value) => {
                    imgList.push(value.split('"')[1].split('"')[0]);
                    console.log(value.split('"')[1].split('"')[0]);
                });
            } catch(err) {
                imgList.push("https://www.ncenet.com/wp-content/uploads/2020/04/No-image-found.jpg");
            }

            //관광지 이름
            try {
                await driver.findElement(By.css('#_title > span.Fc1rA')).getText('span').then(async (value) => {
                    titleList.push(value);
                    console.log(value);
                });
            } catch(err) {
                titleList.push("-")
            }

            //관광지 타입
            try {
                await driver.findElement(By.css('#_title > span.DJJvD')).getText('span').then(async (value) => {
                    typeList.push(value);
                    console.log(value);
                });
            } catch(err) {
                typeList.push("-")
            }

            //관광지 주소
            try {
                await driver.findElement(By.css('#app-root > div > div > div > div:nth-child(6) > div > div.place_section.no_margin.vKA6F > div > ul > li.SF_Mq.GFtzE > div > a > span.IH7VW')).getText('span').then(async (value) => {
                    addrList.push(value);
                    console.log(value);
                });
            } catch(err) {
                addrList.push("-")
            }

            //관광지 운영시간
            try {
                await driver.findElement(By.css('div > div > span > time')).getText('time').then(async (value) => {
                    timeList.push(value);
                    console.log(value);
                });
            } catch(err) {
                timeList.push("-")
            }

            //관광지 전화번호
            try {
                await driver.findElement(By.css('ul > li.SF_Mq.SjF5j > div > span.dry01')).getText('span').then(async (value) => {
                    telList.push(value);
                    console.log(value);
                });
            } catch(err) {
                telList.push("-")
            }

            //관광지 화폐
            try {
                await driver.findElement(By.css('ul > li.SF_Mq.uHivS > div > div')).getText('div').then(async (value) => {
                    walletList.push(value);
                    console.log(value);
                });
            } catch(err) {
                walletList.push("-")
            }

            //관광지 인스타
            try {
                await driver.findElement(By.css('li.SF_Mq.nKpE4 > div > div > a')).getText('a').then(async (value) => {
                    instaList.push(value);
                    console.log(value);
                });
            } catch(err) {
                instaList.push("-")
            }

            //관광지 인스타
            try {
                await driver.findElement(By.css('li.SF_Mq.nKpE4 > div > div > a')).getText('a').then(async (value) => {
                    instaList.push(value);
                    console.log(value);
                });
            } catch(err) {
                instaList.push("-")
            }

            //관광지 해시태그
            try {
                await driver.findElement(By.css('li.SF_Mq.msJW2 > div > ul > li')).getText('li').then(async (value) => {
                    hashtagList.push(value);
                    console.log(value);
                });
            } catch(err) {
                hashtagList.push("-")
            }
   
            //관광지 평점
            try {
                await driver.findElement(By.css('#app-root > div > div > div > div.place_section.OP4V8 > div.zD5Nm > div.dAsGb > span.PXMot.LXIwF > em')).getText('em').then(async (value) => {
                    scoreList.push(value);
                    console.log(value);
                });
            } catch(err) {
                scoreList.push("0.0");
            }

            //관광지 소개
            try {
                await driver.findElement(By.css('li.SF_Mq.I5Ypx > div > a > span.zPfVt')).getText('span').then(async (value) => {
                    introList.push(value);
                    console.log(value);
                });
            } catch(err) {
                introList.push("-")
            }

            //관광지 정보 DB 저장
            await conn.query('INSERT INTO tourlist(`image`,`title`,`type`,`address`,`score`,`time`,`tel`,`wallet`,`insta`,`hashtag`,`introduce`) VALUES (?,?,?,?,?,?,?,?,?,?,?)', [imgList[i-1],titleList[i-1],typeList[i-1],addrList[i-1],scoreList[i-1],timeList[i-1],telList[i-1],walletList[i-1],instaList[i-1],hashtagList[i-1],introList[i-1]])

            //네이버 블로그 리뷰
            // for(let j = 1; j <= 3; j++) {
            //     await driver.findElement(By.css('li:nth-child('+ j +') > a > div.icjKM > div.QDJES > div.v6ZcW > div > span')).getText('span').then(async (value) => {
            //         review_title_List.push(value);
            //         console.log(value);
            //     });
            //     #app-root > div > div > div > div:nth-child(7) > div > div:nth-child(9) > div > div.place_section_content > div > div.FBvPG.SXABQ > ul > li:nth-child(1) > a.vxCmX > div.h9UU_ > div > span.place_bluelink.eKoFM
            //     #app-root > div > div > div > div:nth-child(7) > div > div:nth-child(5) > div:nth-child(3) > div.place_section_content > ul > li:nth-child(1) > a > div.icjKM > div.QDJES > div.v6ZcW > div
            //     await driver.findElement(By.css('li:nth-child('+ j +') > a > div.icjKM > div.QDJES > div.Ns0Qo > div')).getText('div').then(async (value) => {
            //         review_detail_List.push(value);
            //         console.log(value);
            //     });
            //     await driver.findElement(By.css('li:nth-child('+ j +') > a > div.icjKM > div.fdXfj > div > img')).getAttribute('src').then(async (value) => {
            //         review_image_List.push(value);
            //         console.log(value);
            //     });
            //     await driver.findElement(By.css('li:nth-child('+ j +') > a > div.sDBiR > span.AoB7r')).getText('span').then(async (value) => {
            //         review_author_List.push(value);
            //         console.log(value);
            //     });
            //     await driver.findElement(By.css('li:nth-child('+ j +') > a > div.sDBiR > span.BB1G2 > time')).getText('time').then(async (value) => {
            //         review_time_list.push(value);
            //         console.log(value);
            //     });
            //     //네이버 리뷰 정보 DB 저장
            //     await conn.query('INSERT INTO nreview(`idtourlist`,`title`,`image`,`detail`,`author`,`time`) VALUES (?,?,?,?,?,?)', [i,review_title_List[(j-1)+((i-1)*3)],review_image_List[(j-1)+((i-1)*3)],review_detail_List[(j-1)+((i-1)*3)],review_author_List[(j-1)+((i-1)*3)],review_time_list[(j-1)+((i-1)*3)]])
            // }
            
            await sleep(5);
            await driver.navigate().back();
        }
    });
    // (async () => {
    //     for(let i = 0; i <= 27; i++){
    //     await conn.query('INSERT INTO restrant(`img`,`title`,`type`,`tel`,`addr`,`score`,`price`,`time`,`holiday`,`room`,`smoke`,`toilet`,`ballet`,`alcohol`,`reservation`,`introduce`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [imgList[i],titleList[i],typeList[i],telList[i],addrList[i],scoreList[i],priceList[i],timeList[i],holidayList[i],roomList[i],smokeList[i],toiletList[i],balletList[i],alcoholList[i],reserList[i],introList[i]]);
    //     }
    // })();
})();