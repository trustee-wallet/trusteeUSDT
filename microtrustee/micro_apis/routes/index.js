module.paths.push('/usr/lib/node_modules')

const express = require('express')
const router = express.Router()
const appController = require('../controllers/appController.js')
const txActions = require('../controllers/txActions.js')

router.get('/', function(req, res) {
    res.send('Welcome to OMNI APP')
})

// only this is working !!!
appController._addRouter(router)
appController._addRoute('/txs/:addr', txActions.getTxByAddressAction)

// not used in wallet actually
router.get('/tx/:tx', appController.getTxByHash)
router.get('/tx/:tx/vout', appController.getVoutByHash)
router.get('/block/hash/:blockHash', appController.getBlockByHash)
router.get('/block/number/:blockNumber', appController.getBlockByNumber)
router.get('/vout/tx', appController.getVout)

module.exports = router
