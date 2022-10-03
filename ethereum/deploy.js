const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')
const compiledRoamingManagement = require('./build/RoamingDataManagement.json')

const account_pneumonic = 'evolve will spring truly journey grunt unable write lady screen artefact toast'
const infuraEndpoint = 'https://rinkeby.infura.io/v3/c960ad580fba4b86b81f04de041bf09b'

const provider = new HDWalletProvider(
    account_pneumonic, infuraEndpoint
);

const web3 = new Web3(provider)

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    const deploymentManager = accounts[1];
    console.log('Attempting to deploy from account', deploymentManager);
    const result = await new web3.eth.Contract(compiledRoamingManagement.abi)
    .deploy({data: compiledRoamingManagement.evm.bytecode.object})
    .send({gas: '10000000', from: deploymentManager});

    console.log('Contract deployed to', result.options.address);
    provider.engine.stop();
}

deploy();