/**
 * General realization of db dispatcher
 * @author Ksu
 */
module.paths.push('/usr/lib/node_modules')

function db(PREFIX, ENGINE) {
    let ProcessorClass
    if (ENGINE === 'PG') {
        ProcessorClass = require('./db_engines/PgProcessor').PgProcessor
    } else {
        throw new Error(`Not supported ${ENGINE}`)
    }
    return new ProcessorClass(PREFIX, ENGINE)
}

module.exports.init = function(PREFIX, ENGINE = 'PG') {
    let host = `${PREFIX}_${ENGINE}_HOST`
    if (!process.env[host]) {
        console.log(`Plz setup DB with prefix ${host}`)
        throw new Error('No DB host found')
    }
    return db(PREFIX, ENGINE)
}
