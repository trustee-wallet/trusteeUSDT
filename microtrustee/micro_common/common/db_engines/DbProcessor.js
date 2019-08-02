/**
 * Interface class
 * @author Ksu
 */
module.paths.push('/usr/lib/node_modules')

class DbProcessor {
    constructor(PREFIX, ENGINE) {
        this.SETTINGS = {
            host: process.env[PREFIX + '_' + ENGINE + '_HOST'],
            port: process.env[PREFIX + '_' + ENGINE + '_PORT'],
            user: process.env[PREFIX + '_' + ENGINE + '_USER'],
            password: process.env[PREFIX + '_' + ENGINE + '_PASSWORD'],
            database: process.env[PREFIX + '_' + ENGINE + '_DATABASE']
        }
    }
}

module.exports.DbProcessor = DbProcessor
