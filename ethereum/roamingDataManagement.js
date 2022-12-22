const web3 = require('./web3')
const RoamingDataManagement = require('./build/RoamingDataManagement.json');

const instance = new web3.eth.Contract(
    RoamingDataManagement.abi,
    '0xC3Fa142F493733ad2676445195046E26cd21748e'
)

module.exports = instance;
