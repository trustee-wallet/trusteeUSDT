module.paths.push('/usr/lib/node_modules')

const db = require('../../micro_common/common/db').init('PUBLIC', 'PG')
const fncs = require('../../micro_common/debug/fncs').init()

let _this_router = false

module.exports = {

    _addRouter (router) {
        _this_router = router
    },

    _addRoute(route, actionFunction) {
        if (!_this_router) throw new Error ('please set router')
        _this_router.get(route, async function(req, res) {
            try {
                let data = await actionFunction(req)
                res.send(data)
            } catch (err) {
                fncs.err(__filename.toString() + '/txs/:addr', err)
            }
        })
    },

    getTxByHash: async function(req, res) {
        try {
            console.log('SERVER GIVES RESPONSE!')
            let tx = req.params.tx
            let sql = 'SELECT * FROM transactions_blocks_list_details_USDT WHERE transaction_hash = $1'
            let result = await db.query(sql, [tx])
            res.send({
                status: 'success',
                data: {
                    transaction: result ? result : []
                }
            })
        } catch (err) {
            fncs.err(__filename.toString() + '/tx/:tx', err)
        }
    },

    getVoutByHash: async function(req, res) {
        try {
            console.log('SERVER GIVES RESPONSE!')
            let tx = req.params.tx
            let sql = 'SELECT * FROM transactions_blocks_list_outputs_USDT WHERE transaction_hash = $1'
            let result = await db.query(sql, [tx])
            res.send({
                status: 'success',
                data: {
                    transaction: result ? result : []
                }
            })
        } catch (err) {
            fncs.err(__filename.toString() + '/tx/:tx/vout', err)
        }
    },

    getBlockByHash: async function(req, res) {
        try {
            console.log('SERVER GIVES RESPONSE!')
            let block_hash = req.params.blockHash
            let sql = 'SELECT * FROM transactions_blocks_headers_USDT WHERE block_hash = $1'
            let result = await db.query(sql, [block_hash])
            res.send({
                status: 'success',
                data: {
                    block: result ? result : []
                }
            })
        } catch (err) {
            fncs.err(__filename.toString() + '/block/hash/:blockHash', err)
        }
    },

    getBlockByNumber: async function(req, res) {
        try {
            console.log('SERVER GIVES RESPONSE!')
            let block_number = req.params.blockNumber
            let sql = 'SELECT * FROM transactions_blocks_headers_USDT WHERE block_number = $1'
            let result = await db.query(sql, [+block_number])
            res.send({
                status: 'success',
                data: {
                    block: result ? result : []
                }
            })
        } catch (err) {
            fncs.err(__filename.toString() + '/block/number/:blockNumber', err)
        }
    },

    getVout: async function(req, res) {
        try {
            console.log('SERVER GIVES RESPONSE!')
            let sql = 'SELECT * FROM transactions_blocks_list_outputs_USDT'
            let result = await db.query(sql, '')
            res.send({
                status: 'success',
                data: {
                    transactions: result ? result : []
                }
            })
        } catch (err) {
            fncs.err(__filename.toString() + '/vout/tx', err)
        }
    }
}
