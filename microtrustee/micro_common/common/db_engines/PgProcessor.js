/**
 * Promised and pooled realization of mysql
 * @docs https://node-postgres.com/
 * @docs https://www.npmjs.com/package/pg-format
 * @author Ksu
 */
module.paths.push('/usr/lib/node_modules')

const { Pool } = require('pg')
const format = require('pg-format')

class PgProcessor extends require('./DbProcessor').DbProcessor {
    constructor(PREFIX, ENGINE) {
        super(PREFIX, ENGINE)

        this.SETTINGS.max = 3

        /** @private **/
        this.pool = new Pool(this.SETTINGS)
        this.pool.on('error', (err, client) => {
            console.error('Unexpected error on idle client', err)
            console.error('Client', client)
            process.exit(-1)
        })
    }

    async query(sql, args) {
        let result = false
        try {
            result = await this.pool.query(sql, args)
        } catch (e) {
            console.log('')
            console.log('')
            console.log('')
            console.log(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''))
            console.log('!!!!ERROR!!!!')
            console.log(sql)
            console.log(e.message)
            console.log('')
            console.log('')
            console.log('')
            if (args) console.log(args)
            if (!process.env.MICROTRUSTEE_IS_PROD || process.env.MICROTRUSTEE_IS_PROD.toString() === '0') {
                throw e
            }
        }
        if (result.rows && result.rows.length > 0) {
            return result.rows // only fields
        }
        if (result.rowCount) {
            return result
        }
        return false
    }

    async end() {
        return this.pool.end()
    }

    /**
     * Insert data object to the table with escaping and transforming, example: insertObject(`myTable`, {id:1, blockTime: 123}, { blockTime: 'to_timestamp' })
     * @param {string} tableName
     * @param {object} row
     * @param {object} transformations
     * @return {Promise<*>}
     */
    async insertObject(tableName, row, transformations = {}) {
        let arrayed = []
        let stringed = ''
        let numbered = ''
        let number = 0
        for (const key of Object.keys(row)) {
            arrayed.push(row[key])
            if (number > 0) {
                stringed += ','
                numbered += ','
            }
            number++
            stringed += this._toSnake(key)
            let tmp = '$' + number
            if (transformations[key]) {
                if (transformations[key] === 'to_timestamp') {
                    tmp = 'to_timestamp(' + tmp + ')'
                }
            }
            numbered += tmp
        }
        let sql = `INSERT INTO ${tableName}(${stringed}) VALUES (${numbered})`
        return this.query(sql, arrayed)
    }

    /**
     * Insert data array to the table to specified fields, example: insertArray( `myTable`, `my_field, my_field2`, [[1,1], [2,2]], `ON CONFLICT (my_field) DO UPDATE SET my_field2 = EXCLUDED,my_field2`
     * @param {string} tableName
     * @param {string} stringed
     * @param {array} rows
     * @param {string|boolean}additional
     * @return {Promise<*>}
     */
    async insertArray(tableName, stringed, rows, additional = false) {
        let sql = `INSERT INTO ${tableName}(${stringed}) VALUES %L `
        if (additional) sql += additional
        sql = format(sql, rows)
        return this.query(sql)
    }

    /**
     * Set application title for connection to postgre explorer (for better view)
     * @param {string} title
     * @return {Promise<void>}
     */
    async setAppTitle(title) {
        this.pool.on('connect', client => {
            // noinspection JSIgnoredPromiseFromCall
            client.query(`SET application_name = '${title}'`)
        })
    }

    /**
     * @param {string} str
     * @return {string}
     * @private
     */
    _toSnake(str) {
        return str.split(/(?=[A-Z])/).join('_').toLowerCase()
    }
}

module.exports.PgProcessor = PgProcessor
