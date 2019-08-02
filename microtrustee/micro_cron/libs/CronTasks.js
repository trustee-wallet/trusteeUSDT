/**
 * Cron runs for periodic tasks and check not dieing tasks *
 * @docs https://github.com/kelektiv/node-cron
 * @docs https://www.npmjs.com/package/node-cmd
 * @author Ksu
 */
module.paths.push('/usr/lib/node_modules')

class CronTasks {
    constructor() {
        let CronJob = require('cron').CronJob

        console.log('Cron started without tasks...')

        // noinspection JSMismatchedCollectionQueryUpdate
        let running = []

        // here you can add anything you need to be cronned without pm2
        running.push(new CronJob({ cronTime: '10 * * * * *', start: true }))
    }
}

module.exports.init = function() {
    return new CronTasks()
}
