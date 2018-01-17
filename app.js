const puppeteer = require('puppeteer');
const readline = require('readline-sync');
const fs = require('fs');
let inditails = null;
let csvFile = 'time, alt, velo\n';
var browser, page;
let isBrowser = false;
async function getData() {
    if (!isBrowser) {
        browser = await puppeteer.launch({ headless: false });
        page = await browser.newPage();
        inditails = getUserInput();
        await page.goto("http://stuffin.space/?intldes=" + inditails, { "waitUntil": "networkidle0" });
        await page.waitForSelector('#loader', { hidden: true });
        isBrowser = true;
    }
    let velocity = await page.evaluate(() => {
        let data = document.querySelector("#sat-velocity").textContent;
        return data;
    }, null);
    let hight = await page.evaluate(() => {
        let data = document.querySelector("#sat-altitude").textContent;
        return data;
    }, null);
    return {
        velo: velocity,
        alt: hight,
        time: new Date().getHours() + ':' + new Date().getMinutes()
    };
}
//get satalite name from user:
function getUserInput() {
    console.log("getUserInput");
    let data = readline.question("satalite intldes: ");
    return data;
}
function saveCsv() {
    fs.writeFileSync('./result.csv', csvFile);
}
async function runApp() {
    let time = readline.questionFloat("interval-> ");
    let timesChacked = 1;
    satData = await getData();
    csvFile += satData.time + ',' + satData.alt + ',' + satData.velo + '\n';
    let interval = setInterval(async () => {
        console.log("interval");
        let satData = null;
        satData = await getData();
        csvFile += satData.time + ',' + satData.alt + ',' + satData.velo + '\n';
        timesChacked++;

        console.log(csvFile);
        if (timesChacked === 60) {
			saveCsv();
            clearInterval(interval);
			return;

        }
    }, time * 60 * 1000);
}
runApp();