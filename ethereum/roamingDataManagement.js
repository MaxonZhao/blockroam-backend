const web3 = require('./web3')
const RoamingDataManagement = require('./build/RoamingDataManagement.json');

const instance = new web3.eth.Contract(
    RoamingDataManagement.abi,
    '0xa9529Fc149E965840aE2AdF2Ddaf78056E8718Eb'
)

module.exports = instance;
