/**
 * Watch transaction in mined blocks - load block one per one and transaction hashes
 * @author Ksu
 * docker exec -t microtrustee /bin/bash -c "node /usr/microtrustee/micro_workers/watch_transactions_blocks/watch_transactions_blocks.js USDT"
 */
module.paths.push('/usr/lib/node_modules')

const db = require('../../micro_common/common/db').init('PUBLIC', 'PG')
const fncs = require('../../micro_common/debug/fncs').init()

async function init() {
    let currencyCode = process.argv[2] ? process.argv[2] : 'USDT'
    let time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    console.log(`${time} Started ${currencyCode}`)
    try {
        const steps = require('./libs/WatchSteps').init(db, currencyCode)
        // noinspection InfiniteLoopJS
        do {
            try {
                await steps.step1()
            } catch (err) {
                await fncs.err(__filename.toString() + ' ' + currencyCode, err) //dont break a code
            }
        } while (true)
    } catch (err) {
        if (db.end) db.end()
        await fncs.err(__filename.toString() + ' ' + currencyCode, err)
        process.exit(0)
    }
}

// noinspection JSIgnoredPromiseFromCall
init()
