/**
 * Saves blocks and transactions hashes
 * @author Ksu
 */
module.paths.push('/usr/lib/node_modules')

const constants = require('../../../micro_configs/BlockchainNodes')

class DbTransactionsBlocks {
    /**
     * @param {PgProcessor} db
     * @param {string} currencyCode
     */
    constructor(db, currencyCode) {
        /** @private @member {PgProcessor} **/
        this.db = db

        this.savedTx = {}

        this.savedTxCheckSqls = {}

        if (constants.SAVE_BOTH_BTC_AND_USDT && currencyCode === 'USDT') {
            this.currencyCodeMain = 'BTC'
            this.currencyCodeSecondary = 'USDT'
        } else {
            this.currencyCodeMain = currencyCode
            this.currencyCodeSecondary = false
        }

        /** @private @member {Function} **/
        this.log = require('../../../micro_common/common/log').init()
    }

    /**
     * Saves new blocks from blockchain to db
     * @param {BlockchainBlock[]} data
     * @param {boolean} saveTx
     * @returns {Promise<*[]|boolean>}
     */
    async putNewBlocks(data, saveTx = false) {
        if (!data.length) {
            throw new Error('data is empty')
        }

        let promises = []
        let innerRecordsMain = []
        let innerRecordsSecondary = []

        // all exists in one check
        this.log(`DbTransactionsBlocks: Blocks ids checking start`)
        let existsBlocks = await this._findBlocksInDB(data)
        this.log(`DbTransactionsBlocks: Blocks ids checked`)

        // this.log(`DbTransactionsBlocks: Blocks txs checking start`);
        let existsTxIndexedMain = {} // await this._findTxInDB(existsBlocks.arrayed, this.currencyCodeMain);
        let existsTxIndexedSecondary = {} // await this._findTxInDB(existsBlocks.arrayed, this.currencyCodeSecondary);
        // this.log(`DbTransactionsBlocks: Blocks txs checked`);

        for (let i = data.length - 1; i >= 0; i--) {
            let row = data[i]
            let unique = row.blockNumber + '_' + row.blockHash

            /** @param {number} exists[].id **/
            /** @param {number} exists[]._removed **/
            let exists = existsBlocks.keyed[unique] || false

            let transactions = []
            let usdt = []
            if (this.savedTx[unique]) {
                transactions = this.savedTx[unique][0]
                usdt = this.savedTx[unique][1]
            } else {
                transactions = row.transactions
                delete row.transactions
                usdt = row.usdt
                delete row.usdt
                if (saveTx) {
                    this.savedTx[unique] = [transactions, usdt]
                }
            }

            if (exists === false) {
                delete row.currencyCode
                promises.push(this.db.insertObject(`transactions_blocks_headers_${this.currencyCodeMain}`, row, { blockTime: 'to_timestamp' }))
            } else {
                if (exists._removed) {
                    promises.push(this._unMarkOrphan(this.currencyCodeMain, exists))
                }
                if (transactions && !existsTxIndexedMain[exists.id]) {
                    innerRecordsMain = this._prepareNewTransactionsHashes(innerRecordsMain, exists.id, this.currencyCodeMain, row, transactions)
                }
                if (usdt && !existsTxIndexedSecondary[exists.id]) {
                    innerRecordsSecondary = this._prepareNewTransactionsHashes(innerRecordsSecondary, exists.id, this.currencyCodeSecondary, row, usdt)
                }
            }
        }
        try {
            if (innerRecordsMain.length > 0) {
                this.log(`DbTransactionsBlocks: Blocks main tx start preparing : ${innerRecordsMain.length}`)
                promises.push(this._putNewTransactionsHashes(innerRecordsMain, this.currencyCodeMain))
            }
            if (innerRecordsSecondary.length > 0) {
                this.log(`DbTransactionsBlocks: Blocks secondary tx start preparing : ${innerRecordsSecondary.length}`)
                promises.push(this._putNewTransactionsHashes(innerRecordsSecondary, this.currencyCodeSecondary))
            }
            this.log(`DbTransactionsBlocks: Blocks all tx prepared`)
            this.log(`DbTransactionsBlocks: Total promises: ${promises.length}`)
        } catch (e) {
            throw e
        }
        if (!promises.length) return true
        return Promise.all(promises)
    }

