
const retry      = require('async-retry');
const puppeteer  = require('puppeteer');
const fs         = require('fs');
const path       = require('path');

const { launchingOptions } = global.getConfig('puppeteer');
const TARGET               = 'https://eproperty.casey.vic.gov.au/T1PRProd/WebApps/eProperty/P1/eTrack/eTrackApplicationSearchResults.aspx?Field=S&Period=L14&r=P1.WEBGUEST&f=%24P1.ETR.SEARCH.SL14';
const DEFAULT_TIMEOUT      = 1000;
const MAX_TIMEOUT          = 20000;


module.exports = class Scrapper {
    
    constructor(force, logger)
    {
        this.logger    = logger;
        this.force     = force;
        this.retryFlag = false;
        this.headers   = [];
        this.data      = [];
    }

    async init()
    {
        // Launching puppeteer and adding some config
        const preLoadFile  = fs.readFileSync(path.join(__dirname, '/preload.js'), 'utf8');
        this.browser       = await puppeteer.launch(launchingOptions);
        this.page          = await this.browser.newPage();
        await this.page.setExtraHTTPHeaders({
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
        });

        await this.page.evaluateOnNewDocument(preLoadFile);
    }

    async scrapeData()
    {
        await this.init();
        
        await this.page.waitFor(DEFAULT_TIMEOUT);
        this.logger.info(`> Going to ${TARGET}`);
        await this.page.goto(TARGET);
        await this.page.waitFor(DEFAULT_TIMEOUT);

        this.logger.info('> Preparing data...');
        
        // get number of pages here
        await this.page.click('tr.pagerRow');
        await this.page.waitFor(DEFAULT_TIMEOUT);

        // extract data
        this.headers = await this.page.$$eval('table#ctl00_Content_cusResultsGrid_repWebGrid_ctl00_grdWebGridTabularView tbody tr.headerRow > th a', nodes => nodes.map(elem => elem.textContent));
        let pages    = await this.page.$$eval('#ctl00_Content_cusResultsGrid_repWebGrid_ctl00_grdWebGridTabularView > tbody > tr.pagerRow > td > table > tbody > tr > td > a', nodes => nodes.map(elem => elem.getAttribute('href')))

        // Fetch first page data
        this.data = await this.getTableContent();

        for (let i in pages) {
            // Fetch the rest of the pages data
            await this.page.click(`a[href="${pages[i]}"]`);
            await this.page.waitFor(DEFAULT_TIMEOUT);
            let data = await this.getTableContent();
            this.data = this.data.concat(data);
            await this.page.waitForSelector('tr.pagerRow', { timeout: MAX_TIMEOUT, visible: true });
        }
    }

    async getTableContent()
    {
        let data = await this.page.$$eval('table#ctl00_Content_cusResultsGrid_repWebGrid_ctl00_grdWebGridTabularView tbody tr', rows => {
            return Array.from(rows, row => {
                const currentRowClass = row.getAttribute('class');
                if (currentRowClass !== null && currentRowClass !== 'headerRow' && currentRowClass !== 'pagerRow') {
                    const cols = row.querySelectorAll('td');
                    return Array.from(cols, col => col.innerText);
                }
            });
        });

        return data.filter(item => item !== null);
    }

    async importToJson()
    {
        let result = [];
        for (let i in this.data) {
            for (let x in this.data[i]) {
                let currentHeader        = this.headers[x];
                let currentData          = this.data[i][x];
                if (result[i] === undefined) {
                    result[i] = {
                        [currentHeader]: currentData,
                    };
                } else {
                    result[i][currentHeader] = currentData;
                }
            }
        }
        
        const jsonResult = JSON.stringify(result);
        if (!fs.existsSync(process.env.DATA_PATH)) {
            this.logger.info('> Saving data to data/result.json');
            fs.mkdirSync(process.env.DATA_PATH);
            fs.writeFileSync(`${process.env.DATA_PATH}/result.json`, jsonResult);
        }
    }

    async crawl()
    {
        await this.scrapeData();
        await this.importToJson();
    }

    async execute() {
        const retryOption = {
            retries   : 10,
            minTimeout: 20000,
            maxTimeout: MAX_TIMEOUT,
            onRetry   : (err, i) => {
                if (err) {
                    this.retryFlag = true;
                    this.logger.info(`> Number of attempts to retry : #${i}`);
                    this.logger.info(`> Retry for error : ${err.toString()}`);
                }
            }
        };

        await retry(async () => {
            // if anything throws, we retry
            await this.crawl();
        }, retryOption);
    }
}
