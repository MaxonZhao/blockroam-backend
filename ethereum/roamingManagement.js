const web3 = require('./web3');
const RoamingManagement = require('./build/RoamingManagement.json');

const instance = new web3.eth.Contract(
    JSON.parse(RoamingManagement.interface),
    "0x5D10BF19c2B74fE20AB7a701A2F15A79B80AF836"
)

module.exports = instance;