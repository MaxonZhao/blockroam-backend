const web3 = require('./web3');
const RoamingManagement = require('./build/RoamingManagement.json');

const instance = new web3.eth.Contract(
    JSON.parse(RoamingManagement.interface),
    "0xC2A247Ac77Ce95acc4CcB09A5C109350b61Dc26C"
)

module.exports = instance;