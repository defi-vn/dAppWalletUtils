const { supportWallet} = require('./utils/contants');

let isConnected = true;
let currentAddress = '0x1eCE3c290B1B6b388bffe0002eAb1dF51356a9Df'
let currentWalletType = supportWallet.metamask
let supportedWalletsType = Object.keys(supportWallet)
let tokens = [
    {
        symbol: 'BNB',
        address: '',
        amount: 0
    }
]

async function init() {

}

function checkSupportedWalletsType() {
    return []
}

async function connectWallet(walletType, timeout) {

}

async function importPrivateKey(privateKey, password) {

}

async function importSeedPhrase(privateKey, password) {

}

async function importKeyStore(fileContent) {

}

async function createWallet(password) {

}

function exportPrivateKey(password) {

}

function calculateEstimatedGas(to, amount, tokenSymbol) {

}

async function send (password, to, amount, tokenSymbol, gasPrice, gasLimit, callback) {

}

function logout() {

}

async function getBalances() {

}

module.exports = {
    currentAddress,
    currentWalletType,
    supportedWalletsType,
    tokens,
    init,
    checkSupportedWalletsType,
    connectWallet,
    importPrivateKey,
    importSeedPhrase,
    importKeyStore,
    createWallet,
    exportPrivateKey,
    calculateEstimatedGas,
    send,
    logout
}