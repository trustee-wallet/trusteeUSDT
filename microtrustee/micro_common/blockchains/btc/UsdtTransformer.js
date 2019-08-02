/**
 * Library to unify blockchain data to general data
 * @author Ksu
 *
 * @typedef {Object} SimpleBlockchainTransaction
 * @property {string} transactionTxid
 * @property {string} transactionHash
 * @property {string} fromAddress
 * @property {string} toAddress
 * @property {string} amount
 * @property {string} fee
 * @property {string} blockNumber
 * @property {string} blockHash
 * @property {string} blockTime
 * @property {string} customType
 * @property {string} customValid
 */
module.paths.push('/usr/lib/node_modules')

class UsdtTransformer extends require('./BtcTransformer').BtcTransformer {
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {string} row.txid we save it as hash as in btc its indexed by txid - not hash
     * @param {string} row.hash
     * @param {string} row.fee '0.00013597'
     * @param {string} row.sendingaddress
     * @param {string} row.referenceaddress
     * @param {string} row.ismine false
     * @param {string} row.version 0
     * @param {string} row.type_int 0
     * @param {string} row.type 'Simple Send'
     * @param {string} row.propertyid 56
     * @param {string} row.divisible false
     * @param {string} row.amount '4'
     * @param {string} row.valid true
     * @param {string} row.blockhash
     * @param {string} row.blocktime 1460063264
     * @param {string} row.positioninblock 353
     * @param {string} row.block 406213
     * @param {string} row.confirmations 164104
     * @return {SimpleBlockchainTransaction|boolean}
     */
    unifyTransaction(row) {
        if (!row) {
            return false
        }
        try {
            // noinspection JSValidateTypes
            return {
                transactionTxid: row.txid,
                transactionHash: row.hash,
                fromAddress: row.sendingaddress,
                toAddress: row.referenceaddress,
                amount: row.amount > 0 ? row.amount : 0,
                fee: row.fee,
                blockNumber: row.block,
                blockHash: row.blockhash,
                blockTime : row.blocktime,
                customType: row.type.toString() === 'Simple Send' ? '' : row.type,
                customValid: row.valid && row.valid.toString() === 'true' && row.amount > 0
            }
        } catch (e) {
            e.message += ` txid: ${row.txid} hash: ${row.hash}`
            throw e
        }
    }
}

module.exports.init = function(currencyCode) {
    return new UsdtTransformer(currencyCode)
}
