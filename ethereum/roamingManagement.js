const web3 = require('./web3');
const RoamingManagement = require('./build/RoamingManagement.json');

const instance = new web3.eth.Contract(
    JSON.parse(RoamingManagement.interface),
    "0x09e6AaC20a847408fEf66D8704cf1d674d4B6161"
)

module.exports = instance;