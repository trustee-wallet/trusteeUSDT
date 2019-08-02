/**
 * Fix transactions blocks if found broken
 * @author Ksu
 * docker exec -t microtrustee /bin/bash -c "node /usr/microtrustee/micro_workers/watch_transactions_blocks/watch_transactions_fix.js USDT 571051"
 */
module.paths.push('/usr/lib/node_modules')

process.env.MICROTRUSTEE_IS_PROD = 0

const db = require('../../micro_common/common/db').init('PUBLIC', 'PG')
const fncs = require('../../micro_common/debug/fncs').init()

const currencyCode = process.argv[2] ? process.argv[2] : 'USDT'
const lastScannedBlock = process.argv[3] ? process.argv[3] : 'all'
const steps = require('./libs/WatchSteps').init(db, currencyCode)


async function oneFix(blockNumber) {
    steps.log(`FIX BLOCKS: do ${blockNumber}`)
    try {
        let blocks = await steps._scanLastBlocks(blockNumber - 1, 1, 2)
        await steps.table.putNewBlocks(blocks)
    } catch (e) {
        console.error(e)
    }
    return true
}

async function all() {
    let rows = await db.query(`SELECT block_number AS "blockNumber" FROM transactions_blocks_headers_usdt AS t
        WHERE _tx>0 AND NOT EXISTS (SELECT t2.id FROM transactions_blocks_list_basics_usdt AS t2 WHERE t.id=t2.inner_block_id )
        ORDER BY block_number
        `)
    if (!rows) {
        steps.log('FIX BLOCKS: ALL OK')
        process.exit(1)
    }
    steps.log(`FIX BLOCKS: NEED TO FIX ${rows.length}`)
    for (let block of rows) {
        await oneFix(block.blockNumber)
    }
    steps.log('FIX BLOCKS: ALL DONE')
}


async function init() {

    let time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    console.log(`${time} Started ${currencyCode} for block ${lastScannedBlock}`)
    try {
        if (lastScannedBlock > 0) {
            oneFix(lastScannedBlock)
        } else {
            all()
        }
    } catch (err) {
        if (db.end) db.end()
        await fncs.err(__filename.toString() + ' ' + currencyCode, err)
        process.exit(0)
    }
}

// noinspection JSIgnoredPromiseFromCall
init()
