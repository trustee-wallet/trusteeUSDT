/**
 * Assert class extension for json object check in mocha tests
 * @author Ksu
 */
module.paths.push('/usr/lib/node_modules')

const assert = require('assert')

assert.jsonEqual = function(actual, expected, message) {
    return assert.strictEqual(
        JSON.stringify(actual, null, '\t'),
        JSON.stringify(expected, null, '\t'),
        message
    )
}

module.exports.assert = function() {
    return assert
}
