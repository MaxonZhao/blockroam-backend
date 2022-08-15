const web3 = require('./web3')
const RoamingDataManagement = require('./build/RoamingDataManagement.json');

const instance = new web3.eth.Contract(
    RoamingDataManagement.abi,
    '0xd6fb08b9850c1645837CA150DbAf529E2B03216D'
)

module.exports = instance;
