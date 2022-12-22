const web3 = require('./web3')
const RoamingDataManagement = require('./build/RoamingDataManagement.json');

const instance = new web3.eth.Contract(
    RoamingDataManagement.abi,
    '0x9F52248b4F7f70e2fEe455194dbb63ef83dDC35b'
)

module.exports = instance;
