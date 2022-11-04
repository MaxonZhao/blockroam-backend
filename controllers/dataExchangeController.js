const async = require('async');
const mongoose = require('mongoose');
const roamingDataManagementContract = require('../ethereum/roamingDataManagement');
const getAccount = require('../ethereum/accounts');
const ganache = require('ganache-cli');
const Web3 = require('web3')
const web3 = new Web3(ganache.provider());


require('../models/serviceusage');
require('../models/user');
var ServiceUsage = mongoose.model('service-usage');
var User = mongoose.model('user')

const serviceProviders = ["Rogers", "Fido", "T-Mobile", "Cricket", "Bell", "AT&T"];
const operatorIndexMap =
{
    "Rogers": 0,
    "Fido": 1,
    "T-Mobile": 2,
    "Cricket": 3,
    "Bell": 4,
    "AT&T": 5
}



exports.registerOperators = async function (req, res, next) {

    const accounts = await getAccount;
    const serviceProviderAddresses = accounts.slice(0, 6);
    console.log(serviceProviderAddresses);
    let registerOpFuncs = [];
    for (let i = 0; i < serviceProviderAddresses.length; ++i) {
        let operatorAddr = serviceProviderAddresses[i];
        const initialBalance = '100'
        const f = async () => {
            await roamingDataManagementContract.methods
                .registerRoamingOperator(operatorAddr, serviceProviders[i], new Date().valueOf())
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

        // for (let i = 0; i < serviceProviderAddresses.length; ++i) {
        //     const operatorAddr = serviceProviderAddresses[i]
        //     await roamingDataManagement.methods
        //         .registerRoamingOperator(operatorAddr, serviceProviders[i])
        //         .send({
        //             from: serviceProviderAddresses[i],
        //             value: web3.utils.toWei(initialBalance, 'wei'),
        //             gas: '1000000'
        //         }, (err, res) => {
        //             if (err) {
        //                 console.log('***************ERROR********************\n\n\n')
        //                 console.log(err);
        //                 console.log('***************ERROR********************\n\n\n')
        //             }
        //         });


        registerOpFuncs.push(f);
        // await roamingDataManagementContract.methods
        //     .registerRoamingOperator(operatorAddr, serviceProviders[i])
        //     .send({
        //         from: serviceProviderAddresses[i],
        //         // gas: '100000'
        //     }, (err, res) => {
        //         if (err) {
        //             console.log('***************ERROR********************\n\n\n')
        //             console.log(err);
        //             console.log('***************ERROR********************\n\n\n')
        //         }
        //     });

    }

    await async.parallel(registerOpFuncs, function (err, results) {
        if (err) console.log(err);
        else return res.json('registering operators done ...!');
    })
}

exports.uploadUserDataSummary = async function (req, res, next) {

    const accounts = await getAccount;
    const visitingOperator = req.params.visitingOperator
    console.log(visitingOperator)
    console.log(accounts)
    const users = await User.find({},)
        .sort('imsi')
        .exec();


    let uploadFuncs = [];
    for (let i = 0; i < users.length; ++i) {
        let entry = users[i];
        if (entry.serviceProvider === visitingOperator) continue;

        const f = async () => {
            await roamingDataManagementContract.methods
                .uploadUserDataSummary(entry.imsi, entry.number,
                    entry.serviceProvider, Math.round(entry.voiceCallUsage),
                    Math.round(entry.internetUsage), entry.smsUsage,
                    entry.serviceStartTime.getTime(), entry.internetStartTime.getTime(),
                    entry.voiceCallStartTime.getTime(), entry.smsStartTime.getTime(), new Date().valueOf())
                .send({
                    from: accounts[operatorIndexMap[visitingOperator]],
                    gas: '1000000'
                })
        }
        uploadFuncs.push(f);
    }

    await async.parallel(uploadFuncs, function (err, results) {
        if (err) console.log(err);
        else {
            console.log(`uploading roaming data as ${visitingOperator} job done!`)
            return res.json("uploading user data summary done!")
        }
    })
}

exports.fetchBillingHistory = async function (req, res, next) {
    const accounts = await getAccount;
    // console.log(accounts);
    await roamingDataManagementContract.methods
        .fetchBillingHistory()
        .call({
            from: accounts[1],
            gas: '1000000'
        }, (err, result) => {
            if (err) {
                console.log('***************ERROR********************\n\n\n')
                console.log(err);
                console.log('***************ERROR********************\n\n\n')
            } else {
                // console.log(res)
                // result.forEach((entry, index) => this[index][entry.length - 1] = new Date(entry[entry.length - 1]))
                // console.log(result)
                return res.json(result);
            }
        });
}

exports.checkAccountBalance = async function (req, res, next) {
    const accounts = await getAccount;
    // const operatorName = req.params.operatorName;
    // const operatorAddr = serviceProviders[operatorIndexMap[operatorName]]; 

    let acconutBalance = {};

    for (let i = 0; i < serviceProviders.length; ++i) {
        await roamingDataManagementContract.methods
            .bank(accounts[i])
            .call({
                from: accounts[0],
                gas: '1000000'
            }, (err, result) => {
                if (err) {
                    console.log('***************ERROR********************\n\n\n')
                    console.log(err);
                    console.log('***************ERROR********************\n\n\n')
                } else {
                    acconutBalance[serviceProviders[i]] = result;
                }
            });
    }

    return res.json(acconutBalance);
}


exports.fetchUserDataSummary = async function (req, res, next) {
    const accounts = await getAccount;

    const visitingOperatorName = req.body.visitingOperator;
    const homeOperatorName = req.body.homeOperator;
    console.log(req.body.visitingOperator)
    console.log(req.body.homeOperator)
    console.log(req.body.secretKey)


    const data = await roamingDataManagementContract.methods
        .fetchUserDataSummary(visitingOperatorName, req.body.secretKey)
        .call({ from: accounts[operatorIndexMap[homeOperatorName]] }, (err, result) => {
            if (err) {
                console.log('***************ERROR********************\n\n\n')
                console.log(err);
                console.log('***************ERROR********************\n\n\n')
                return res.json("ungranted access!")
            } else {
                // acconutBalance[serviceProviders[i]] = result;
                console.log(`\n\n\n \t fetching data as ${homeOperatorName} done!`);
                console.log(data[0])
                console.log('\n\n\n\n');
                console.log(data[1])

                return res.json(
                    data
                )
            }
        });


}

exports.fetchSubscriptionDataRecords = function (req, res, next) {
    return res.json('fetching subscription data records ...')
}