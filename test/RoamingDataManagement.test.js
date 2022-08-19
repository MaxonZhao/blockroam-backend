const async = require('async');
const assert = require('assert')
const ganache = require('ganache-cli');
const Web3 = require('web3')
const web3 = new Web3(ganache.provider());

const mongoose = require('mongoose');
const keys = require('../config/keys');
const mongoDB = keys.mongoURI;

mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

require('../models/serviceusage');
require('../models/user');
var ServiceUsage = mongoose.model('service-usage');
var User = mongoose.model('user')


const compiledRoamingDataManagementContract = require('../ethereum/build/RoamingDataManagement.json')

let accounts
let roamingDataManagement
const contractAddress = '0xC1FC148dc910E835D2D0b5bfa6eD94533045309A'

const serviceProviders = ["Rogers", "Fido", "T-Mobile", "Cricket", "Bell", "AT&T"];




beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    rogers = accounts[0];

    roamingDataManagement = await new web3.eth.Contract(compiledRoamingDataManagementContract.abi)
        .deploy({ data: compiledRoamingDataManagementContract.evm.bytecode.object })
        .send({ from: accounts[0], gas: '5000000' })

});

describe('Roaming Data Management System', () => {
    // describe('Initialization checks', () => {
    //     it('deploys a roaming data management contract', async () => {
    //         assert.ok(roamingDataManagement.options.address);
    //     });
    //     it('builds the operators mapping table', async () => {
    //         const serviceProviderAddresses = accounts.slice(0, 6);
    //         serviceProviderAddresses.map(async (operatorAddr, i) => {
    //             await roamingDataManagement.methods
    //                 .registerRoamingOperator(operatorAddr, serviceProviders[i])
    //                 .send({
    //                     from: serviceProviderAddresses[i],
    //                     gas: '1000000'
    //                 }, (err, res) => {
    //                     if (err) {
    //                         console.log('***************ERROR********************\n\n\n')
    //                         console.log(err);
    //                         console.log('***************ERROR********************\n\n\n')
    //                     }
    //                 });

    //             let spn = await roamingDataManagement.methods
    //                 .serviceProviders(i)
    //                 .call();

    //             if (i == serviceProviderAddresses.length - 1) console.log();

    //             let spa = await roamingDataManagement.methods
    //                 .operatorAddresses(i)
    //                 .call()

    //             if (i == serviceProviderAddresses.length - 1) console.log();

    //             let spn_map = await roamingDataManagement.methods
    //                 .operatorsAddrToName(serviceProviderAddresses[i])
    //                 .call()

    //             assert.equal(spn, spn_map);

    //             if (i == serviceProviderAddresses.length - 1) console.log();

    //             let spa_map = await roamingDataManagement.methods
    //                 .operatorsNameToAddr(serviceProviders[i])
    //                 .call()

    //             assert.equal(spa, spa_map);

    //             if (i == serviceProviderAddresses.length - 1) console.log('test done!')
    //         })

    //         const users = await User.find({}, 'imsi number serviceProvider voiceCallUsage smsUsage internetUsage')
    //             .sort('imsi')
    //             .exec();


    //         let uploadFuncs = [];
    //         for (let i = 0; i < users.length; ++i) {
    //             let entry = users[i];

    //             const f = async () => {
    //                 await roamingDataManagement.methods
    //                     .uploadUserDataSummary(entry.imsi, entry.number,
    //                         entry.serviceProvider, Math.round(entry.voiceCallUsage),
    //                         Math.round(entry.internetUsage), entry.smsUsage)
    //                     .send({
    //                         from: serviceProviderAddresses[2],   // Fido, fido is the visiting operator
    //                         gas: '1000000'
    //                     })
    //             }
    //             uploadFuncs.push(f);
    //         }

    //         // console.log(uploadFuncs)
    //         let uploadingFinished = false;
    //         await async.parallel(uploadFuncs, async function (err, results) {
    //             if (err) console.log(err);
    //             else {
    //                 console.log("uploading user data as Fido summary done!")
    //             }
    //             console.log('\n \t fetching data as Rogers!\n\n');
    //             const res = await roamingDataManagement.methods
    //                 // .dataSummaryTable('0xD18A6Cd4F4307a51C000aCE84672d3CFca72670d', "997eb760-9433-431f-98bc-a23d479733b8", "0x86E1DDDe08cc9f897bf7333dB30951eEd46383A7")
    //                 .fetchUserDataSummary("T-Mobile")
    //                 // .userTable(accounts[0], 0)
    //                 .call({ from: serviceProviderAddresses[0] });
    //             console.log('\n\n\n \t fetching data as Rogers done!');
    //             console.log(res[0].length);
    //             console.log(res[1].length);
    //             console.log(res);
    //         })
    //     })
    // })



    describe('Initialization checks --> registration fees', () => {
        it('deploys a roaming data management contract', async () => {
            assert.ok(roamingDataManagement.options.address);
        });
        it('builds the operators mapping table', async () => {
            const serviceProviderAddresses = accounts.slice(0, 6);
            console.log(serviceProviderAddresses);
            serviceProviderAddresses.map(async (operatorAddr, i) => {
                
                const send = await web3.eth.sendTransaction({
                    from: serviceProviderAddresses[i],
                    to: contractAddress,
                    value: web3.utils.toWei('1', 'ether'),
                });

                // console.log(send)
                

                await roamingDataManagement.methods
                    .registerRoamingOperator(operatorAddr, serviceProviders[i])
                    .call({
                        from: serviceProviderAddresses[i],
                        gas: '1000000'
                    }, (err, res) => {
                        if (err) {
                            console.log('***************ERROR********************\n\n\n')
                            console.log(err);
                            console.log('***************ERROR********************\n\n\n')
                        }
                    });

                let spn = await roamingDataManagement.methods
                    .serviceProviders(i)
                    .call();

                if (i == serviceProviderAddresses.length - 1) console.log();

                let spa = await roamingDataManagement.methods
                    .operatorAddresses(i)
                    .call()

                if (i == serviceProviderAddresses.length - 1) console.log();

                let spn_map = await roamingDataManagement.methods
                    .operatorsAddrToName(serviceProviderAddresses[i])
                    .call()

                assert.equal(spn, spn_map);

                if (i == serviceProviderAddresses.length - 1) console.log();

                let spa_map = await roamingDataManagement.methods
                    .operatorsNameToAddr(serviceProviders[i])
                    .call()

                assert.equal(spa, spa_map);

                if (i == serviceProviderAddresses.length - 1) console.log('test done!')
            })

            console.log('checking the registration fee ---')
                const res = await roamingDataManagement.methods
                    .balance()
                    .call({
                        from: serviceProviderAddresses[0],
                        gas: '1000000'
                    }, (err, res) => {
                        if (err) {
                            console.log('***************ERROR********************\n\n\n')
                            console.log(err);
                            console.log('***************ERROR********************\n\n\n')
                        } 
                    });
            console.log(res);
        })
    })
})
