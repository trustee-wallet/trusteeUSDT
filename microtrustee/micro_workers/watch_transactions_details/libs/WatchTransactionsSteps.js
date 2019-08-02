/**
 * Wrapper for tx hash scanning and saving to the PgProcessor
 * @author Ksu
 */
module.paths.push('/usr/lib/node_modules')

const sleep = require('sleep')

const TRANSACTIONS_PER_ROUND = 10

const PAUSE_PER_ROUND = 600
const PAUSE_PER_LITTLE = 6000
const PAUSE_PER_EMPTY = 9000

class WatchTransactionsSteps {
    /**
     * @param {PgProcessor} db
     * @param {string} currencyCode
     * @param {number} divider for parallel unblocking scanning
     */
    constructor(db, currencyCode, divider = 1) {
        /** @private @member {PgProcessor} **/
        this.db = db

        /** @private @member {string} **/
        this.currencyCode = currencyCode

        /** @private @member {Function} **/
        this.log = require('../../../micro_common/common/log').init()

        let dispatcher = require('../../../micro_common/blockchains/Dispatcher').init()

        /** @private @member {EthRpc|BtcRpc} **/
        this.processor = dispatcher.getBlocksProcessor(this.currencyCode)

        /** @private @member {EthTransformer|BtcTransformer} **/
        this.transformer = dispatcher.getTransformer(this.currencyCode)

        /** @private @member {DbTransactionsDetails} **/
        this.table = require('./DbTransactionsDetails').init(this.db, this.currencyCode)

        /** @private @member {DbTransactionsBlocks} **/
        this.tableTodo = require('./DbTransactionsTodo').init(this.db, this.currencyCode, divider)

        this.divider = divider
    }

    /**
     * For never exits
     * @returns {Promise<number>}
     */
    async step2() {
        let last = await this._step2Inner()
        if (last === 0) {
            this.log(`${this.currencyCode} ${this.divider} nothing to scan`, true)
            sleep.msleep(PAUSE_PER_EMPTY)
        } else if (last < TRANSACTIONS_PER_ROUND / 2) {
            this.log(`${this.currencyCode} ${this.divider} little to scan (scanned: ${last}}`)
            sleep.msleep(PAUSE_PER_LITTLE)
        } else {
            this.log(`${this.currencyCode} ${this.divider} pause round (scanned: ${last}}`)
            sleep.msleep(PAUSE_PER_ROUND)
        }
    }

    /**
     * Main logic of tx hashes scanning and saving to db
     * @returns {Promise<number>} total scanned tx
     */
    async _step2Inner() {
        await this.tableTodo.releaseLocked()

        let transactionsTodo = await this.tableTodo.getNextAndLock(TRANSACTIONS_PER_ROUND)
        if (!transactionsTodo) {
            return 0
        }
        let transactionsToSave = []
        for (let transactionTodo of transactionsTodo) {
            this.log(`${this.currencyCode} transaction ${transactionTodo.transactionHash} scanning start`)
            let row = await this.processor.getTransaction(
                transactionTodo.transactionHash
            )
            let transaction = await this.transformer.unifyTransaction(row)
            if (transaction) {
                transaction.todo = {
                    id: transactionTodo.id,
                    innerBlockID: transactionTodo.innerBlockID,
                    blockNumber: transactionTodo.blockNumber,
                    hash : transactionTodo.transactionHash
                }
                if (transaction.amount < 0) {
                    console.error('Please check TX amount ' + JSON.stringifyJSON.stringify(transaction, null, '\t'))
                } else {
                    transactionsToSave.push(transaction)
                    this.log(`${this.currencyCode} ${transaction.customValid ? 'valid' : 'invalid'} transaction ${transaction.transactionHash}`,
                        `${transaction.fromAddress} -> ${transaction.toAddress} ${transaction.amount}`)
                }
            }
        }
        let count = 0
        try {
            await this.db.query('START TRANSACTION')
            this.log(`${this.currencyCode} putNewTransactionsDetails started`)
            await this.table.putNewTransactionsDetails(transactionsToSave)
            let markFinished = []
            for (let transaction of transactionsToSave) {
                count++
                markFinished.push({ id: transaction.todo.id })
            }
            await this.tableTodo.finishLocked(markFinished)
            this.log(`${this.currencyCode} finishLocked ended`)
            await this.db.query('COMMIT')
            this.log(`${this.currencyCode} putNewTransactionsDetails committed`)
        } catch (error) {
            await this.db.query('ROLLBACK')
            // one by one
            try {
                for (let transaction of transactionsToSave) {
                    await this.db.query('START TRANSACTION')
                    await this.table.putNewTransactionsDetails([transaction])
                    await this.tableTodo.finishLocked([{ id: transaction.todo.id }])
                    await this.db.query('COMMIT')
                }
            } catch (error2) {
                await this.db.query('ROLLBACK')
                throw error2
            }
        }
        return count
    }
}

module.exports.init = function(db, currencyCode, divider) {
    return new WatchTransactionsSteps(db, currencyCode, divider)
}
