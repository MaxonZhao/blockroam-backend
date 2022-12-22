const web3 = require('./web3')
const RoamingDataManagement = require('./build/RoamingDataManagement.json');

const instance = new web3.eth.Contract(
    RoamingDataManagement.abi,
    '0xf5e678Dc0a8f4cE5a824Ba47e7d7cCf553a2C707'
)

module.exports = instance;
