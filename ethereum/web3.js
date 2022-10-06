const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');

let web3;

if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    // we are in the browser and metamask is running
    window.ethereum.request({method: "eth_requestAccounts"});
    web3 = new Web3(window.ethereum);
} else {
    // we are on the server *OR* the user is not running metamask

    // const provider = new Web3.providers.HttpProvider(
    //     'https://rinkeby.infura.io/v3/49e05967bd0e417e867c1b9807c98896'
    // )
    // web3 = new Web3(provider);


    const account_pneumonic = 'evolve will spring truly journey grunt unable write lady screen artefact toast'
    const infuraEndpoint = 'https://sepolia.infura.io/v3/c960ad580fba4b86b81f04de041bf09b'

    const provider = new HDWalletProvider(
        account_pneumonic, infuraEndpoint
    );

    web3 = new Web3(provider);
}

module.exports = web3;