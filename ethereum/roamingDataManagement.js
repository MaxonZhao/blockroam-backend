const web3 = require('./web3')
const RoamingDataManagement = require('./build/RoamingDataManagement.json');

const instance = new web3.eth.Contract(
    RoamingDataManagement.abi,
    '0xD0cBE1b4FfAe86F7331Be956813ef17a302F2Caf'
)

module.exports = instance;
