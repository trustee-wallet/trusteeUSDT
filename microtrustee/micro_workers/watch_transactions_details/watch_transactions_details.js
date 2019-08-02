/**
 * Watch transaction details by hash
 * @author Ksu
 * docker exec -t microtrustee /bin/bash -c "node /usr/microtrustee/micro_workers/watch_transactions_details/watch_transactions_details.js USDT"
 */
module.paths.push('/usr/lib/node_modules')

const db = require('../../micro_common/common/db').init('PUBLIC', 'PG')
const fncs = require('../../micro_common/debug/fncs').init()

async function init() {
    let currencyCode = process.argv[2] ? process.argv[2] : 'USDT'
    let divider = process.argv[3] ? process.argv[3] : '0'
    let time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    console.log(`${time} Started ${currencyCode} divider ${divider}`)
    try {
        const steps = require('./libs/WatchTransactionsSteps').init(db, currencyCode, divider)
        // noinspection InfiniteLoopJS
        do {
            try {
                await steps.step2()
            } catch (err) {
                console.err(err)
                await fncs.err(__filename.toString() + ' ' + currencyCode, err) //dont break a code
            }
        } while (true)
    } catch (err) {
        console.err(err)
        if (db.end) db.end()
        await fncs.err(__filename.toString() + ' ' + currencyCode, err)
        process.exit(0)
    }
}

// noinspection JSIgnoredPromiseFromCall
init()
