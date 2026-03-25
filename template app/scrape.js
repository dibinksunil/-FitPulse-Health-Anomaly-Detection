const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        console.log('Navigating to login page...');
        await page.goto('https://dibin-k-sunil.vercel.app/', { waitUntil: 'load', timeout: 30000 });
        
        console.log('Waiting for login form...');
        await new Promise(r => setTimeout(r, 2000));
        
        console.log('Filling out login form...');
        // The first input is username, second is password
        const inputs = await page.$$('input');
        if (inputs.length >= 2) {
            await inputs[0].type('login');
            await inputs[1].type('login');
        }
        
        console.log('Clicking login button...');
        const buttons = await page.$$('button[type="submit"]');
        if (buttons.length > 0) {
            await buttons[0].click();
        }
        
        console.log('Waiting for dashboard to load...');
        await new Promise(r => setTimeout(r, 5000));
        
        console.log('Taking dashboard screenshot...');
        const screenshotPath = 'C:\\Users\\sayan\\.gemini\\antigravity\\brain\\04cb4ee7-377b-4130-bf4a-4903d1de8ddb\\dashboard_screenshot.png';
        await page.screenshot({ path: screenshotPath, fullPage: true });
        
        console.log('Extracting dashboard HTML...');
        const html = await page.content();
        fs.writeFileSync('C:\\Users\\sayan\\Downloads\\aswincs-main\\fitpulse-clone\\dashboard.html', html);
        
        await browser.close();
        console.log('Done.');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
})();
