/**
 * First run of not dieing tasks
 * @docs http://pm2.keymetrics.io/docs/usage/pm2-api
 * @author Ksu
 */
module.paths.push('/usr/lib/node_modules')

const sleep = require('sleep')
const cmd = require('node-cmd')

class InitTasks {
    constructor() {
        console.log('Init started with tasks...')

        // put here all settings you need
        this.cron = []
        if (process.env.MICROTRUSTEE_IS_SCAN_CURRENCY_CODES && process.env.MICROTRUSTEE_IS_SCAN_CURRENCY_CODES.toString() === '1') {
            this.cron.push(
                'pm2 start /usr/microtrustee/micro_workers/watch_transactions_blocks/all.config.js'
            )
            this.cron.push(
                'pm2 start /usr/microtrustee/micro_workers/watch_transactions_details/all.config.js'
            )
        }

        this.cron.push(
            'pm2 start /usr/microtrustee/micro_workers/utils_telegram_bot/general_status.js'
        )

        this.cron.push(
            'pm2 start /usr/microtrustee/micro_apis/api.js'
        )

        this.cron.forEach(task => {
            console.log(task)
            cmd.run(task)
            sleep.msleep(2000) // ms, DO NOT REMOVE THIS SLEEP!
        })
    }
}

module.exports.init = function() {
    return new InitTasks()
}
