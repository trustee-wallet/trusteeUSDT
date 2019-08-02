/**
 * Get transactions to scan outputs
 * @author Ksu
 * @typedef {Object} dbTransactionsBlocksListBasicOutputs
 * @property {number} id
 * @property {number} innerBlockID
 * @property {number} blockNumber
 * @property {string} fromAddress
 * @property {string} toAddress
 * @property {string} transactionHash
 */
module.paths.push('/usr/lib/node_modules')

const MAX_RAND = 1000

class DbTransactionsOutputsTodo {
    /**
     * @param {PgProcessor} db
     * @param {string} currencyCode
     * @param {number} divider
     */
    constructor(db, currencyCode, divider) {
        /** @private @member {PgProcessor} **/
        this.db = db

        /** @private @member {string} **/
        this.currencyCode = currencyCode

        /** @private @member {number} **/
        this.divider = divider

        /** @private @member {string} **/
        this.tableName = `transactions_blocks_list_details_${this.currencyCode.toLowerCase()}_${divider}`
    }

    /**
     * If some transactions were locked but error occurred - could unlocked in some time and try again
     * @returns {Promise<boolean>}
     */
    async releaseLocked() {
        let count = `SELECT id, _scanned_output_time FROM ${this.tableName} 
                          WHERE custom_valid = 1 AND _scanned_output<0 AND _scanned_output_time < (NOW() - INTERVAL '20 MINUTE') 
                          LIMIT 1`
        let lock = await this.db.query(count, [])
        if (!lock) {
            return true
        }
         let sql = `UPDATE ${this.tableName} SET _scanned_output=0 
                          WHERE custom_valid = 1 AND _scanned_output<0 AND _scanned_output_time < (NOW() - INTERVAL '20 MINUTE')`
        lock = await this.db.query(sql, [])
        if (!lock.affectedRows) return lock

        return lock
    }

    /**
     * @param {number} limit
     * @return {Promise<dbTransactionsBlocksListBasicOutputs[]|boolean>}
     */
    async getNextAndLock(limit) {
        let index = Math.floor(Math.random() * MAX_RAND) + 1

        let sql1 = `SELECT id FROM ${this.tableName} WHERE _scanned_output=0 AND _removed=0 ORDER BY block_number LIMIT $2`
        let params1 = [-1 * index, limit]

        let sql2 = `SELECT id, inner_block_id AS "innerBlockID", block_number AS "blockNumber", transaction_hash AS "transactionHash",
                    from_address AS "fromAddress", to_address AS "toAddress"
                    FROM ${this.tableName} WHERE custom_valid=1 AND _removed=0 AND _scanned_output=$1 LIMIT $2`
        try {
            let lock1 = await this.db.query(
                `UPDATE ${this.tableName} SET _scanned_output = $1, _scanned_output_time=NOW() WHERE id IN (${sql1})`,
                params1
            )
            if (lock1.affectedRows === 0) {
                return lock1
            }
        } catch (err) {
            err.message += ' index:' + index + ' divider:' + this.divider
            throw err
        }
        return this.db.query(sql2, [-1 * index, limit])
    }

    /**
     * @param {dbTransactionsBlocksListBasic[]} data
     * @return {Promise<boolean>}
     */
    async finishLocked(data) {
        if (!data || !(data.length > 0)) {
            return true
        }
        let sql = `UPDATE ${this.tableName} SET _scanned_output_time=NOW(), _scanned_output = 99999 WHERE id IN (`
        for (let i = 0, ic = data.length; i < ic; i++) {
            if (i > 0) sql += ','
            sql += data[i].id
        }
        sql += ')'
        return this.db.query(sql, [])
    }
}

module.exports.init = function(db, currencyCode, divider) {
    return new DbTransactionsOutputsTodo(db, currencyCode, divider)
}
