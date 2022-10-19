const web3 = require('./web3')
const RoamingDataManagement = require('./build/RoamingDataManagement.json');

const instance = new web3.eth.Contract(
    RoamingDataManagement.abi,
    '0x5Fe645f543CE2fEBB729681aeFf54cAF9cb16d9D'
)

module.exports = instance;
