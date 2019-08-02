/**
 * Tx outputs scanning PM2 config with auto currencies
 * @author Ksu
 * docker exec -t microtrustee /bin/bash -c "pm2 start /usr/microtrustee/micro_workers/watch_transactions_outputs/all.config.js"
 * http://pm2.keymetrics.io/docs/usage/application-declaration/
 */
process.chdir(__dirname)
const SCAN_CURRENCY_CODES = require('../../micro_configs/CurrencyCodes')
    .SCAN_CURRENCY_CODES

const apps = []
for (const currencyCode of SCAN_CURRENCY_CODES) {
    for (let divider = 0; divider <= 19; divider++) {
        let settings = {
            name: 'watch_transactions_outputs_' + currencyCode + '_' + divider,
            script: `${__dirname}/watch_transactions_outputs.js`,
            args: `${currencyCode} ${divider}`,
            watch: true
        }
        apps.push(settings)
    }
}

module.exports = {
    apps: apps
}
