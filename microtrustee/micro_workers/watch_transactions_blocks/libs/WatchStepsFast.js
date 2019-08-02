/**
 * Wrapper for fast blocks headers scanning and saving to the PgProcessor
 * @author Ksu
 */
module.paths.push('/usr/lib/node_modules')

const sleep = require('sleep')

class WatchStepsFast {
    /**
     * @param {PgProcessor} db
     * @param {string} currencyCode
     */
    constructor(db, currencyCode) {
        /** @private @member {PgProcessor} **/
        this.db = db

        /** @private @member {string} **/
        this.currencyCode = currencyCode

        /** @private @member {Function} **/
        this.log = require('../../../micro_common/common/log').init()

        /**
         * @type {Dispatcher}
         */
        let dispatcher = require('../../../micro_common/blockchains/Dispatcher').init()

        /** @private @member {EthRpc|BtcRpc} **/
        this.processor = dispatcher.getBlocksProcessor(this.currencyCode)

        /** @private @member {EthTransformer|BtcTransformer} **/
        this.transformer = dispatcher.getTransformer(this.currencyCode)

        /** @private @member {DbTransactionsBlocks} **/
        this.table = require('./DbTransactionsBlocks').init(this.db, this.currencyCode)

        /** @member {number}**/
        this.NEXT_SCANNED_BLOCK = -1
    }

    /**
     * For never exits
     * @param {number} start
     * @param {number} end
     * @returns {Promise<boolean>}
     */
    async step1Fast(start, end) {
        this.log(`Step start from ${this.NEXT_SCANNED_BLOCK}`)
        if (this.NEXT_SCANNED_BLOCK < 0) {
            this.NEXT_SCANNED_BLOCK = await this.table.getLastBlocksFast(this.currencyCode, start, end)
            if (!this.NEXT_SCANNED_BLOCK || this.NEXT_SCANNED_BLOCK < 1) {
                this.NEXT_SCANNED_BLOCK = this.processor.startBlock
                if (this.NEXT_SCANNED_BLOCK < start)
                    this.NEXT_SCANNED_BLOCK = start
            } else {
                this.NEXT_SCANNED_BLOCK++
            }
        }

        if (this.NEXT_SCANNED_BLOCK > this.processor.noDeepBlock) {
            throw new Error(
                `noDeepBlock ${this.processor.noDeepBlock} finished!`
            )
        }

        if (this.NEXT_SCANNED_BLOCK && this.NEXT_SCANNED_BLOCK - end >= 0) {
            this.log(`endBlock ${end} finished with ${this.NEXT_SCANNED_BLOCK}!`, true)
            if (this.db.end) {
                // noinspection JSIgnoredPromiseFromCall
                this.db.end()
            }
            // noinspection InfiniteLoopJS
            do {
                sleep.msleep(200000)
            } while (true)
        }

        this.log(`Step rechecked start from ${this.NEXT_SCANNED_BLOCK}`)
        try {
            await this._step1InnerFast(start, end)
            sleep.msleep(1000) // 1 sec
        } catch (e) {
            if (e.message.indexOf('Work queue depth exceeded') > 0) {
                console.log(e.message)
                console.log('')
                console.log('')
                sleep.msleep(6000)
            } else {
                throw e
            }
        }
        return true
    }
    /**
     * Main logic of blocks scanning and saving to db
     * @param {number} start
     * @param {number} end
     * @return {Promise<void>}
     * @private
     */
    async _step1InnerFast(start = 10000, end = 20000) {
        let result = await this.processor.blockByIndex(this.NEXT_SCANNED_BLOCK)
        let unified = this.transformer.unifyBlock(result)
        let tmps = [unified]
        this.log(`Block added ${unified.blockNumber} ${result.nextblockhash}`)

        // collect few more blocks to save
        let additional = 40
        if (end > 300000) {
            additional = 20
        } else if (end > 400000) {
            additional = 10
        } else if (end > 500000) {
            additional = 5
        }
        for (let i = 0; i < additional; i++) {
            try {
                result = await this.processor.blockByHash(result.nextblockhash)
                let unified2 = this.transformer.unifyBlock(result)
                tmps.push(unified2)
                this.log(`Block added ${unified2.blockNumber} ${result.nextblockhash}`)
            } catch (e) {
                if (e.message.indexOf('Work queue depth exceeded') > 0) {
                    break
                } else {
                    throw e
                }
            }
        }

        // reverse blocks
        let blocks = []
        let max = 0
        for (let i = tmps.length - 1; i >= 0; i--) {
            blocks.push(tmps[i])
            if (max < tmps[i].blockNumber) {
                max = tmps[i].blockNumber
            }
        }

        // save blocks
        this.log(`Blocks start saving`)
        await this.table.putNewBlocks(blocks, true)
        this.log(`Blocks pre saved, start tx saving`)
        await this.table.putNewBlocks(blocks, false)
        this.log(`Blocks are saved`)
        await this.table.saveLastBlocksFast(this.currencyCode, start, end, max)
        this.log(`Blocks last number is saved ${max}`)

        // change states for next round
        this.table.cleanUpCache()
        this.NEXT_SCANNED_BLOCK = max + 1
    }
}

module.exports.init = function(db, currencyCode) {
    return new WatchStepsFast(db, currencyCode)
}
