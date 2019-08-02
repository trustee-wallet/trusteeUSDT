/**
 * Blocks scanning PM2 config with fast scan
 * @author Ksu
 * docker exec -t microtrustee /bin/bash -c "pm2 start /usr/microtrustee/micro_workers/watch_transactions_blocks/watch_transactions_fast.config.js"
 * docker exec -t microtrustee /bin/bash -c "pm2 status"
 * http://pm2.keymetrics.io/docs/usage/application-declaration/
 */
process.chdir(__dirname)

const currencyCode = 'USDT'
const perProcess = 5000

const apps = []
//for (let i = 36 * 2; i < 50 * 2; i++) {
for (let i = 50 * 2; i <  57 * 2; i++) {
    let start = i * perProcess
    let end = (i + 1) * perProcess
    let settings = {
        name: 'FAST_' + currencyCode + '_' + start + '_' + end,
        script: `${__dirname}/watch_transactions_fast_blocks.js`,
        args: `${currencyCode} ${start} ${end}`,
        watch: true
    }
    apps.push(settings)
}

module.exports = {
    apps: apps
}
