const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    await page.goto('file:///' + __dirname.replace(/\\/g, '/') + '/calculator/index.html', { waitUntil: 'networkidle0' });
    
    console.log("Page loaded. Clicking UK tab...");
    await page.click('#tabBtnUk');
    
    const ukDisplay = await page.$eval('#calcPanelUk', el => el.style.display);
    const bg = await page.$eval('#tabBtnUk', el => el.style.background);
    
    console.log("UK Panel Display:", ukDisplay);
    console.log("UK Button Background:", bg);
    
    await browser.close();
})();
