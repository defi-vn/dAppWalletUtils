const { supportWallet} = require('./utils/contants');
const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');


let isConnected = true;
let currentAddress = '0x1eCE3c290B1B6b388bffe0002eAb1dF51356a9Df'
let currentWalletType = supportWallet.metamask
let supportedWalletsType = Object.values(supportWallet)
let keystore = null

let tokens = [
    {
        symbol: 'BNB',
        address: '',
        amount: 0
    }
]

async function init() {

}

const network = 'TESTNET'
// const network = 'MAINNET'

function checkSupportedWalletsType() {
    let result = [supportWallet.dfyWallet]
    if(!!(window.ethereum && window.ethereum.isMetaMask)) result.push(supportWallet.metamask)
    if(!!window.BinanceChain) result.push(supportWallet.binanceChain)
    if(!!(window.ethereum && window.ethereum.isTrust)) result.push(supportWallet.trustWallet)
    return result
}

let web3 = null
async function connectWallet(walletType, timeout) {
    // TODO Env check
    if(walletType === supportWallet.metamask || walletType === supportWallet.trustWallet) {
        await window.ethereum.enable()
        web3 = new Web3(window.ethereum)
        if(walletType === supportWallet.metamask) {
            currentWalletType = supportWallet.metamask
        } else {
            currentWalletType = supportWallet.trustWallet
        }
    } else if (walletType === supportWallet.binanceChain) {
        await window.BinanceChain.enable()
        web3 = new Web3(window.BinanceChain)
        currentWalletType = supportWallet.binanceChain
    }
    
}

function generateKeystore(provider, password) {
    web3 = new Web3(provider)
    currentAddress = Object.keys(provider.wallets)[0]
    currentWalletType = supportWallet.dfyWallet
    const wallet = provider.wallets[currentAddress]

    keystore = web3.eth.accounts.encrypt(wallet.getPrivateKeyString(), password)
}

async function importPrivateKey(privateKey, password) {
    const provider = new HDWalletProvider({
        privateKeys: [
            privateKey
        ],
        providerOrUrl: "https://data-seed-prebsc-1-s1.binance.org:8545"
    })

    generateKeystore(provider, password)

}

async function importSeedPhrase(seedPhrase, password) {
    const provider = new HDWalletProvider({
        mnemonic: {
            phrase: seedPhrase
        },
        providerOrUrl: "https://data-seed-prebsc-1-s1.binance.org:8545"
    })

    generateKeystore(provider, password)
}

async function importKeyStore(fileContent) {
    currentAddress = '0x' + fileContent.address
    keystore = fileContent
    web3 = new Web3("https://data-seed-prebsc-1-s1.binance.org:8545")

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