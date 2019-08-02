/**
 * Check tx scanning
 * @author Ksu
 * mocha ./microtrustee/micro_workers/watch_transactions_details/tests/WatchTransactionsSteps.test.js --opts ./.mocha.opts
 * docker exec -t microtrustee /bin/bash -c "mocha /usr/microtrustee/micro_workers/watch_transactions_details/tests/WatchTransactionsSteps.test.js --opts /usr/microtrustee/.docker.mocha.opts" --exit
 */
module.paths.push('/usr/lib/node_modules')

const db = require('../../../micro_common/common/db').init('TESTS')
const assert = require('../../../micro_common/debug/assert').assert()

const constants = require('../../../micro_configs/BlockchainNodes')

describe('Step 2 - Scan transaction hashes and save details', () => {
    it('USDT scan hash direct with minus', async (currencyCode = 'USDT') => {
        const steps = require('../libs/WatchTransactionsSteps').init(db, currencyCode)
        let row = await steps.processor.getTransaction('1483c44d5ea5dc4a1057a7ae68a5bba69bcb2c00874564ac25c62fb3f1094377')
        let transaction = await steps.transformer.unifyTransaction(row)
        assert.strictEqual(transaction.customValid, false)
    })
})
