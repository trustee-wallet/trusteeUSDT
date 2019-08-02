/**
 * @author Ksu
 * with tests db
 * docker exec -t microtrustee /bin/bash -c "mocha /usr/microtrustee/micro_apis/controllers/txActions.test.js --opts /usr/microtrustee/.docker.mocha.opts"
 *
 * with real db
 * docker exec -t microtrustee /bin/bash -c "mocha /usr/microtrustee/micro_apis/controllers/txActions.test.js --opts /usr/microtrustee/.docker.mocha.real.care"
 *
 * https://{SERVER}/txs/1GYmxyavRvjCMsmfDR2uZLMsCPoFNYw9zM
 */
const txActions = require('./txActions.js')

const assert = require('../../micro_common/debug/assert').assert()

describe('txActions', () => {
    it('txActions.getTxByAddressAction', async () => {
        let data = await txActions.getTxByAddressAction({ params: { addr: '1GYmxyavRvjCMsmfDR2uZLMsCPoFNYw9zM' } })
        console.log(data)
    })
})
