const axios = require('axios')
const BigNumber = require('bignumber.js')

const network = 'TESTNET'
// const network = 'MAINNET'

const supportToken = network === 'TESTNET' ? require('./tokens/supportTokenTest.json') : require('./tokens/supportToken.json')
const Web3 = require('web3');


const instance = axios.create({
    headers: {
        'Content-Type': 'application/json'
    },
    responseType: 'json',
    crossDomain: true,
    withCredentials: false
});

async function getTransactions(address, type, fromDate, toDate, limit, offset) {
    let endpoint =`https://api-testnet.bscscan.com/api?module=account&action=txlist&address=${address}`
    if(limit) endpoint += `&offset=${limit}`
    if(offset) endpoint += `&page=${offset}`
    const result = await axios.get(endpoint)
    return result.data.result.map(e => {
        const tokenSymbol = e.contractAddress === '' ? 'BNB' : supportToken[Web3.utils.toChecksumAddress(e.contractAddress)]
        return {
            hash: e.hash,
            amount: BigNumber(e.value).dividedBy(10 ** 18).toString(),
            type: address.toLowerCase() === e.from.toLowerCase() ? 'SEND' : 'RECEIVE',
            tokenSymbol: tokenSymbol,
            status: !parseInt(e.isError),
            from: e.from,
            to: e.to,
            time: e.timeStamp
        }
    }).reverse()
}

module.exports = {
    getTransactions
}