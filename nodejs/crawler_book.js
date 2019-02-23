const cheerio = require('cheerio');
const fs = require('fs-extra');
const fetch = require('node-fetch');


var Chapter = function (name, path, content = '') {
    this.name = name;
    this.path = path;
    this.content = content;
}

async function htmlParse (url) {
    const resp = await fetch(url, {method: 'GET'}).then(response => {
        return response.text()
    }).then(text => {
        return cheerio.load(text);
    }).catch((error) => {
        console.log(error);
    });
    return resp;
}

async function main () {
    const host = 'https://www.qu.la'
    const $ = await htmlParse(host + '/book/94496/');
    const title = $('h1').text();
    const ddList = $('#list dl dd');
    let start = false;
    let chapterObj = {};
    // fs.removeSync(`${title}.txt`);
    for (let i = 0; i < ddList.length; i++) {
        let ddInfo = cheerio.load(ddList[i]);
        if (ddInfo.text().indexOf('第406章') > -1) {
            start = true;
        }
        if (start) {
            let chapter = new Chapter(ddInfo.text().trim(), ddInfo('a').attr('href'));
            const chapterInfo = await htmlParse(host + chapter.path);
            chapter.content = chapterInfo('#content').text().replace(/    /g, "\n    ");
            fs.appendFileSync(`${title}.txt`, chapter.name + chapter.content);
            console.log(`完成\t${chapter.name}`);
        }
    }
}

main();
