/**
 * Saves transactions
 * @author Ksu
 */
module.paths.push('/usr/lib/node_modules')

class DbTransactionsOutputs {
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
     * @param {array[]} transactions
     * @return {Promise<boolean>}
     */
    async putNewTransactionsDetails(transactions) {
        if (!transactions || transactions.length === 0) {
            return true
        }
        return this.db.insertArray(
            `transactions_blocks_list_outputs_${this.currencyCode}`,
            `id, inner_block_id, block_number, transaction_hash, vout0, vout_to_value, vout_to_n, vout_to_asm, vout_to_hex, vout_to_req_sigs, vout_to_type, vout_to_addresses `,
            transactions,
            'ON CONFLICT DO NOTHING'
        )
    }
}

module.exports.init = function(db, currencyCode) {
    return new DbTransactionsOutputs(db, currencyCode)
}
