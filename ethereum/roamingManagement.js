const web3 = require('./web3');
const RoamingManagement = require('./build/RoamingManagement.json');

const instance = new web3.eth.Contract(
    JSON.parse(RoamingManagement.interface),
    "0x38b22BA7a796b7BA2F6f5137ad29eC85377529B9"
)

module.exports = instance;