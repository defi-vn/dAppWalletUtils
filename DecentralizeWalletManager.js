const {supportWallet} = require('./utils/contants');
const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const {generateMnemonic} = require('bip39');
const BigNumber = require('bignumber.js')
const erc20Abi = require('./contracts/erc20.abi.json')

const network = 'TESTNET'
// const network = 'MAINNET'

const supportSymbol = network === 'TESTNET' ? require('./tokens/supportSymbolTest') : require('./tokens/supportSymbol')

let currentAddress = '';
let supportedWalletsType = Object.values(supportWallet);

let keystore = null;
let isConnected = false;
let currentWalletType = null;
let tokens = []

function checkSupportedWalletsType() {
    let result = [supportWallet.dfyWallet]
    if (!!(window.ethereum && window.ethereum.isMetaMask)) result.push(supportWallet.metamask)
    if (!!window.BinanceChain) result.push(supportWallet.binanceChain)
    if (!!(window.ethereum && window.ethereum.isTrust)) result.push(supportWallet.trustWallet)
    return result
}

let web3 = null

async function connectWallet(walletType, timeout) {
    // TODO Env check
    if (walletType === supportWallet.metamask || walletType === supportWallet.trustWallet) {
        await window.ethereum.enable()
        web3 = new Web3(window.ethereum)
        if (walletType === supportWallet.metamask) {
            currentWalletType = supportWallet.metamask
        } else {
            currentWalletType = supportWallet.trustWallet
        }
    } else if (walletType === supportWallet.binanceChain) {
        await window.BinanceChain.enable()
        web3 = new Web3(window.BinanceChain)
        currentWalletType = supportWallet.binanceChain
    }
    const accounts = await web3.eth.getAccounts()
    console.log('accounts: ', accounts)
    currentAddress = accounts[0]
    await getBalances()
}

function generateKeystore(provider, password) {
    web3 = new Web3(provider)
    currentAddress = Object.keys(provider.wallets)[0]
    currentWalletType = supportWallet.dfyWallet
    const wallet = provider.wallets[currentAddress]

    keystore = web3.eth.accounts.encrypt(wallet.getPrivateKeyString(), password)
    getBalances()
}

function importPrivateKey(privateKey, password) {
    const provider = new HDWalletProvider({
        privateKeys: [
            privateKey
        ],
        providerOrUrl: "https://data-seed-prebsc-1-s1.binance.org:8545"
    })

    generateKeystore(provider, password)

}

function importSeedPhrase(seedPhrase, password) {
    const provider = new HDWalletProvider({
        mnemonic: {
            phrase: seedPhrase
        },
        providerOrUrl: "https://data-seed-prebsc-1-s1.binance.org:8545"
    })

    generateKeystore(provider, password)
}

function importKeyStore(fileContent) {
    currentAddress = '0x' + fileContent.address
    keystore = fileContent
    web3 = new Web3("https://data-seed-prebsc-1-s1.binance.org:8545")
    getBalances()
    currentWalletType = supportWallet.dfyWallet
}

function createWallet(password) {
    const mnemonic = generateMnemonic()
    const provider = new HDWalletProvider({
        mnemonic: {
            phrase: mnemonic
        },
        providerOrUrl: "https://data-seed-prebsc-1-s1.binance.org:8545"
    });
    const address = Object.keys(provider.wallets)[0]
    const wallet = provider.wallets[address]

    const web3 = new Web3(provider)

    const keystore = web3.eth.accounts.encrypt(wallet.getPrivateKeyString(), password)

    return {
        mnemonic: mnemonic,
        privateKey: wallet.getPrivateKeyString(),
        address: address,
        keystore: keystore
    }
}

function exportPrivateKey(password) {
    const account = web3.eth.accounts.decrypt(keystore, password)
    return account.getPrivateKeyString()
}

async function calculateEstimatedGas(to, amount, tokenSymbol) {
    const gasPrice = await web3.eth.getGasPrice()
    let gasLimit = 0
    if (tokenSymbol === 'BNB') {
        gasLimit = await web3.eth.estimateGas({
            from: currentAddress,
            to: to,
            value: new BigNumber(
                amount
            ).multipliedBy(10 ** 18).toString()
        })
    } else {
        const tokenContract = new web3.eth.Contract(
            erc20Abi,
            supportSymbol[tokenSymbol]
        )
        const txData = tokenContract.methods.transfer(
            to,
            new BigNumber(
                amount
            ).multipliedBy(10 ** 18).integerValue()
        )
        gasLimit = await web3.eth.estimateGas({
            from: currentAddress,
            to: supportSymbol[tokenSymbol],
            value: '0',
            data: txData.encodeABI()
        })
    }

    return {
        gasPrice: new BigNumber(gasPrice).dividedBy(10 ** 9).toString(),
        gasLimit: gasLimit
    }
}

async function send(password, to, amount, tokenSymbol, gasPrice, gasLimit, callback) {
    let receipt = null
    if (tokenSymbol === 'BNB') {
        const tx = {
            from: currentAddress,
            to: to,
            value: new BigNumber(
                amount
            ).multipliedBy(10 ** 18).toString(),
            gas: gasLimit,
            gasPrice: new BigNumber(
                gasPrice
            ).multipliedBy(10 ** 9).toString()
        }
        if (currentWalletType === supportWallet.dfyWallet) {
            const account = web3.eth.accounts.decrypt(keystore, password)
            const signed = await account.signTransaction(tx)
            receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction)
        } else {
            receipt = await web3.eth.sendTransaction(tx)
        }
    } else {
        const tokenContract = new web3.eth.Contract(
            erc20Abi,
            supportSymbol[tokenSymbol]
        )
        const txData = tokenContract.methods.transfer(
            to,
            new BigNumber(
                amount
            ).multipliedBy(10 ** 18).integerValue()
        );
        const tx = {
            from: currentAddress,
            to: supportSymbol[tokenSymbol],
            value: 0,
            gas: gasLimit,
            gasPrice: new BigNumber(
                gasPrice
            ).multipliedBy(10 ** 9).toString(),
            data: txData.encodeABI()
        };
        if (currentWalletType === supportWallet.dfyWallet) {
            const account = web3.eth.accounts.decrypt(keystore, password)
            const signed = await account.signTransaction(tx)
            receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction)
        } else {
            receipt = await web3.eth.sendTransaction(tx)
        }
    }

    getBalances()
    return receipt
}

function logout() {
    keystore = null;
    isConnected = true;
    currentWalletType = null;
    tokens = []
}

async function getBalances() {
    tokens = await Promise.all(Object.keys(supportSymbol).map(async (symbol) => {
        if (symbol === 'BNB') {
            const userBalance = await web3.eth.getBalance(currentAddress)
            return {
                symbol: symbol,
                balance: userBalance
            }
        } else {
            const address = supportSymbol[symbol]
            const tokenContract = new web3.eth.Contract(
                erc20Abi,
                address
            )
            const userBalance = await tokenContract.methods
                .balanceOf(currentAddress)
                .call()

            return {
                symbol: symbol,
                balance: userBalance
            }
        }
    }))
}

module.exports = {
    currentAddress: function () {
        return currentAddress
    },
    currentWalletType: function () {
        return currentWalletType
    },
    supportedWalletsType: function () {
        return supportedWalletsType
    },
    tokens: function () {
        return tokens
    },
    isConnected: function () {
        return isConnected
    },
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