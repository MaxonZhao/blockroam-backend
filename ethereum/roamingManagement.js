const web3 = require('./web3')
const RoamingDataManagement = require('./build/RoamingDataManagement.json');

const instance = new web3.eth.Contract(
    RoamingDataManagement.abi,
    "0x1b056A11D9aF49B78daE514dAac3B0cf7054Fc7b"
)

module.exports = instance;
