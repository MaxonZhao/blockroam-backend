const web3 = require('./web3')
const RoamingDataManagement = require('./build/RoamingDataManagement.json');

const instance = new web3.eth.Contract(
    RoamingDataManagement.abi,
    '0xC1FC148dc910E835D2D0b5bfa6eD94533045309A'
)

module.exports = instance;
