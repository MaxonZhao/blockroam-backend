const web3 = require('./web3')
const RoamingDataManagement = require('./build/RoamingDataManagement.json');

const instance = new web3.eth.Contract(
    RoamingDataManagement.abi,
    '0x81202A28201596cdc3B68A9dF153246B4879f9b8'
)

module.exports = instance;
