/**
 * Wrapper for blocks headers scanning and saving to the PgProcessor
 * @author Ksu
 */
module.paths.push('/usr/lib/node_modules')

const sleep = require('sleep')

const PAUSE_PER_LITTLE = 30000
const PAUSE_PER_EMPTY = 60000

class WatchSteps {
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

        let dispatcher = require('../../../micro_common/blockchains/Dispatcher').init()

        /** @private @member {BtcRpc} **/
        this.processor = dispatcher.getBlocksProcessor(this.currencyCode)

        /** @private @member {BtcTransformer} **/
        this.transformer = dispatcher.getTransformer(this.currencyCode)

        /** @private @member {DbTransactionsBlocks} **/
        this.table = require('./DbTransactionsBlocks').init(this.db, this.currencyCode)

        /** @private @member {number}**/
        this.PREV_BLOCK_NUMBER = 0

        /** @member {number} **/
        this.PLUS_BLOCK_COUNT = 5

        /** @member {number} **/
        this.DEEP_BLOCK_COUNT = 5
    }

    /**
     * For never exits
     * @returns {Promise<number>}
     */
    async step1() {
        let last = await this._step1Inner()
        if (last === 0) {
            sleep.msleep(PAUSE_PER_EMPTY)
        } else {
            if (last - this.PREV_BLOCK_NUMBER < 4) {
                sleep.msleep(PAUSE_PER_LITTLE)
            }
            this.PREV_BLOCK_NUMBER = last
        }
    }

    /**
     * Main logic of blocks scanning and saving to db
     * @param {number} forceMax
     * @returns {Promise<number>} last scanned block number
     */
    async _step1Inner(forceMax = 0) {
        let [blocksByNumbers, lastScannedBlock] = await this.table.getLastBlocks(this.currencyCode, forceMax)
        let blocks = await this._scanLastBlocks(lastScannedBlock, this.PLUS_BLOCK_COUNT, this.DEEP_BLOCK_COUNT)
        let last = await this._checkOrphans(blocksByNumbers, blocks)
        await this.table.putNewBlocks(blocks)
        return last
    }

    /**
     * @param {number} starting
     * @param {number} PLUS_BLOCK_COUNT
     * @param {number} DEEP_BLOCK_COUNT
     * @return {Promise<Array>}
     * @private
     */
    async _scanLastBlocks(starting, PLUS_BLOCK_COUNT, DEEP_BLOCK_COUNT) {
        if (!starting) {
            DEEP_BLOCK_COUNT = 0
            starting = this.processor.startBlock
        } else if (DEEP_BLOCK_COUNT < PLUS_BLOCK_COUNT) {
            throw new Error('blocks transactions will be saved only on second block check (so need to go deep not to lose any)')
        }

        // find first block could be scanned from starting + PLUS_BLOCK
        let result = false
        for (let i = PLUS_BLOCK_COUNT; i >= 0; i--) {
            try {
                this.log(`${this.currencyCode} blocks: scanning ${starting + i}`)
                result = await this.processor.blockByIndex(starting + i)
            } catch (err) {
                if (err.message.indexOf('Block height out of range') != -1) {
                    // skip block
                } else {
                    throw err
                }
            }
            if (result) {
                break
            }
        }
        if (!result) {
            return []
        }

        // save first block to the array
        let blocks = []
        // noinspection JSCheckFunctionSignatures
        let unified = this.transformer.unifyBlock(result)
        blocks.push(unified)

        // go deeper from first block to starting block and deeper
        let realDeep = unified.blockNumber - starting + DEEP_BLOCK_COUNT
        let i = 0
        while (i < realDeep) {
            if (!blocks[i].prevBlock) {
                break
            }
            let prev = await this.processor.blockByHash(blocks[i].prevBlock)
            if (prev) {
                let unified2 = this.transformer.unifyBlock(prev)
                blocks.push(unified2)
                i++
            }
        }

        return blocks
    }

    /**
     * Looks for redone blocks - new chain wins and we need to delete not valid blocks
     * @param {Object[]} blocksByNumbers
     * @param {string} blocksByNumbers[].id
     * @param {string} blocksByNumbers[].blockNumber
     * @param {string} blocksByNumbers[].blockHash
     * @param {BlockchainBlock[]} blocks
     * @returns {Promise<number>} last scanned block number
     * @private
     */
    async _checkOrphans(blocksByNumbers, blocks) {
        let max = 0
        let orphans = {}
        for (let i = 0, ic = blocks.length; i < ic; i++) {
            let block = blocks[i]
            let saved = blocksByNumbers[block.blockNumber]
            if (max < block.blockNumber) {
                max = block.blockNumber
            }

            if (saved && !orphans[saved.blockNumber] && saved.blockHash !== block.blockHash) {
                this.log(`${this.currencyCode} blocks: orphan current for height ${block.blockNumber} found!`, saved)
                await this.table._markOrphan(this.currencyCode, saved)
                orphans[saved.blockNumber] = 1
            }

            saved = blocksByNumbers[block.blockNumber - 1]
            if (saved && !orphans[saved.blockNumber] && saved.blockHash !== block.prevBlock) {
                this.log(`${this.currencyCode} blocks: orphan prev for height ${block.blockNumber - 1} found!`, saved)
                await this.table._markOrphan(this.currencyCode, saved)
                orphans[saved.blockNumber] = 1
            }
        }
        return max
    }
}

module.exports.init = function(db, currencyCode) {
    return new WatchSteps(db, currencyCode)
}
