/**
 * @author Ksu
 */
module.paths.push('/usr/lib/node_modules')

class TgMessages {
    constructor(db) {
        this.db = db
    }

    async getLoaded(currencyCode) {
        let result = await this.db.query(`SELECT MAX(block_number) AS mx, MAX(block_time) AS mxtime FROM transactions_blocks_headers_${currencyCode}`, [])
        if (!result) {
            return 'NO LAST BLOCKS'
        }
        let blocks = result[0];
        blocks.mxtime = blocks.mxtime.toISOString().replace(/T/, ' ').replace(/\..+/, '');

        let result2 = await this.db.query(`
            SELECT 'progress' AS s, COUNT(*) AS cn FROM transactions_blocks_list_basics_USDT WHERE _scanned!=99999 UNION
            SELECT 'prev2' AS s, COUNT(*) AS cn FROM transactions_blocks_list_basics_USDT WHERE block_number=${blocks.mx - 2} UNION
            SELECT 'prev' AS s, COUNT(*) AS cn FROM transactions_blocks_list_basics_USDT WHERE block_number=${blocks.mx - 1} UNION
            SELECT 'current' AS s, COUNT(*) AS cn FROM transactions_blocks_list_basics_USDT WHERE block_number=${blocks.mx} UNION
            SELECT 'total' AS s, COUNT(*) AS cn FROM transactions_blocks_list_basics_USDT
             `)
        let counts = {};
        result2.map((row) => {
            counts[row.s] = row.cn;
        });

        let result3 = await this.db.query(`\
            SELECT 'prev2' AS s, COUNT(*) AS cn, SUM(amount) AS am FROM transactions_blocks_list_details_usdt WHERE block_number=${blocks.mx-2} UNION
            SELECT 'prev' AS s, COUNT(*) AS cn, SUM(amount) AS am FROM transactions_blocks_list_details_usdt WHERE block_number=${blocks.mx-1} UNION
            SELECT 'current' AS s, COUNT(*) AS cn, SUM(amount) AS am FROM transactions_blocks_list_details_usdt WHERE block_number=${blocks.mx}
        `)
        let counts3 = {};
        result3.map((row) => {
            counts3[row.s] = row;
        });

        let text = `
Transaction by ${blocks.mxtime} `;
        if (counts.progress > 0) {
            text += ` in progress ${counts.progress} / done`;
        }
        text += ` ${counts.total} 
        
https://omniexplorer.info/block/${blocks.mx} : ${counts.current} scanned ${counts3.current.cn} amount ${counts3.current.am}
        
https://omniexplorer.info/block/${blocks.mx-1} : ${counts.prev} scanned ${counts3.prev.cn} amount ${counts3.prev.am}

https://omniexplorer.info/block/${blocks.mx-2} : ${counts.prev2} scanned ${counts3.prev2.cn} amount ${counts3.prev2.am}`;

        return text;
    }

}

module.exports.init = function(db) {
    return new TgMessages(db)
}
