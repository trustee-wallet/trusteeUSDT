/**
 * Wrapper for tx unspend output scanning and saving to the PgProcessor
 * @author Ksu
 */
module.paths.push('/usr/lib/node_modules')

const sleep = require('sleep')

const TRANSACTIONS_PER_ROUND = 1

const PAUSE_PER_ROUND = 30000
const PAUSE_PER_LITTLE = 60000
const PAUSE_PER_EMPTY = 90000

class WatchTransactionsOutputsSteps {
    /**
     * @param {PgProcessor} db
     * @param {string} currencyCode
     * @param {number} divider for parallel unblocking scanning
     */
    constructor(db, currencyCode, divider = 1) {
        if (currencyCode !== 'USDT') {
            throw new Error('its logic for now only for btc outputs of usdt tx!');
        }
        /** @private @member {PgProcessor} **/
        this.db = db

        /** @private @member {string} **/
        this.currencyCode = currencyCode

        /** @private @member {Function} **/
        this.log = require('../../../micro_common/common/log').init()

        let dispatcher = require('../../../micro_common/blockchains/Dispatcher').init()

        /** @private @member {EthRpc|BtcRpc} **/
        this.processor = dispatcher.getBlocksProcessor('BTC')

        /** @private @member {DbTransactionsOutputs} **/
        this.table = require('./DbTransactionsOutputs').init(this.db, this.currencyCode)

        /** @private @member {DbTransactionsBlocks} **/
        this.tableTodo = require('./DbTransactionsOutputsTodo').init(this.db, this.currencyCode, divider)

        this.divider = divider
    }

    /**
     * For never exits
     * @returns {Promise<number>}
     */
    async step3() {
        let last = await this._step3Inner()
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
     * Main logic of tx outputs scanning for valid tx and saving to db
     * @returns {Promise<number>} total scanned tx
     */
    async _step3Inner() {
        await this.tableTodo.releaseLocked()

        let transactionsTodo = await this.tableTodo.getNextAndLock(TRANSACTIONS_PER_ROUND)
        if (!transactionsTodo) {
            return 0
        }
        let transactionsToSave = []
        let markFinished = []
        let count = 0
        for (let transactionTodo of transactionsTodo) {
            this.log(`${this.currencyCode} transaction outputs ${transactionTodo.transactionHash} scanning start`)
            let row = await this.processor.getTransaction(
                transactionTodo.transactionHash
            )
            if (!row) {
                throw new Error('no BTC tx for ' + transactionTodo.transactionHash);
            }
            let voutTo = false;
            for (let vout of row.vout) {
                if (vout.scriptPubKey.addresses && vout.scriptPubKey.addresses[0] === transactionTodo.toAddress) {
                    voutTo = vout;
                }
            }
            if (!voutTo) {
                throw new Error('no BTC tx vout ' + transactionTodo.toAddress + ' for ' + transactionTodo.transactionHash);
            }

            count++
            let transaction = [
                transactionTodo.id,
                transactionTodo.innerBlockID,
                transactionTodo.blockNumber,
                transactionTodo.transactionHash,
                JSON.stringify(row.vout[0]),
                voutTo.value * 10000000, //to satoshi
                voutTo.n,
                voutTo.scriptPubKey.asm,
                voutTo.scriptPubKey.hex,
                voutTo.scriptPubKey.reqSigs,
                voutTo.scriptPubKey.type,
                JSON.stringify(voutTo.scriptPubKey.addresses)
            ]
            markFinished.push({ id:  transactionTodo.id })
            transactionsToSave.push(transaction);

        }
        try {
            await this.db.query('START TRANSACTION')
            this.log(`${this.currencyCode} putNewTransactionsOutputs started`)
            await this.table.putNewTransactionsDetails(transactionsToSave)


            await this.tableTodo.finishLocked(markFinished)
            this.log(`${this.currencyCode} finishLocked ended`)
            await this.db.query('COMMIT')
            this.log(`${this.currencyCode} putNewTransactionsOutputs committed`)
        } catch (error) {
            await this.db.query('ROLLBACK')
            throw error
        }
        return count
    }
}

module.exports.init = function(db, currencyCode, divider) {
    return new WatchTransactionsOutputsSteps(db, currencyCode, divider)
}
