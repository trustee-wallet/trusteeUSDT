/**
 * Telegram messages functions
 * @author Ksu
 */
module.paths.push('/usr/lib/node_modules')

const request = require('request')
const sleep = require('sleep')

const settings = require('../../micro_configs/Settings')

const MAX_LENGTH = 4090

class Tg {
    constructor(PREFIX) {
        this.API_KEY = settings[PREFIX + '_TG_API_KEY']
        this.CHAT_IDS = settings[PREFIX + '_TG_CHAT_IDS']
        this.BAD_CHATS = {}
    }

    async send(text) {
        let promises = []
        if (text.length > MAX_LENGTH) text = text.substring(0, MAX_LENGTH)
        for (let i = 0, ic = this.CHAT_IDS.length; i < ic; i++) {
            let chat = this.CHAT_IDS[i]
            if (this.BAD_CHATS[chat]) continue
            promises.push(
                this._request('sendMessage', {
                    text: text,
                    chat_id: chat
                })
            )
        }
        let result
        try {
            result = Promise.all(promises)
        } catch (err) {
            if (err.code.toString() === '429') {
                console.error(text)
                return true
            } else if (err.description === 'Bad Gateway') {
                return false
            } else {
                throw err
            }
        }
        return result
    }

    /**
     * @param {string} method
     * @param {object} qs
     * @param {string} qs.text
     * @param {string} qs.chat_id
     * @return {Promise<*>}
     * @private
     */
    async _request(method, qs) {
        // noinspection JSUnusedGlobalSymbols
        let options = {
            url: `https://api.telegram.org/bot${this.API_KEY}/${method}`,
            qs: qs
        }
        let _this = this
        return new Promise(function(resolve, reject) {
            request(options, (error, response, body) => {
                if (error) {
                    reject(error)
                } else {
                    let data = JSON.parse(body)
                    if (!data.ok) {
                        data.text = qs.text
                        // noinspection JSUnresolvedVariable
                        if (data.error_code === '429') {
                            sleep.msleep(6000)
                        } else if (data.description === 'Forbidden: bot was blocked by the user') {
                            _this.BAD_CHATS[qs.chat_id] = 1
                            //console.log(`TgBot bad chat id ${qs.chat_id}`, data)
                            resolve('will add to bad_chats')
                        }
                        reject(data)
                    } else {
                        resolve(data)
                    }
                }
            })
        })
    }
}

module.exports.init = function(PREFIX) {
    if (!settings[PREFIX + '_TG_API_KEY']) {
        PREFIX = 'GENERAL'
    }
    return new Tg(PREFIX)
}
