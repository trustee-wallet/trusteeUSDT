/**
 * Check BTC Rpc
 * @author Ksu
 * mocha ./microtrustee/micro_workers/watch_transactions_blocks/tests/BtcRpc.test.js --opts ./.mocha.opts
 * docker exec -t microtrustee /bin/bash -c "mocha /usr/microtrustee/micro_workers/watch_transactions_blocks/tests/BtcRpc.test.js --opts /usr/microtrustee/.docker.mocha.opts" --exit
 */
module.paths.push('/usr/lib/node_modules')

const assert = require('../../../micro_common/debug/assert').assert()

describe('BTC RPC', () => {

    it('blockLastNumber BTC', async (currencyCode = 'BTC') => {
        const btc = require('../../../micro_common/blockchains/btc/BtcRpc').init(currencyCode)
        let block = await btc.blockLastNumber()
        assert.strictEqual(block >= 558547, true)
    })

    it('blockByIndex BTC', async (currencyCode = 'BTC') => {
        const btc = require('../../../micro_common/blockchains/btc/BtcRpc').init(currencyCode)
        let block = await btc.blockByIndex(99999)
        let expected = {
            hash: '000000000002d01c1fccc21636b607dfd930d31d01c3a62104612a1719011250',
            strippedsize: 215,
            size: 215,
            weight: 860,
            height: 99999,
            version: 1,
            versionHex: '00000001',
            merkleroot: '110ed92f558a1e3a94976ddea5c32f030670b5c58c3cc4d857ac14d7a1547a90',
            tx: ['110ed92f558a1e3a94976ddea5c32f030670b5c58c3cc4d857ac14d7a1547a90'],
            time: 1293623731,
            mediantime: 1293622434,
            nonce: 3892545714,
            bits: '1b04864c',
            difficulty: 14484.1623612254,
            chainwork: '000000000000000000000000000000000000000000000000064492eaf00f2520',
            previousblockhash: '0000000000002103637910d267190996687fb095880d432c6531a527c8ec53d1',
            nextblockhash: '000000000003ba27aa200b1cecaad478d2b00432346c3f1f3986da1afd33e506'
        }
        assert.strictEqual(block.confirmations >= 458549, true)
        delete block.confirmations
        assert.jsonEqual(block, expected)
    })
})
