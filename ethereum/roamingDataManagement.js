const web3 = require('./web3')
const RoamingDataManagement = require('./build/RoamingDataManagement.json');

const instance = new web3.eth.Contract(
    RoamingDataManagement.abi,
    '0x8D2d84E3cC34122596B8E988B28DD55c29e3a97e'
)

module.exports = instance;
