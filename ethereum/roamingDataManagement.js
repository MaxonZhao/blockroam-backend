import web3 from './web3'
import RoamingDataManagement from './build/RoamingDataManagement.json';

const instance = new web3.eth.Contract(
    JSON.parse(RoamingDataManagement.interface),
    '0xF115581306e66f2932aC3077BC8E16777b330a5E  ' // change this after the contract has been deployed
)