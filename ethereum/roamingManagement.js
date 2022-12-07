const web3 = require('./web3')
const RoamingDataManagement = require('./build/RoamingDataManagement.json');

const instance = new web3.eth.Contract(
    RoamingDataManagement.abi,
    "0x4afA0787cE9655f1Ce3057B2B1fD5FE4aF76c589"
)

module.exports = instance;
