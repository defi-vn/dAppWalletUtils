const { supportWallet} = require('./utils/contants')
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

module.exports = {
    currentAddress,
    currentWalletType,
    supportedWalletsType,
    tokens,
    init,
    checkSupportedWalletsType
}