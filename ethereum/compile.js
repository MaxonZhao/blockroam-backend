const path = require('path');
const solc = require('solc');  // solidity compiler
const fs = require('fs-extra');

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

const roamingManagementPath = path.resolve(__dirname, 'contracts',  'RoamingDataManagement.sol')
const source = fs.readFileSync(roamingManagementPath, 'utf8');
// const output = solc.compile(source, 1).contracts;

// console.log(output);
// fs.ensureDirSync(buildPath); // this will check the 'build' folder exists and create the fold if not

// for (let contract in output) {
//     fs.outputJsonSync(
//         path.resolve(buildPath, contract.replace(':', '') + '.json'),
//         output[contract]
//     )
// }

var input = {
    language: 'Solidity',
    sources: {
        'RoamingDataManagement.sol' : {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': [ '*' ]
            }
        }
    }
}; 

const output = JSON.parse(solc.compile(JSON.stringify(input)));
console.log(output.contracts);

fs.ensureDirSync(buildPath);


for (let contractFileName in output.contracts) {
    const contractName = contractFileName.replace('.sol', '');
    console.log('Writing: ', contractName + '.json');
    fs.outputJsonSync(
        path.resolve(buildPath, contractName + '.json'),
        output.contracts[contractFileName][contractName]
    );
}


