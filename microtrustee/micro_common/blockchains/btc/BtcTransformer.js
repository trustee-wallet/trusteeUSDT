/**
 * Library to unify blockchain data to general data
 * @author Ksu
 *
 * @typedef {Object} BlockchainBlock
 * @property {string} currencyCode
 * @property {string} blockHash
 * @property {string} blockNumber
 * @property {string} nonce
 * @property {string} blockTime
 * @property {string} blockConfirmations
 * @property {string[]} transactions
 * @property {string[]} usdt
 * @property {string} nextBlock
 * @property {string} prevBlock
 * @property {number} _tx
 * @property {number} _usdt
 *
 * @typedef {Object} BlockchainTransaction
 * @property {string} tx.currencyCode
 * @property {string} tx.transactionTxid
 * @property {string} tx.transactionHash
 * @property {number} tx._fromCount
 * @property {number} tx._toCount
 * @property {string} from[].addr
 * @property {string} from[].amount
 * @property {string} from[].txid
 * @property {string} from[].vin
 * @property {string} to[].addr
 * @property {string} to[].amount
 * @property {string} to[].txid
 * @property {string} to[].vout
 */
module.paths.push('/usr/lib/node_modules')

class BtcTransformer {
    constructor(currencyCode) {
        /** @private @member {string} **/
        this.currencyCode = currencyCode
    }

    /**
     * @param {string} row.hash: '00000000000000000018e538e205d8012c3ace9ec07be5a51a6c0fe325648575'
     * @param {string} row.confirmations: 51
     * @param {string} row.strippedsize: 948235
     * @param {string} row.size: 1148366
     * @param {string} row.weight: 3993071
     * @param {string} row.height: 544001
     * @param {string} row.version: 536870912
     * @param {string} row.versionHex: '20000000'
     * @param {string} row.merkleroot: 'fdf1d09d92247dae7c53bf430efa7a9e18f521d2315b0246544f1530e27921b0'
     * @param {string[]} row.tx:
     * @param {string[]} row.usdt:
     * @param {string} row.time: 1538442247
     * @param {string} row.mediantime: 1538439801
     * @param {string} row.nonce: 2631682522
     * @param {string} row.bits: '17275a1f'
     * @param {string} row.difficulty: 7152633351906.413
     * @param {string} row.chainwork: '0000000000000000000000000000000000000000036cff549001b2848b5092c8'
     * @param {string} row.previousblockhash: '0000000000000000000b4842f41ab2f65826a45102def71e43b1d8233a28d9f6'
     * @param {string} row.nextblockhash: '000000000000000000002be955fa80d7302a6cf24730c96dc2ed2911c1d'
     * @returns {BlockchainBlock}
     */
    unifyBlock(row) {
        return {
            currencyCode: this.currencyCode,
            blockHash: row.hash,
            blockNumber: row.height,
            nonce: row.nonce,
            blockTime: row.time,
            blockConfirmations: row.confirmations,
            transactions: row.tx,
            usdt: row.usdt ? row.usdt : [],
            nextBlock: row.nextblockhash ? row.nextblockhash : '',
            prevBlock: row.previousblockhash ? row.previousblockhash : '',
            _tx: row.tx.length,
            _usdt: row.usdt ? row.usdt.length : 0
        }
    }

    /**
     * @param {string} row.txid we save it as hash as in btc its indexed by txid - not hash
     * @param {string} row.hash
     * @param {int} row.version
     * @param {int} row.size
     * @param {int} row.vsize
     * @param {int} row.locktime
     * @param {Object[]} row.vin
     * @param {Object[]} row.vout
     * @return {BlockchainTransaction}
     */
    unifyTransaction (row) {
        if (!row || !row.vout || typeof (row.vout) === 'undefined') {
            console.log('Empty vout', row);
            return false;
        }
        try {
            let unifyFrom = BtcTransformer._splitAddressesFrom(row.vin);
            let unifyTo = BtcTransformer._splitAddressesTo(row.vout);
            let unifyFromLength = unifyFrom.length;
            let unifyToLength =  unifyTo.length;

            return {
                tx : {
                    currencyCode: this.currencyCode,
                    transactionTxid: row.txid,
                    transactionHash: row.hash,
                    _fromCount : unifyFromLength,
                    _toCount : unifyToLength,
                    fromAddress : unifyFromLength === 1 ? unifyFrom[0].addr : false,
                    toAddress  : unifyToLength === 1 ? unifyTo[0].addr : false,
                    amount : unifyToLength === 1 ? unifyTo[0].amount : 0,
                    fee : 0
                },
                from : unifyFrom,
                to : unifyTo
            };
        } catch (e) {
            e.message += ` txid: ${row.txid} hash: ${row.hash}`;
            throw e;
        }
    }

    /**
     * @param {Object[]} searches
     * @param {string} searches[].txid
     * @param {number} searches[].vout
     * @param {string} searches[].scriptSig.asm
     * @param {string} searches[].scriptSig.hex
     * @param {string} searches[].sequence
     * @return {Array}
     * @private
     */
    static _splitAddressesFrom (searches) {
        let result = [];
        for (let j = 0, jc = searches.length; j < jc; j++) {
            let search = searches[j];
            result.push({ addr: false, amount : false, txid : search.txid, vout: search.vout });
        }
        return result;
    }

    /**
     * @param {Object[]} searches
     * @param {string} searches[].addr
     * @param {number} searches[].n
     * @param {string} searches[].value
     * @param {string} searches[].scriptPubKey
     * @param {string[]} searches[].scriptPubKey.addresses
     * @return {*}
     * @private
     */
    static _splitAddressesTo (searches) {
        let result = [];
        for (let j = 0, jc = searches.length; j < jc; j++) {
            let search = searches[j];
            if (!search.addr && search.scriptPubKey && search.scriptPubKey.addresses) {
                let addrCount = search.scriptPubKey.addresses.length;
                if (addrCount === 1) {
                    search.addr = search.scriptPubKey.addresses[0];
                } else if (addrCount > 1) {
                    throw new Error(`too much addresses ` + JSON.stringify(search));
                }
            }
            if (search.addr) {
                let value = search.value;
                if (value) {
                    result.push({ addr: search.addr, amount: value, txid: false, vin : search.n });
                }
            }
        }
        return result;
    }
}

module.exports.BtcTransformer = BtcTransformer

module.exports.init = function(currencyCode) {
    return new BtcTransformer(currencyCode)
}
