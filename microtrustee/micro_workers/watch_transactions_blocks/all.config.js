/**
 * Blocks scanning PM2 config with auto currencies
 * @author Ksu
 * docker exec -t microtrustee /bin/bash -c "pm2 start /usr/microtrustee/micro_workers/watch_transactions_blocks/all.config.js"
 * http://pm2.keymetrics.io/docs/usage/application-declaration/
 */
process.chdir(__dirname)

const SCAN_CURRENCY_CODES = require('../../micro_configs/CurrencyCodes').SCAN_CURRENCY_CODES

const apps = []
for (const currencyCode of SCAN_CURRENCY_CODES) {
    let settings = {
        name: 'watch_transactions_blocks_' + currencyCode,
        script: `${__dirname}/watch_transactions_blocks.js`,
        args: `${currencyCode}`,
        watch: true
    }
    apps.push(settings)
}

module.exports = {
    apps: apps
}
