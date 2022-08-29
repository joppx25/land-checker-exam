'use strict';

const commands = require('../command');
const Crawler  = require('../../Scraper');

/**
 * Run scraper for official site
 *
 * @param {object} options options params from command
 */
module.exports = async function run (options) {
    const { force, verbose } = options;
    await execute(force, verbose);
};

//
// ─── REGISTRATION COMMAND ──────────────────────────────────────────────────────────────────
//
module.exports.registry = {
    name       : 'eproperty:get-data',
    description: 'Execute scraper getting the data from eproperty.casey.vic.gov.au',
    options    : [
        {
            flag        : '-f --force <force>',
            description : 'Force to create new data product',
            defaultValue: false,
        },
        {
            flag       : '-b, --verbose',
            description: 'Log more details.'
        },
    ]
};

//
// ─── FUNCTIONS ──────────────────────────────────────────────────────────────────

/**
 *
 * @param verbose
 * @returns {Promise<void>}
 */
async function execute (force, verbose) {
    const logger = commands.loggerInfo(`Eproperty casey`, `eproperty`, verbose);

    try {
        // call scrape
        const scraper = new Crawler(force, logger);
        await scraper.execute();

        logger.info('> Done scraping for goat');
        process.exit();
    } catch (err) {
        logger.error(err.toString());
        process.exit(-1);
    }
}