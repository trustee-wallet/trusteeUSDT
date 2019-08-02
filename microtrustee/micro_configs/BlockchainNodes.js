module.paths.push('/usr/lib/node_modules')

module.exports = {
    node: {
        BTC: 'PUT_YOUR_URL_HERE',
        USDT: 'PUT_YOUR_URL_HERE',
        BTC1: 'PUT_YOUR_SECONDARY_URL_HERE',
        USDT1: 'PUT_YOUR_SECONDARY_URL_HERE',
        ETH: 'PUT_YOUR_URL_HERE',
        ETH_ROPSTEN: 'PUT_YOUR_URL_HERE'
    },
    startBlock: {
        BTC: 0,
        USDT: 0,
        ETH: 7000000,
        ETH_ROPSTEN: 4800000
    },
    // for watch_transactions_fast_blocks - dont recheck blocks to this number
    noDeepBlock: {
        BTC: 570400,
        USDT: 570400,
        ETH: 7000000,
        ETH_ROPSTEN: 4800000
    },
    // if on - btc transactions will be saved at usdt scanning
    SAVE_BOTH_BTC_AND_USDT: false
}
