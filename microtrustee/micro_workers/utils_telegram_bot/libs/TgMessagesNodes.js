/**
 * @author Ksu
 */
module.paths.push('/usr/lib/node_modules')

class TgMessagesNodes {
    init() {
        this.dispatcher = require('../../../micro_common/blockchains/Dispatcher').init()
        this.processors = {};
    }
    // noinspection JSMethodCanBeStatic
    async getBlockLastNumber (currencyCode) {
        if (!this.dispatcher) {
            this.init();
        }
        if (!this.processors[currencyCode]) {
            this.processors[currencyCode] = this.dispatcher.getBlocksProcessor(currencyCode)
        }
        return  this.processors[currencyCode].blockLastNumber()
    }
}

module.exports.init = function () {
    return new TgMessagesNodes()
}
