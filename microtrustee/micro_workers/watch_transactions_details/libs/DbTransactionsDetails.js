/**
 * Saves transactions
 * @author Ksu
 */
module.paths.push('/usr/lib/node_modules')

class DbTransactionsDetails {
    /**
     * @param {PgProcessor} db
     * @param {string} currencyCode
     */
    constructor(db, currencyCode) {
        /** @private @member {PgProcessor} **/
        this.db = db

        /** @private @member {string} **/
        this.currencyCode = currencyCode
    }

    /**
     * @param {SimpleBlockchainTransaction[]} transactions
     * @return {Promise<boolean>}
     */
    async putNewTransactionsDetails(transactions) {
        if (!transactions || transactions.length === 0) {
            return true
        }
        let records = []
        for (const row of transactions) {
            let record = [
                row.todo.id,
                row.todo.innerBlockID,
                row.todo.blockNumber,
                row.blockNumber !==  row.todo.blockNumber ? row.blockNumber : 0,
                row.blockHash,
                'to_timestamp(' + row.blockTime + ')',
                row.transactionHash,
                row.transactionTxid,
                row.fromAddress ? row.fromAddress : 'NULL',
                row.toAddress ? row.toAddress : 'NULL',
                row.amount ? row.amount : 0,
                row.fee ? row.fee : 0,
                row.customType,
                row.customValid ? 1 : 0
            ]
            records.push(record)
        }
        return this.db.insertArray(
            `transactions_blocks_list_details_${this.currencyCode}`,
            `id, inner_block_id, block_number, transaction_block_number, transaction_block_hash, created_time, transaction_hash, transaction_txid, from_address, to_address, amount, fee, custom_type, custom_valid`,
            records
        )
    }
}

module.exports.init = function(db, currencyCode) {
    return new DbTransactionsDetails(db, currencyCode)
}
