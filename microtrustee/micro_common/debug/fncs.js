/**
 * Global functions (not to repeat code) for errors handling etc
 * @author Ksu
 */
module.paths.push('/usr/lib/node_modules')

const sleep = require('sleep')

class Fncs {
    constructor() {
        this.connectErrors = {}
        this.connectErrorsLast = {}
        this.connectErrorsPauseTill = {}
    }

    /**
     * Error handling
     * @param {string} title
     * @param {*} error
     * @return {Promise<boolean>}
     */
    async err(title, error) {
        if (!(process.env.MICROTRUSTEE_IS_PROD > 0)) {
            console.error(error)
            return true
        }
        let date = new Date()
            .toISOString()
            .replace(/T/, ' ')
            .replace(/\..+/, '')
        let msg = date
        if (process.env.NODE_TITLE) {
            msg = process.env.NODE_TITLE + ' ' + msg
        }
        if (error.code) {
            if (!error.message || error.message.indexOf(error.code) === false) {
                msg += '\n' + error.code
            }
        }
        if (error.message) {
            msg += '\n' + error.message
        }
        if (error.stack) {
            msg += '\n\n' + error.stack
        }

        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
            let now = Math.floor(Date.now() / 1000)

            if (!this.connectErrors[error.message]) {
                this.connectErrors[error.message] = 1
            } else {
                if (now - this.connectErrorsLast[error.message] > 600) {
                    // 10 minutes between bad connections is ok)
                    this.connectErrors[error.message] = 1
                } else if ((!this.connectErrorsPauseTill[error.message]) || (now - this.connectErrorsPauseTill[error.message] > 0)) {
                    this.connectErrors[error.message]++
                    if (this.connectErrors[error.message] > 10) {
                        // 10 bad in 10 seconds - is bad!
                        this.connectErrors[error.message] = 0
                        this.connectErrorsPauseTill[error.message] = now + 60000 //next time only long long time from now
                        const tg = require('./tg').init()
                        await tg.send(title + ' ' + msg)
                        sleep.msleep(60000)
                    }
                }
            }
            this.connectErrorsLast[error.message] = now
            sleep.msleep(1000)
        } else if (error.code === 'ER_NO_SUCH_TABLE') {
            // need to restart database
            sleep.msleep(60000)
        } else if (
            error.code !== 'ER_LOCK_DEADLOCK' &&
            error.code !== 'ECONNREFUSED'
        ) {
            const tg = require('./tg').init()
            await tg.send(title + ' ' + msg)
        }
        return true
    }
}

module.exports.init = function() {
    return new Fncs()
}
