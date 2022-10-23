const { Axios } = require("axios");
const CryptoJS = require("crypto-js");
const fs = require('fs');
const readline = require('readline');

const API_URL = 'https://www.okx.com'

const TIMESTAMP = new Date().toISOString().split('.')[0] + "Z"

const SECRET_KEY = ''
const API_KEY = ''
const PASSPHRASE = ''

const axios = new Axios({
    headers: {
        'Content-Type': 'application/json',
        'OK-ACCESS-KEY': API_KEY,
        'OK-ACCESS-TIMESTAMP': TIMESTAMP,
        'OK-ACCESS-PASSPHRASE': PASSPHRASE
    }
})

async function* processLineByLine() {
    const rl = readline.createInterface({
        input: fs.createReadStream('./accounts.txt'),
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        yield line
    }

}

const generateSign = (apiEndpoint, method = 'GET', body) => {
    return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(TIMESTAMP + method + apiEndpoint + body, SECRET_KEY))
}

const main = async (address) => {
    try {
        const endpoint = '/api/v5/asset/withdrawal'
        const body = JSON.stringify({
            ccy: 'APT',
            amt: '0.05',
            dest: 4,
            toAddr: address,
            fee: '0.001',
            chain: 'APT-Aptos'
        })

        await axios.post(`${API_URL}${endpoint}`, body, {
            headers: {
                "OK-ACCESS-SIGN": generateSign(endpoint, 'POST', body)
            }
        })

    } catch (e) {
        console.log(e)
    }
}


(async () => {
    for await (const line of processLineByLine()) {
        await main(line)
        console.log(`DONE ${line}`)
    }
})()