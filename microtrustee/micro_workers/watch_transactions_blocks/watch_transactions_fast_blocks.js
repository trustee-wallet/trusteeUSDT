/**
 * Watch transaction in mined blocks before some block in full fast mode
 * @author Ksu
 * docker exec -t microtrustee /bin/bash -c "node /usr/microtrustee/micro_workers/watch_transactions_blocks/watch_transactions_fast_blocks.js USDT 0 10000"
 * docker exec -t microtrustee /bin/bash -c "node /usr/microtrustee/micro_workers/watch_transactions_blocks/watch_transactions_fast_blocks.js USDT 0 3"
 */
module.paths.push('/usr/lib/node_modules')

const db = require('../../micro_common/common/db').init('PUBLIC', 'PG')
const fncs = require('../../micro_common/debug/fncs').init()

async function init() {
    let currencyCode = process.argv[2] ? process.argv[2] : 'BTC'
    let start = process.argv[3] ? process.argv[3] : 10000
    let end = process.argv[4] ? process.argv[4] : 20000
    console.log('')
    console.log('')
    console.log('')
    console.log('')
    let time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    console.log(`${time} Started ${currencyCode} from ${start} to ${end}`)
    // noinspection JSIgnoredPromiseFromCall
    db.setAppTitle(
        `watch_transactions_fast_blocks: ${currencyCode} from ${start} to ${end}`
    )
    try {
        const steps = require('./libs/WatchStepsFast').init(db, currencyCode)
        // noinspection InfiniteLoopJS
        do {
            await steps.step1Fast(start, end)
        } while (true)
    } catch (err) {
        if (db.end) db.end()
        await fncs.err(__filename.toString() + ' ' + currencyCode, err)
        process.exit(0)
    }
}

// noinspection JSIgnoredPromiseFromCall
init()
