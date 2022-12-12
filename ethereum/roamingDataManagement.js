const web3 = require('./web3')
const RoamingDataManagement = require('./build/RoamingDataManagement.json');

const instance = new web3.eth.Contract(
    RoamingDataManagement.abi,
    '0xCdc0a010d0c11239e18935ba77fCcd6791E3003a'
)

module.exports = instance;
