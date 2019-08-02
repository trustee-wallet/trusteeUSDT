/**
 * Library to include all btc jsonrpc methods we need
 * @author Ksu
 * https://en.bitcoin.it/wiki/Original_Bitcoin_client/API_calls_list
 * https://github.com/request/request
 *
 * @typedef {Object} BtcBlockchainBlock
 * @property {string} hash: '000000000002d01c121636b607dfd930d31d01c3a62104612a1719011250'
 * @property {string} confirmations: 458549
 * @property {string} strippedsize: 215
 * @property {string} size: 215
 * @property {string} weight: 860
 * @property {string} height: 99999
 * @property {string} version: 1
 * @property {string} versionHex: '00000001'
 * @property {string} merkleroot: '110ed92f558a1e3a9497c32f030670b5c58c3cc4d857ac14d7a1547a90'
 * @property {string[]} tx
 * @property {string[]} usdt
 * @property {string} time: 1293623731
 * @property {string} mediantime: 1293622434
 * @property {string} nonce: 3892545714
 * @property {string} bits: '1b04864c'
 * @property {string} difficulty: 14484.1623612254
 * @property {string} chainwork: '000000000000000000000000000000000000000000000000064492eaf00f2520'
 * @property {string} previousblockhash: '0000000000002103637910d267190996687fb095880d432c6531a527c8ec53d1'
 * @property {string} nextblockhash: '000000000003ba27aa200b1478d2b00432346c3f1f3986da1afd33e506'
 */
module.paths.push('/usr/lib/node_modules')

const constants = require('../../../micro_configs/BlockchainNodes')

const request = require('request')

class BtcRpc {
    constructor(currencyCode) {
        /** @private @member {string} **/
        this.currencyCode = currencyCode

        /** @private @member {string} **/
        this.node = constants.node[currencyCode]
        if (!this.node) {
            throw new Error(`node ${currencyCode} is empty`)
        }

        /** @private @member {string} **/
        this.btcNode = constants.node['BTC']

        /** @private @member {number} for using secondary nodes if first one in settings are not responding **/
        this.nodeIndex = 0

        /** @private @member {number} **/
        this.nodeIndexCycle = 0

        /** @public @member {number} **/
        this.startBlock = constants.startBlock[currencyCode]

        /** @public @member {number} **/
        this.noDeepBlock = constants.noDeepBlock[currencyCode]
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @return {Promise<number>}
     */
    async blockLastNumber() {
        return this._request('getblockcount', [])
    }

    /**
     * @param {number} index
     * @return {Promise<BtcBlockchainBlock>}
     */
    async blockByIndex(index) {
        if (!index) {
            index = this.startBlock
        }
        // hashes are the same for btc and omni!
        // noinspection PointlessArithmeticExpressionJS
        let hash = await this._request('getblockhash', [index * 1], 'BTC')
        return this.blockByHash(hash)
    }

    /**
     * @param {string} hash
     * @return {Promise<BtcBlockchainBlock>}
     */
    async blockByHash(hash) {
        return this._request('getblock', [hash])
    }

    /**
     * @param {string} hash
     * @return {Promise<boolean|*>}
     */
    async getTransaction(hash) {
        if (!hash) throw new Error('hash is empty')
        try {
            let data = await this._request('getrawtransaction', [hash, 1])
            data.hex = ''
            return data
        } catch (e) {
            e.message += '\n getrawtransaction hash:' + hash
            console.log(e)
            return false
        }
    }

    /** ****************************************** transport methods ********************************************/
    /**
     * @param {string} method
     * @param {*} params
     * @param {string | boolean} node
     * @return {Promise<*>}
     */
    async _request(method, params, node = false) {
        // noinspection JSUnusedGlobalSymbols
        let payload = { jsonrpc: '1.0', method: method, id: 1, params }
        let _this = this
        return new Promise(function(resolve, reject) {
            return _this._requestPromise(node, payload, resolve, reject)
        })
    }

    /**
     * @param {string} node
     * @param {object} payload
     * @param {function} resolve
     * @param {function} reject
     * @private
     */
    _requestPromise(node, payload, resolve, reject) {
        let _this = this
        let options = {
            url: node || this.node,
            method: 'POST',
            headers: {
                'content-type': 'text/plain'
            },
            body: JSON.stringify(payload),
            encoding: null
        }
        if (node === 'BTC') {
            // for usdt some calls are done to btc node, some - to usdt
            options.url = this.btcNode
        }
        request(options, (error, response, body) => {
            let rejectWithCheck = function(e) {
                if(!e.code) {
                    e = {code : 'BTC_NODE_ERROR', message : 'ERROR ' + JSON.stringify(e, null, '\t')}
                } else if(!e.message) {
                    e.message = ''
                }
                e.message += ' URL: ' + options.url
                e.message += ' payload: ' + JSON.stringify(payload, null, '\t')
                try {
                    if (e.toString().indexOf('Error: 403 Forbidden') === 0) {
                        _this._getNextNode()
                        _this._requestPromise(node, payload, resolve, reject)
                    } else {
                        reject(e)
                    }
                } catch (newE) {
                    reject(newE)
                }
            }
            if (error) {
                rejectWithCheck(error)
            } else {
                const str = body.toString()
                if (!str) {
                    error = response;
                    error.code = response.statusCode
                    rejectWithCheck(error)
                } else if (str === 'Work queue depth exceeded') {
                    error = response;
                    error.code = response.statusCode
                    error.message = str
                    rejectWithCheck(
                        new Error(error)
                    )
                } else {
                    let data = {}
                    try {
                        data = JSON.parse(str)
                    } catch (e) {
                        e.message += ' body:' + str
                        rejectWithCheck(e)
                    }
                    if (data.error) {
                        rejectWithCheck(data.error)
                    }
                    resolve(data.result ? data.result : data)
                }
            }
        })
    }

    /**
     * @private
     */
    _getNextNode() {
        this.nodeIndex++
        if (constants.node[this.currencyCode + this.nodeIndex]) {
            this.btcNode = constants.node['BTC' + this.nodeIndex]
            this.node = constants.node[this.currencyCode + this.nodeIndex]
        } else {
            this.nodeIndex = 0
            this.nodeIndexCycle++
            if (this.nodeIndexCycle > 2) {
                throw new Error('BTC nodes are cycling with errors')
            }
            this.btcNode = constants.node['BTC']
            this.node = constants.node[this.currencyCode]
        }
    }
}

module.exports.BtcRpc = BtcRpc

module.exports.init = function(currencyCode) {
    return new BtcRpc(currencyCode)
}
