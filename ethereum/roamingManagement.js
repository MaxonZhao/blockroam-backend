const web3 = require('./web3')
const RoamingDataManagement = require('./build/RoamingDataManagement.json');

const instance = new web3.eth.Contract(
    RoamingDataManagement.abi,
    '0xC2A247Ac77Ce95acc4CcB09A5C109350b61Dc26C'
)

module.exports = instance;