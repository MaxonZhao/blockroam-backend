const web3 = require('./web3.cjs')
const RoamingDataManagement = require('./build/RoamingDataManagement.json');

const instance = new web3.eth.Contract(
    RoamingDataManagement.abi,
    '0x538b9f1473E45e04C3e460DE52C8cEdC11000431'
)

module.exports = instance;