    /**
     * @param data
     * @return {Promise<{arrayed: Array, keyed: {}}>}
     * @private
     */
    async _findBlocksInDB(data) {
        let existsPromises = []
        let sqlExists = `SELECT id, _removed, block_number AS "blockNumber", block_hash AS "blockHash" 
                            FROM transactions_blocks_headers_${this.currencyCodeMain} 
                            WHERE block_number = $1 AND block_hash = $2`
        for (let i = data.length - 1; i >= 0; i--) {
            let row = data[i]
            existsPromises.push(
                this.db.query(sqlExists, [row.blockNumber, row.blockHash])
            )
        }
        let existsResults = await Promise.all(existsPromises)
        let existsBlocks = {
            arrayed: [],
            keyed: {}
        }
        for (let i = existsResults.length - 1; i >= 0; i--) {
            let row = existsResults[i] ? existsResults[i][0] : false
            if (!row) continue
            existsBlocks.keyed[row.blockNumber + '_' + row.blockHash] = row
            existsBlocks.arrayed.push(row)
        }
        return existsBlocks
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {object} existsBlocksArrayed
     * @param {string} existsBlocksArrayed[].id
     * @param {string} existsBlocksArrayed[]._removed
     * @param {string} existsBlocksArrayed[].blockNumber
     * @param {string} existsBlocksArrayed[].blockHash
     * @param {string} currencyCode
     * @return {Promise<*>}
     * @private
     */
    async _findTxInDB(existsBlocksArrayed, currencyCode) {
        if (!currencyCode) return false
        if (!existsBlocksArrayed || existsBlocksArrayed.length === 0)
            return false
        // all tx in one check
        let existsTxSqls = []
        for (let i = existsBlocksArrayed.length - 1; i >= 0; i--) {
            let row = existsBlocksArrayed[i]
            existsTxSqls.push(
                `(SELECT id, inner_block_id AS "innerBlockID" FROM transactions_blocks_list_basics_${currencyCode} WHERE block_number=${row.blockNumber} AND inner_block_id=${row.id} LIMIT 1)`
            )
        }
        if (!existsTxSqls || existsTxSqls.length < 1) {
            return {}
        }
        let sql = existsTxSqls.join(' UNION ')
        if (this.savedTxCheckSqls[sql]) {
            return this.savedTxCheckSqls[sql]
        }
        this.savedTxCheckSqls[sql] = sql
        let existsTxResults = await this.db.query(sql)
        let existsTxIndexed = {}
        /** @param {number} existsTxResults[].innerBlockID **/
        for (let i = existsTxResults.length - 1; i >= 0; i--) {
            existsTxIndexed[existsTxResults[i].innerBlockID] =
                existsTxResults[i].id
        }
        this.savedTxCheckSqls[sql] = existsTxIndexed
        return existsTxIndexed
    }

    cleanUpCache() {
        this.savedTx = {}
        this.savedTxCheckSqls = {}
    }

    /**
     * Saves transactions hashes for block
     * @param {Array} records
     * @param {string} currencyCode
     * @returns {Promise<*>}
     * @private
     */
    async _putNewTransactionsHashes(records, currencyCode) {
        if (!records || records.length === 0) {
            return true
        }
        return this.db.insertArray(
            `transactions_blocks_list_basics_${currencyCode}`,
            `inner_block_id, block_number, transaction_hash`,
            records,
            `ON CONFLICT (transaction_hash,inner_block_id,block_number) DO UPDATE  SET inner_block_id = EXCLUDED.inner_block_id, _removed=0, _removed_time=NULL`
        )
    }

    /**
     * Saves transactions hashes for block
     * @param {Array} records
     * @param {number} innerBlockID
     * @param {string} currencyCode
     * @param {BlockchainBlock} block
     * @param {string[]} data
     * @returns {Array}
     * @private
     */
    _prepareNewTransactionsHashes(
        records = [],
        innerBlockID,
        currencyCode,
        block,
        data
    ) {
        if (!innerBlockID) {
            throw new Error('innerBlockID is required')
        }
        if (!data || data.length === 0) {
            return []
        }
        for (let i = 0, ic = data.length; i < ic; i++) {
            let hash = data[i]
            records.push([innerBlockID, block.blockNumber, hash])
        }
        return records
    }

    /**
     * Gets last blocks from db to check
     * @param {string} currencyCode
     * @param {number} forceMax
     * @param {number} limit
     * @returns {Promise<*[]>}
     * @todo check index and speed
     */
    async getLastBlocks(currencyCode, forceMax = 0, limit = 10) {
        let sql, check
        if (forceMax) {
            sql = `SELECT id, block_number AS "blockNumber", block_hash AS "blockHash" FROM transactions_blocks_headers_${currencyCode} WHERE _removed = 0 AND block_number<$1 ORDER BY block_number DESC LIMIT $2`
            check = await this.db.query(sql, [forceMax, limit])
        } else {
            sql = `SELECT id, block_number AS "blockNumber", block_hash AS "blockHash" FROM transactions_blocks_headers_${currencyCode} WHERE _removed = 0 ORDER BY block_number DESC LIMIT $1`
            check = await this.db.query(sql, [limit])
        }
        if (!check) {
            return [[], 0]
        }
        let blocks = {}
        let max = 0
        for (let i = 0, ic = check.length; i < ic; i++) {
            let blockNumber = check[i].blockNumber
            blocks[blockNumber] = check[i]
            if (max < blockNumber) {
                max = blockNumber
            }
        }
        return [blocks, max]
    }

    /**
     * Gets last blocks from db to check fast
     * @param {string} currencyCode
     * @param {number} start
     * @param {number} end
     * @returns {Promise<number>}
     * @todo check index and speed
     */
    async getLastBlocksFast(currencyCode, start, end) {
        let key = 'getLastBlocksFast_' + currencyCode + '_' + start + '_' + end

        let sql = `SELECT my_val AS res FROM transactions_work WHERE my_key=$1`
        /** @param {number} check1[].res **/
        let check1 = await this.db.query(sql, [key])
        if (check1) {
            // noinspection PointlessArithmeticExpressionJS
            return check1[0].res * 1
        }

        let sql2 = `SELECT MAX(block_number) AS mx FROM transactions_blocks_list_basics_USDT WHERE _removed = 0 AND block_number>=$1 AND block_number<$2`
        /** @param {number} check2[].mx **/
        let check2 = await this.db.query(sql2, [start, end])
        if (!check2) {
            return 0
        }
        // noinspection PointlessArithmeticExpressionJS
        let mx = check2[0].mx * 1
        await this.db.query(
            `INSERT INTO transactions_work (my_val, my_key) VALUES ($1, $2)`,
            [mx, key]
        )
        // noinspection PointlessArithmeticExpressionJS
        return mx
    }

    async saveLastBlocksFast(currencyCode, start, end, mx) {
        let key = 'getLastBlocksFast_' + currencyCode + '_' + start + '_' + end
        return this.db.query(
            `UPDATE transactions_work SET my_val=$1 WHERE my_key=$2`,
            [mx, key]
        )
    }

    /**
     * @param {string} currencyCode
     * @param {object} row
     * @param {number} row.id
     * @returns {Promise<*[]>}
     */
    async _unMarkOrphan(currencyCode, row) {
        let promises = []
        if (currencyCode === 'BTC' || currencyCode === 'USDT') {
            promises.push(
                this.db.query(`UPDATE transactions_blocks_headers_USDT SET _removed_time = NULL, _removed = 0 WHERE id = $1`, [row.id])
            )
            promises.push(
                this.db.query(`UPDATE transactions_blocks_headers_BTC SET _removed_time = NULL, _removed = 0 WHERE id = $1`, [row.id])
            )
            promises.push(
                this.db.query(`UPDATE transactions_blocks_list_basics_USDT SET _removed_time = NULL, _removed = 0 WHERE innerBlockID = $1`, [row.id])
            )
            promises.push(
                this.db.query(`UPDATE transactions_blocks_list_basics_BTC SET _removed_time = NULL, _removed = 0 WHERE innerBlockID = $1`, [row.id])
            )
        } else {
            promises.push(
                this.db.query(`UPDATE transactions_blocks_headers_${currencyCode} SET _removed_time = NULL, _removed = 0 WHERE id = $1`, [row.id])
            )
            promises.push(
                this.db.query(`UPDATE transactions_blocks_list_basics_${currencyCode} SET _removed_time = NULL, _removed = 0 WHERE innerBlockID = $1`, [row.id])
            )
        }
        return Promise.all(promises)
    }

    /**
     * @param {string} currencyCode
     * @param {Object} row
     * @param {number} row.id
     * @param {string} row.blockHash
     * @param {string} row.blockHeight
     * @returns {Promise<*[]>}
     */
    async _markOrphan(currencyCode, row) {
        let promises = []
        if (currencyCode === 'BTC' || currencyCode === 'USDT') {
            promises.push(
                this.db.query(`UPDATE transactions_blocks_headers_USDT SET _removed_time = NOW(), _removed = 1 WHERE id = $1`, [row.id])
            )
            promises.push(
                this.db.query(`UPDATE transactions_blocks_headers_BTC SET _removed_time = NOW(), _removed = 1 WHERE id = $1`, [row.id])
            )
            promises.push(
                this.db.query(`UPDATE transactions_blocks_list_basics_USDT SET _removed_time = NOW(), _removed = 1 WHERE innerBlockID = $1`, [row.id])
            )
            promises.push(
                this.db.query(`UPDATE transactions_blocks_list_basics_BTC SET _removed_time = NOW(), _removed = 1 WHERE innerBlockID = $1`, [row.id])
            )
        } else {
            promises.push(
                this.db.query(`UPDATE transactions_blocks_headers_${currencyCode} SET _removed_time = NOW(), _removed = 1 WHERE id = $1`, [row.id])
            )
            promises.push(
                this.db.query(`UPDATE transactions_blocks_list_basics_${currencyCode} SET _removed_time = NOW(), _removed = 1 WHERE innerBlockID = $1`, [row.id])
            )
        }
        return Promise.all(promises)
    }
}

module.exports.init = function(db, currencyCode) {
    return new DbTransactionsBlocks(db, currencyCode)
}
