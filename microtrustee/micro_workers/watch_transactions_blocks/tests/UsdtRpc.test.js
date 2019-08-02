/**
 * Check Usdt Rpc
 * @author Ksu
 * mocha ./microtrustee/micro_workers/watch_transactions_blocks/tests/UsdtRpc.test.js --opts ./.mocha.opts
 * docker exec -t microtrustee /bin/bash -c "mocha /usr/microtrustee/micro_workers/watch_transactions_blocks/tests/UsdtRpc.test.js --opts /usr/microtrustee/.docker.mocha.opts" --exit
 */
module.paths.push('/usr/lib/node_modules')

const assert = require('../../../micro_common/debug/assert').assert()

describe('Usdt RPC', () => {

    it('blockLastNumber USDT', async (currencyCode = 'USDT') => {
        const btc = require('../../../micro_common/blockchains/btc/UsdtRpc').init(currencyCode)
        let block = await btc.blockLastNumber()
        assert.strictEqual(block >= 558547, true)
    })

    it('blockByIndex USDT', async (currencyCode = 'USDT') => {
        const btc = require('../../../micro_common/blockchains/btc/UsdtRpc').init(currencyCode)
        btc.SAVE_BOTH_BTC_AND_USDT = true
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
            tx:
                ['110ed92f558a1e3a94976ddea5c32f030670b5c58c3cc4d857ac14d7a1547a90'],
            time: 1293623731,
            mediantime: 1293622434,
            nonce: 3892545714,
            bits: '1b04864c',
            difficulty: 14484.1623612254,
            chainwork: '000000000000000000000000000000000000000000000000064492eaf00f2520',
            previousblockhash: '0000000000002103637910d267190996687fb095880d432c6531a527c8ec53d1',
            nextblockhash: '000000000003ba27aa200b1cecaad478d2b00432346c3f1f3986da1afd33e506',
            usdt: []
        }
        assert.strictEqual(block.confirmations >= 458549, true)
        delete block.confirmations
        assert.jsonEqual(block, expected)
    })

    it('blockByIndex USDT with TX', async (currencyCode = 'USDT') => {
        const btc = require('../../../micro_common/blockchains/btc/UsdtRpc').init(currencyCode)
        btc.SAVE_BOTH_BTC_AND_USDT = true
        let block = await btc.blockByIndex(558549)
        delete block.confirmations
        delete block.tx
        let expected = {
            hash: '0000000000000000002d1ecdd62140decdcfaf0302c6ede4015f55981ea5060d',
            strippedsize: 302373,
            size: 398099,
            weight: 1305218,
            height: 558549,
            version: 536870912,
            versionHex: '20000000',
            merkleroot: '536716c09909e25e13f64c94dc890030c46c41fdca191af95ab48833d4512be2',
            time: 1547497768,
            mediantime: 1547496160,
            nonce: 3555745809,
            bits: '172fd633',
            difficulty: 5883988430955.408,
            chainwork: '000000000000000000000000000000000000000004b8c184484b1afc14050b0e',
            previousblockhash: '00000000000000000007c760e071ebea0581d0aec303aacb313b324124171bfd',
            nextblockhash: '0000000000000000000d9f80f369e3a749702145b60643fc41e5865666013d51',
            usdt:
                ['9bead1cdaf46bf28b1ed233a51426af9c0aa16d7e4847f0244d676e540d30137',
                    'a1f88e7dd9b43b1117df7632464b4c389d7308b10cc2e3a26aeef860e2a88692',
                    '670b3ae3638c4c82b85f3fd33252e0ec8cabd1756af74a6d2afd865945c88364',
                    '9039f1adc933989c62077d5a5d283bbcd7b79089b28f6bc65dcc00c81c1a236e',
                    '61934226c1f0aa0d8be12a1e77048c26ce241b05c3e749e9b3032cdb31c95d7c',
                    'a44ae6830226c3aa1f43bd4beac5e280aa729fc5e9d2396d020f805c05ecfb55',
                    'b8d7138d3aa67aafb9716ffe8842c6d308f355a95871209d0d42b115894091ce',
                    'f4d250904ef32318282c874ec1879f24562a69470a5339a09ee08883dfc545c1',
                    'e4f23dd7110aff02513e5cef218c01a4c7c302ed940a08a5ecc36403d6f40668',
                    'cf3cb0815655aaa93e94e8c0705651d8be909a1fe8d0d126f8357db964da5b48',
                    'c622378e311f4020c8fc871b01f71beeb6d8a02036b20e9de98b1d6dd4f95943',
                    '9ad5bd175825ccb674dcdfeedebb0d0508c03317591580338ffaf6ebe8fad21f',
                    '0bec1237a70fdf583ddfd0b87e032a5a298e7a9f251159a8afe75a345f110951',
                    '3331b3f6831b9518262e00db1a8d3bc23685d77ad63eddfebf428ac1a77a53e7',
                    'a7d3158997fa24a57b1976f6e9057e66727cf32e5b2d6c3c12689b4d774dcc03',
                    '2c25b1a42db6482332e4485e48beac52bf6f9b559e258975e95fbd74ecb6cce9',
                    'e0c5a83b578258ebe54f9140bdf887820e55e4cd2dae953afa7da957d7739751',
                    '0ea3cc20bc9a3545fab303711ce89556afff574b4539c30ada29ebb19c54e941',
                    '2d2de0bde4ef4f8964d39e283e895a92a193359317aadf7ee9f37371f7ce2ec6',
                    '5a82c833cdd26ab11a665b51903a0f358104f191f5e5b5dd5cd52a1c4a092649',
                    '120405f72702606f10a6d8c985858d4fec5c1e2a07ca5fbb7400f92838ca1c1a',
                    'e511c1cc809f5a15582c122929da38427c45b8b911696330d9b8aa163ededaa2',
                    '8aa4c141485a1b97234da73acbd7d82d40fdd9c4ba7e8e54dae3e8b79eec4920',
                    '26bd1a96d41dfa99004dcf35ac01f429457ce1cb77cfe9d7c662ae22216242b4',
                    '8400edfae4457e62c258bc0d21ed8b79c03ff6f617ae1abe169d226e7aa9ecb8',
                    'ffa80c1cd584131606743a774cd882dd59214cf5dba6a90a9ba2b1a0a822cd0b',
                    '751974e66c5629995e8366cc3db9880fc39c21184f6dfec8395761282dc81af6',
                    'fadd1bb5b819a09563bad3c6b40cb41855fcbc2113fd4f9a6f462b2c2005a30f',
                    '7efd31c6d9273c822421cfcef6f7021fec745e3c0ff39981cf5f4d3e521bd18d',
                    'b3dc81855890eb293087f87acd88800c48389d57f97648384a141a12b755f213',
                    '2a9b45d55557b0fd2f31b1350885f5ce572b483ef76c62da671dbbd22f76e5b6']
        }
        assert.jsonEqual(block, expected)
    })
})
