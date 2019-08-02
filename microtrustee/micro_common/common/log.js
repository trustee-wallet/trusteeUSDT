/**
 * Simplified logging for debug - files are handled by pm2 if console output is on
 * @author Ksu
 */
module.paths.push('/usr/lib/node_modules')

class Log {
    /**
     * output data to console if not production mode
     * @param {string} txt
     * @param {string | object} secondOrForce
     * @param {boolean} force
     * @return {boolean}
     */
    log(txt, secondOrForce = false, force = false) {
        if (secondOrForce === true) {
            // to make force console easier
            force = true;
            secondOrForce = false;
        }
        if (!force && process.env.MICROTRUSTEE_IS_PROD && process.env.MICROTRUSTEE_IS_PROD.toString() !== '0') return false
        let time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
        let line = time + ' ' + txt
        if (secondOrForce && typeof secondOrForce !== 'undefined') {
            if (typeof secondOrForce === 'string') {
                line += ' ' + secondOrForce
            } else {
                line += ' ' + JSON.stringify(secondOrForce, null, '\t')
            }
        }
        console.log(line)
        return true
    }
}

module.exports.init = function() {
    let log = new Log()
    return log.log
}
