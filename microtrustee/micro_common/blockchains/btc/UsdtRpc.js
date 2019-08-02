/**
 * docs
 * https://github.com/OmniLayer/omnicore/blob/master/src/omnicore/doc/rpc-api.md
 */
module.paths.push('/usr/lib/node_modules')

const constants = require('../../../micro_configs/BlockchainNodes')

class UsdtRpc extends require('./BtcRpc').BtcRpc {

    constructor(currencyCode) {
        super(currencyCode)
        this.SAVE_BOTH_BTC_AND_USDT = constants.SAVE_BOTH_BTC_AND_USDT
    }

    /**
     * @param {string} hash
     * @return {Promise<BtcBlockchainBlock>}
     */
    async blockByHash(hash) {
        let block = await this._request('getblock', [hash], 'BTC')
        let usdt = await this._request('omni_listblocktransactions', [block.height])
        if (this.SAVE_BOTH_BTC_AND_USDT) {
            block.usdt = usdt
        } else {
            block.tx = usdt
        }
        return block
    }

    /**
     * @param {string} hash
     * @return {Promise<boolean|*>}
     */
    async getTransaction(hash) {
        if (!hash) throw new Error('hash is empty')
        try {
            let data = await this._request('omni_gettransaction', [hash])
            data.hash = hash
            return data
        } catch (e) {
            e.message += '\n omni_gettransaction hash:' + hash
            console.log(e)
            return false
        }
    }
}

module.exports.init = function(currencyCode) {
    return new UsdtRpc(currencyCode)
}
