const { Builder, By, until } = require("selenium-webdriver");
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const chrome = require("selenium-webdriver/chrome");
require("chromedriver");

const PROXY = "http://VELLAforu:Qwerty4u@us-ca.proxymesh.com:31280";
const TWITTER_USERNAME = "0Videh283021";
const TWITTER_PASSWORD = "Qwerty@4u";
const MONGO_URL = "mongodb+srv://shivamguptaece21:VnJZyH4XjcEH6ECc@cluster0.xmgpu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "twitter_trends";
const COLLECTION_NAME = "trends";

async function scrapeTwitterTrends() {
    let driver;

    try {
        console.log("Driver is starting");

        const options = new chrome.Options();
        //headless
        options.addArguments("--headless");
        //no-sandbox
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-gpu");
        console.log("Sandbox is ready");

        //disable-dev-shm-usage
        options.addArguments("--disable-dev-shm-usage");
        const driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .build();
        console.log("Driver is ready");
        await driver.get("https://x.com/i/flow/login");

        await driver.wait(until.elementLocated(By.name("text")), 10000);
        await driver.findElement(By.name("text")).sendKeys(TWITTER_USERNAME);
        await driver.findElement(By.xpath('//*[@id="layers"]/div/div/div/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div/div/div/button[2]')).click();

        await driver.wait(until.elementLocated(By.name("password")), 10000);
        await driver.findElement(By.name("password")).sendKeys(TWITTER_PASSWORD);
        await driver.findElement(By.xpath('//*[@id="layers"]/div/div/div/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div[2]/div/div[1]/div/div/button')).click();

        await driver.wait(until.elementLocated(By.tagName("section")), 15000);
        await driver.get("https://x.com/explore/tabs/for-you");
        await driver.wait(until.elementsLocated(By.css('[aria-labelledby]')), 10000);

        const trendElements = await driver.findElements(By.xpath('//*[@data-testid="trend"]'));

        const trends = [];
        for (let i = 0; i < Math.min(trendElements.length, 5); i++) {
            const fullText = await trendElements[i].getText();
            const extractedText = fullText.split('\n')[1];
            trends.push(extractedText);
        }

        const response = await fetch('https://api.ipify.org/?format=json');
        const data = await response.json();
        const ipAddress = data.ip;

        const uniqueId = uuidv4();
        const timestamp = new Date().toISOString();

        const record = {
            _id: uniqueId,
            nameoftrend1: trends[0] || "N/A",
            nameoftrend2: trends[1] || "N/A",
            nameoftrend3: trends[2] || "N/A",
            nameoftrend4: trends[3] || "N/A",
            nameoftrend5: trends[4] || "N/A",
            date_time: timestamp,
            ip_address: ipAddress,
        };

        console.log("Scraped Trends:", record);

        const client = new MongoClient(MONGO_URL);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);
        await collection.insertOne(record);
        await driver.quit();

        return record;
    } catch (error) {
        console.error("Error during scraping:", error);
    } finally {
        if (driver) await driver.quit();
    }
}

exports.scrapeTwitterTrends = scrapeTwitterTrends;
