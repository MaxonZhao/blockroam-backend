const web3 = require('./web3')
const RoamingDataManagement = require('./build/RoamingDataManagement.json');

const instance = new web3.eth.Contract(
    RoamingDataManagement.abi,
    '0x0C00e9aF947CD7eBd9dce46dbe057be010b20bA0'
)

module.exports = instance;
