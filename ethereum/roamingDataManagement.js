const web3 = require('./web3')
const RoamingDataManagement = require('./build/RoamingDataManagement.json');

const instance = new web3.eth.Contract(
    RoamingDataManagement.abi,
    '0x73d3fD7285813A36C1dAb7f7620a09eb09C3eFd0'
)

module.exports = instance;
