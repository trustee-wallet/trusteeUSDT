const db = require('../../micro_common/common/db').init('PUBLIC', 'PG')
const usdt = require('../../micro_common/blockchains/btc/UsdtRpc').init('USDT')

module.exports = {

    getTxByAddressAction: async function(req) {
        let lastBlock = await usdt.blockLastNumber()
        if (true || !lastBlock) {
            let sql1 = `SELECT MAX(block_number) AS mx FROM transactions_blocks_headers_usdt`
            let result1 = await db.query(sql1, [])
            if (result1) {
                lastBlock = result1[0].mx
            }
        }
        if (!lastBlock) {
            lastBlock = 580390
        }
        let addr = req.params.addr
        // @todo paging
        let sql = `SELECT block_number, transaction_block_hash, transaction_hash, transaction_txid, from_address, to_address, 
                amount, fee, custom_type, custom_valid, created_time, updated_time, removed_time, _removed
                FROM transactions_blocks_list_details_USDT WHERE from_address = $1 OR to_address = $1 LIMIT 100`
        let result = await db.query(sql, [addr])
        return {
            status: 'success',
            data: {
                transactions: result ? result : [],
                lastBlock
            }
        }
    }

}
