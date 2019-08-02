/**
 *  Notify on working
 *  docker exec -t microtrustee /bin/bash -c "node /usr/microtrustee/micro_workers/utils_telegram_bot/general_status.js"
 *  docker exec -t microtrustee /bin/bash -c "pm2 start /usr/microtrustee/micro_workers/utils_telegram_bot/general_status.js"
 */

module.paths.push('/usr/lib/node_modules')

const sleep = require('sleep')

const db = require('../../micro_common/common/db').init('PUBLIC', 'PG')
const fncs = require('../../micro_common/debug/fncs').init()
const tg = require('../../micro_common/debug/tg').init()

const tgMessages = require('./libs/TgMessages').init(db)
const tgMessagesNodes = require('./libs/TgMessagesNodes').init()

const ALIVE_TIMER = 600000 // ms, 1 minute => then * 10
let ALIVE_STEPS = 0

async function main() {
    try {
        do {
            try {
                let messages = {
                    'BTC': await tgMessagesNodes.getBlockLastNumber('BTC'),
                    'USDT': await tgMessagesNodes.getBlockLastNumber('USDT'),
                    'USDT_LOADED': await tgMessages.getLoaded('USDT')
                }

                let time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
                await tg.send(`
${process.env.NODE_TITLE} ${time}
------------------------------------
BTC  current block : ${messages.BTC}
USDT current block : ${messages.USDT}
${messages.USDT_LOADED}
`)

                try {
                    if (ALIVE_STEPS >= 10) {
                        for (let i = 0; i<10; i++) { //FCK
                            sleep.msleep(ALIVE_TIMER)
                        }
                    } else {
                        sleep.msleep(ALIVE_TIMER)
                        ALIVE_STEPS++
                    }
                } catch (e) {
                    throw new Error(e.message + ' ' + ALIVE_TIMER + ' steps ' + ALIVE_STEPS)
                }

            } catch (err) {
                await fncs.err(__filename.toString(), err) //dont break a code
            }
        } while (true)
    } catch (err) {
        console.log(err)
        process.exit(1)
        let time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
        console.log('----------------------------')
        console.log(time)
        console.log(err)
        return 0
    }
}

async function init() {
    let result = await main()
    if (db.end) db.end()
    sleep.msleep(6000)
    process.exit(result)
}

// noinspection JSIgnoredPromiseFromCall
init()
