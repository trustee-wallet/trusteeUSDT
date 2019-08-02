/**
 * Wrapper for dispatching blockchain engines
 * @author Ksu
 */
module.paths.push('/usr/lib/node_modules')

class Dispatcher {
    /**
     * @param {string} currencyCode
     * @return {BtcRpc}
     */
    getBlocksProcessor(currencyCode) {
        let processor
        if (currencyCode === 'BTC') {
            processor = require('./btc/BtcRpc').init(currencyCode)
        } else if (currencyCode === 'USDT') {
            processor = require('./btc/UsdtRpc').init(currencyCode)
        } else {
            throw new Error(`Not supported ${currencyCode}`)
        }
        return processor
    }

    /**
     * @param {string} currencyCode
     * @return {BtcTransformer}
     */
    getTransformer(currencyCode) {
        let processor
        if (currencyCode === 'BTC') {
            processor = require('./btc/BtcTransformer').init(currencyCode)
        } else if (currencyCode === 'USDT') {
            processor = require('./btc/UsdtTransformer').init(currencyCode)
        } else {
            throw new Error(`Not supported ${currencyCode}`)
        }
        return processor
    }
}

module.exports.init = function() {
    return new Dispatcher()
}
