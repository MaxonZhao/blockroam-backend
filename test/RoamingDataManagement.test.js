const async = require('async');
const assert = require('assert')
const ganache = require('ganache-cli');
const Web3 = require('web3')
const web3 = new Web3(ganache.provider());

const mongoose = require('mongoose');
const keys = require('../config/keys');
const mongoDB = keys.mongoURI;

mongoose.connect(mongoDB, {useNewUrlParser: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

require('../models/serviceusage');
require('../models/user');
var ServiceUsage = mongoose.model('service-usage');
var User = mongoose.model('user')


const compiledRoamingDataManagementContract = require('../ethereum/build/RoamingDataManagement.json')
const roamingDataManagementContract = require("../ethereum/roamingDataManagement");

let accounts
let roamingDataManagement
const contractAddress = '0x73d3fD7285813A36C1dAb7f7620a09eb09C3eFd0'

const serviceProviders = ["Rogers", "Fido", "T-Mobile", "Cricket", "Bell", "AT&T"];
const opSecretKeys = ["rogerstest", "fidotest", "tmobiletest", "crickettest", "belltest", "at&ttest"];


beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    rogers = accounts[0];

    roamingDataManagement = await new web3.eth.Contract(compiledRoamingDataManagementContract.abi)
        .deploy({data: compiledRoamingDataManagementContract.evm.bytecode.object})
        .send({from: accounts[0], gas: '5000000'})

});

