module.paths.push('/usr/lib/node_modules');

const axios = require('axios');

let address = '3EDmMTEMdKKt5ujRTi6LdoaTQRhCBNiBiJ';

async function doRequest(addr) {
    try {        
        console.log("Address : " + addr)
        let url = 'http://10.185.89.1:3003/txs/' + addr;
        let res = await axios.get(url);
        console.log(res.data);
    } catch(err) {
        console.log(err);
    }
}

doRequest(address);

