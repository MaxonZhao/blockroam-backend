const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');

const account_pneumonic = 'evolve will spring truly journey grunt unable write lady screen artefact toast'
const infuraEndpoint = 'https://sepolia.infura.io/v3/c960ad580fba4b86b81f04de041bf09b'

const provider = new HDWalletProvider(
    account_pneumonic, infuraEndpoint
);

const web3 = new Web3(provider);

let accounts

const getAccounts = () => {
    return new Promise(async (resolve, reject) => {
        const v = await web3.eth.getAccounts();
        resolve(v);
    })
}

// getAccounts()
// .then((v) => {
//     accounts = v;
// console.log(accounts);

// })



module.exports = getAccounts();


