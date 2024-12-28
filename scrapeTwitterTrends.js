const { Builder, By, until } = require("selenium-webdriver");
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const chrome = require("selenium-webdriver/chrome");
require("chromedriver");

const PROXY = "http://VELLAforu:Qwerty4u@us-ca.proxymesh.com:31280";
const TWITTER_USERNAME = "@yarad245490";
const TWITTER_PASSWORD = "Qwerty4u";
const VERIFICATION_EMAIL = "yenosep278@chansd.com";
const MONGO_URL = "mongodb+srv://shivamguptaece21:VnJZyH4XjcEH6ECc@cluster0.xmgpu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "twitter_trends";
const COLLECTION_NAME = "trends";

async function scrapeTwitterTrends() {
    let driver; // Declare the driver once

    try {
        console.log("Driver is starting");

        const options = new chrome.Options();
        options.addArguments("--headless");
        options.addArguments("--window-size=1920,1080")
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-gpu");
        options.addArguments("--disable-dev-shm-usage");

        driver = await new Builder()
            .forBrowser("chrome")
            .setChromeOptions(options)
            .build();

        console.log("Driver is ready");
        await driver.get("https://x.com/i/flow/login");
        console.log("X page loaded");

        await driver.wait(until.elementLocated(By.name("text")), 10000);
        await driver.findElement(By.name("text")).sendKeys(TWITTER_USERNAME);
        console.log("Username entered");
        await driver.findElement(By.xpath('//*[@id="layers"]/div/div/div/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div/div/div/button[2]')).click();
        console.log("Next button clicked");

        // Check for intermediate step with data-testid="ocfEnterTextTextInput"
        try {
            await driver.sleep(2000); // Give some time for the intermediate page to load
            const inputField = await driver.findElement(By.css('[data-testid="ocfEnterTextTextInput"]'));
            if (inputField) {
                console.log("Intermediate page detected, entering email...");
                await inputField.sendKeys(VERIFICATION_EMAIL);
                await driver.findElement(By.xpath('//*[@id="layers"]/div[2]/div/div/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div[2]/div/div/div/button')).click();
                console.log("Intermediate step completed");
            }
        } catch (e) {
            console.log("No intermediate step detected, proceeding to password entry");
        }

        await driver.wait(until.elementLocated(By.name("password")), 10000);
        await driver.findElement(By.name("password")).sendKeys(TWITTER_PASSWORD);
        console.log("Password entered");
        await driver.findElement(By.xpath('//*[@id="layers"]/div/div/div/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div[2]/div/div[1]/div/div/button')).click();
        console.log("Login button clicked");

        try {
            await driver.sleep(2000); // Give some time for the intermediate page to load
            const inputField = await driver.findElement(By.css('[data-testid="ocfEnterTextTextInput"]'));
            if (inputField) {
                console.log("Intermediate page detected, entering email...");
                await inputField.sendKeys(VERIFICATION_EMAIL);
                await driver.findElement(By.xpath('//*[@id="layers"]/div[2]/div/div/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div[2]/div/div/div/button')).click();
                console.log("Intermediate step completed");
            }
        } catch (e) {
            console.log("No intermediate step detected, proceeding to password entry");
        }

        await driver.sleep(5000);
        await driver.get("https://x.com/explore");
        console.log("Explore tab loaded");
        //reload the page to get the latest trends after 5 seconds
        await driver.sleep(5000);
        //reload the page
        await driver.navigate().refresh();
        console.log("Page refreshed");
        driver.sleep(5000);

        await driver.wait(until.elementsLocated(By.css('[aria-labelledby]')));
        
        const trendElements = await driver.findElements(By.xpath('//*[@data-testid="trend"]'));
        console.log("Trend elements found");

        const trends = [];
        for (let i = 0; i < Math.min(trendElements.length, 5); i++) {
            const fullText = await trendElements[i].getText();
            const extractedText = fullText.split("\n")[1];
            trends.push(extractedText);
        }

        const response = await fetch("https://api.ipify.org/?format=json");
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

        return record;
    } catch (error) {
        console.error("Error during scraping:", error);
    } finally {
        if (driver) {
            try {
                await driver.quit();
                console.log("Driver quit successfully");
            } catch (quitError) {
                console.error("Error while quitting driver:", quitError);
            }
        }
    }
}

exports.scrapeTwitterTrends = scrapeTwitterTrends;