describe('Roaming Data Management System', () => {

    const initialBalance = '100'

    describe('Registration Check up', () => {
        it('registration test', async () => {
            const serviceProviderAddresses = accounts.slice(0, 6);
            for (let i = 0; i < serviceProviderAddresses.length; ++i) {
                const operatorAddr = serviceProviderAddresses[i]
                await roamingDataManagement.methods
                    .registerRoamingOperator(operatorAddr, serviceProviders[i], new Date().valueOf(), opSecretKeys[i])
                    .send({
                        from: serviceProviderAddresses[i],
                        value: web3.utils.toWei(initialBalance, 'wei'),
                        gas: '1000000'
                    }, (err, res) => {
                        if (err) {
                            console.log('***************ERROR********************\n\n\n')
                            console.log(err);
                            console.log('***************ERROR********************\n\n\n')
                        }
                    });
            }

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
                    } else {
                        console.log(res)
                    }
                });
            assert.equal(res, 6 * initialBalance)


            // ########################################    checking account balance of each roaming operator   ############################################
            console.log("checking initial balance")
            let rogsersAmount = await roamingDataManagement.methods
                .bank(serviceProviderAddresses[0])
                .call({from: serviceProviderAddresses[0]});

            console.log("current balance of Rogers' account")
            console.log(rogsersAmount);

            let fidoAmount = await roamingDataManagement.methods
                .bank(serviceProviderAddresses[1])
                .call({from: serviceProviderAddresses[0]});

            console.log("current balance of Fido's account")
            console.log(fidoAmount);

            let tmobileAmount = await roamingDataManagement.methods
                .bank(serviceProviderAddresses[2])
                .call({from: serviceProviderAddresses[0]});

            console.log("current balance of tmobile's account")
            console.log(tmobileAmount);

            let cricketAmount = await roamingDataManagement.methods
                .bank(serviceProviderAddresses[3])
                .call({from: serviceProviderAddresses[0]});

            console.log("current balance of cricket's account")
            console.log(cricketAmount);

            let bellAmount = await roamingDataManagement.methods
                .bank(serviceProviderAddresses[4])
                .call({from: serviceProviderAddresses[0]});

            console.log("current balance of Bell's account")
            console.log(bellAmount);

            let atmtAmount = await roamingDataManagement.methods
                .bank(serviceProviderAddresses[5])
                .call({from: serviceProviderAddresses[0]});

            console.log("current balance of AT&T's account")
            console.log(atmtAmount);
            console.log("\n\n")

            // ############################## finish checking balance of each roaming operator #####################################


            // ############################## Upload Roaming Data as Fido #####################################

            const users = await User.find({}, 'imsi number serviceProvider voiceCallUsage smsUsage internetUsage')
                .sort('imsi')
                .exec();

            // console.log(users);

            // let today = new Date();
            let t1 = new Date();
            let uploadFuncs = [];
            for (let i = 0; i < users.length; ++i) {

                // console.log(t);
                let entry = users[i];
                if (entry.serviceProvider == "Fido") continue;
                const f = async () => {
                    t1 = new Date(t1.getFullYear(), t1.getMonth(), t1.getDate() + 1);

                    await roamingDataManagement.methods
                        .uploadUserDataSummary(entry.imsi, entry.number,
                            entry.serviceProvider, Math.round(entry.voiceCallUsage),
                            Math.round(entry.internetUsage), entry.smsUsage, new Date().valueOf(), new Date().valueOf(), new Date().valueOf(), new Date().valueOf(), t1.valueOf())
                        .send({
                            from: serviceProviderAddresses[1],   // Fido, fido is the visiting operator
                            gas: '1000000'
                        })

                }
                uploadFuncs.push(f);
            }


            await async.parallel(uploadFuncs, async (err, results) => {
                if (err) console.log(err);
                else {
                    console.log("uploading user data as Fido summary done!")
                    // ############################## Fetch Roaming Data as Rogers #####################################

                    console.log('\n \t fetching data as Rogers!\n\n');
                    await roamingDataManagement.methods
                        .fetchUserDataSummary("Fido", opSecretKeys[0])
                        .call({from: serviceProviderAddresses[0]}, (err, roamingData) => {
                            if (err) {
                                console.log('***************ERROR********************\n\n\n')
                                console.log(err);
                                console.log('***************ERROR********************\n\n\n')
                            } else {
                                console.log("\n\n\n\n\n")
                                console.log('\n\n\n \t fetching data as Rogers done!');
                                console.log(roamingData);
                            }
                        });

                    // ############################## Fetch Roaming Data as Fido DONE #####################################
                }
            });
            // ############################## Upload Roaming Data as Fido Done #####################################


        })

    })
    // describe('Initialization checks --> registration fees', () => {
    //     it('deploys a roaming data management contract', async () => {
    //         assert.ok(roamingDataManagement.options.address);
    //     });
    //     it('builds the operators mapping table', async () => {
    //         const serviceProviderAddresses = accounts.slice(0, 6);
    //         console.log(serviceProviderAddresses);
    //         for (let i = 0; i < serviceProviderAddresses.length; ++i) {
    //             const operatorAddr = serviceProviderAddresses[i]
    //             await roamingDataManagement.methods
    //                 .registerRoamingOperator(operatorAddr, serviceProviders[i], new Date().valueOf())
    //                 .send({
    //                     from: serviceProviderAddresses[i],
    //                     value: web3.utils.toWei(initialBalance, 'wei'),
    //                     gas: '1000000'
    //                 }, (err, res) => {
    //                     if (err) {
    //                         console.log('***************ERROR********************\n\n\n')
    //                         console.log(err);
    //                         console.log('***************ERROR********************\n\n\n')
    //                     }
    //                 });
    //
    //             let spn = await roamingDataManagement.methods
    //                 .serviceProviders(i)
    //                 .call();
    //
    //             if (i == serviceProviderAddresses.length - 1) console.log();
    //
    //             let spa = await roamingDataManagement.methods
    //                 .operatorAddresses(i)
    //                 .call()
    //
    //             if (i == serviceProviderAddresses.length - 1) console.log();
    //
    //             let spn_map = await roamingDataManagement.methods
    //                 .operatorsAddrToName(serviceProviderAddresses[i])
    //                 .call()
    //
    //             assert.equal(spn, spn_map);
    //
    //             if (i == serviceProviderAddresses.length - 1) console.log();
    //
    //             let spa_map = await roamingDataManagement.methods
    //                 .operatorsNameToAddr(serviceProviders[i])
    //                 .call()
    //
    //             assert.equal(spa, spa_map);
    //
    //             if (i == serviceProviderAddresses.length - 1) console.log('test done!')
    //         }
    //
    //         console.log('checking the registration fee ---')
    //         const res = await roamingDataManagement.methods
    //             .balance()
    //             .call({
    //                 from: serviceProviderAddresses[0],
    //                 gas: '1000000'
    //             }, (err, res) => {
    //                 if (err) {
    //                     console.log('***************ERROR********************\n\n\n')
    //                     console.log(err);
    //                     console.log('***************ERROR********************\n\n\n')
    //                 } else {
    //                     console.log(res)
    //                 }
    //             });
    //         assert.equal(res, 6 * initialBalance)
    //
    //
    //         // ########################################    checking account balance of each roaming operator   ############################################
    //         console.log("checking initial balance")
    //         let rogsersAmount = await roamingDataManagement.methods
    //             .bank(serviceProviderAddresses[0])
    //             .call({from: serviceProviderAddresses[0]});
    //
    //         console.log("current balance of Rogers' account")
    //         console.log(rogsersAmount);
    //
    //         let fidoAmount = await roamingDataManagement.methods
    //             .bank(serviceProviderAddresses[1])
    //             .call({from: serviceProviderAddresses[0]});
    //
    //         console.log("current balance of Fido's account")
    //         console.log(fidoAmount);
    //
    //         let tmobileAmount = await roamingDataManagement.methods
    //             .bank(serviceProviderAddresses[2])
    //             .call({from: serviceProviderAddresses[0]});
    //
    //         console.log("current balance of tmobile's account")
    //         console.log(tmobileAmount);
    //
    //         let cricketAmount = await roamingDataManagement.methods
    //             .bank(serviceProviderAddresses[3])
    //             .call({from: serviceProviderAddresses[0]});
    //
    //         console.log("current balance of cricket's account")
    //         console.log(cricketAmount);
    //
    //         let bellAmount = await roamingDataManagement.methods
    //             .bank(serviceProviderAddresses[4])
    //             .call({from: serviceProviderAddresses[0]});
    //
    //         console.log("current balance of Bell's account")
    //         console.log(bellAmount);
    //
    //         let atmtAmount = await roamingDataManagement.methods
    //             .bank(serviceProviderAddresses[5])
    //             .call({from: serviceProviderAddresses[0]});
    //
    //         console.log("current balance of AT&T's account")
    //         console.log(atmtAmount);
    //         console.log("\n\n")
    //
    //         // ############################## finish checking balance of each roaming operator #####################################
    //
    //
    //         const users = await User.find({}, 'imsi number serviceProvider voiceCallUsage smsUsage internetUsage')
    //             .sort('imsi')
    //             .exec();
    //
    //         // console.log(users);
    //
    //         // let today = new Date();
    //         let t1 = new Date();
    //         let uploadFuncs = [];
    //         for (let i = 0; i < users.length; ++i) {
    //
    //             // console.log(t);
    //             let entry = users[i];
    //             if (entry.serviceProvider == "Fido") continue;
    //             const f = async () => {
    //                 t1 = new Date(t1.getFullYear(), t1.getMonth(), t1.getDate() + 1);
    //
    //                 await roamingDataManagement.methods
    //                     .uploadUserDataSummary(entry.imsi, entry.number,
    //                         entry.serviceProvider, Math.round(entry.voiceCallUsage),
    //                         Math.round(entry.internetUsage), entry.smsUsage, new Date().valueOf(), new Date().valueOf(), new Date().valueOf(), new Date().valueOf(), t1.valueOf())
    //                     .send({
    //                         from: serviceProviderAddresses[1],   // Fido, fido is the visiting operator
    //                         gas: '1000000'
    //                     })
    //
    //             }
    //             uploadFuncs.push(f);
    //
    //         }
    //
    //
    //         await async.parallel(uploadFuncs, async function (err, results) {
    //             if (err) console.log(err);
    //             else {
    //                 console.log("uploading user data as Fido summary done!")
    //                 console.log('checking billing history ---')
    //                 await roamingDataManagement.methods
    //                     .fetchBillingHistory()
    //                     .call({
    //                         from: serviceProviderAddresses[0],
    //                         gas: '1000000'
    //                     }, (err, res) => {
    //                         if (err) {
    //                             console.log('***************ERROR********************\n\n\n')
    //                             console.log(err);
    //                             console.log('***************ERROR********************\n\n\n')
    //                         } else {
    //                             console.log(res)
    //                         }
    //                     });
    //
    //
    //                 // ########################################    checking account balance of each roaming operator   ############################################
    //                 rogsersAmount = await roamingDataManagement.methods
    //                     .bank(serviceProviderAddresses[0])
    //                     .call({from: serviceProviderAddresses[0]});
    //
    //                 console.log("current balance of Rogers' account")
    //                 console.log(rogsersAmount);
    //
    //                 fidoAmount = await roamingDataManagement.methods
    //                     .bank(serviceProviderAddresses[1])
    //                     .call({from: serviceProviderAddresses[0]});
    //
    //                 console.log("current balance of Fido's account")
    //                 console.log(fidoAmount);
    //
    //                 tmobileAmount = await roamingDataManagement.methods
    //                     .bank(serviceProviderAddresses[2])
    //                     .call({from: serviceProviderAddresses[0]});
    //
    //                 console.log("current balance of tmobile's account")
    //                 console.log(tmobileAmount);
    //
    //                 cricketAmount = await roamingDataManagement.methods
    //                     .bank(serviceProviderAddresses[3])
    //                     .call({from: serviceProviderAddresses[0]});
    //
    //                 console.log("current balance of cricket's account")
    //                 console.log(cricketAmount);
    //
    //                 bellAmount = await roamingDataManagement.methods
    //                     .bank(serviceProviderAddresses[4])
    //                     .call({from: serviceProviderAddresses[0]});
    //
    //                 console.log("current balance of Bell's account")
    //                 console.log(bellAmount);
    //
    //                 atmtAmount = await roamingDataManagement.methods
    //                     .bank(serviceProviderAddresses[5])
    //                     .call({from: serviceProviderAddresses[0]});
    //
    //                 console.log("current balance of AT&T's account")
    //                 console.log(atmtAmount);
    //
    //                 // ############################## finish checking balance of each roaming operator #####################################
    //             }
    //             console.log('\n \t fetching data as Rogers!\n\n');
    //             await roamingDataManagement.methods
    //                 // .dataSummaryTable('0xD18A6Cd4F4307a51C000aCE84672d3CFca72670d', "997eb760-9433-431f-98bc-a23d479733b8", "0x86E1DDDe08cc9f897bf7333dB30951eEd46383A7")
    //                 .fetchUserDataSummary("Fido")
    //                 // .userTable(accounts[0], 0)
    //                 .call({from: serviceProviderAddresses[0]});
    //             console.log('\n\n\n \t fetching data as Rogers done!');
    //             // console.log(res[0].length);
    //             // console.log(res[1].length);
    //             // console.log(res);
    //             console.log("\n\n\n\n\n")
    //
    //             // checking total balance
    //             const bankBalance = await roamingDataManagement.methods
    //                 .balance()
    //                 .call({from: serviceProviderAddresses[0]});
    //
    //             console.log("Checking bank balance")
    //             console.log(bankBalance);
    //
    //
    //         })
    //
    //         console.log("\n\n\n\n\n")
    //
    //         // checking total balance
    //         const bankBalance = await roamingDataManagement.methods
    //             .balance()
    //             .call({from: serviceProviderAddresses[0]});
    //
    //         console.log("Checking bank balance")
    //         console.log(bankBalance);
    //     })
    // })
})

