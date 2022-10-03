const async = require('async');
const mongoose = require('mongoose');
const roamingDataManagementContract = require('../ethereum/roamingDataManagement');
const getAccount = require('../ethereum/accounts');

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

const obj = { name: 'Tom', country: 'Chile' };


exports.registerOperators = async function (req, res, next) {

    const accounts = await getAccount;
    const serviceProviderAddresses = accounts.slice(0, 6);
    console.log(serviceProviderAddresses);
    let registerOpFuncs = [];
    for (let i = 0; i < serviceProviderAddresses.length; ++i) {
        let operatorAddr = serviceProviderAddresses[i];

        const f = async () => {
            await roamingDataManagementContract.methods
            .registerRoamingOperator(operatorAddr, serviceProviders[i])
            .send({
                from: serviceProviderAddresses[i],
                // gas: '100000'
            }, (err, res) => {
                if (err) {
                    console.log('***************ERROR********************\n\n\n')
                    console.log(err);
                    console.log('***************ERROR********************\n\n\n')
                }
            });
        }

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
        else     return res.json('registering operators done ...!');
    })
}

exports.uploadUserDataSummary = async function (req, res, next) {

    const accounts = await getAccount;
    const visitingOperator = req.params.visitingOperator
    console.log(visitingOperator)
    console.log(accounts)
    const users = await User.find({}, 'imsi number serviceProvider voiceCallUsage smsUsage internetUsage')
        .sort('imsi')
        .exec();


    let uploadFuncs = [];
    for (let i = 0; i < users.length; ++i) {
        let entry = users[i];
        if (entry.serviceProvider === visitingOperator) continue;
        // console.log(entry)
        // await roamingDataManagementContract.methods
        //     .uploadUserDataSummary(entry.imsi, entry.number,
        //         entry.serviceProvider, Math.round(entry.voiceCallUsage),
        //         Math.round(entry.internetUsage), entry.smsUsage)
        //     .send({
        //         from: accounts[1],   // Fido, fido is the visiting operator
        //         gas: '1000000'
        //     })

        const f = async () => {
           await roamingDataManagementContract.methods
                .uploadUserDataSummary(entry.imsi, entry.number,
                    entry.serviceProvider, Math.round(entry.voiceCallUsage),
                    Math.round(entry.internetUsage), entry.smsUsage)
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

    // return res.json("uploading user data summary ...");
}


exports.fetchUserDataSummary = async function (req, res, next) {
    const accounts = await getAccount;

    const visitingOperatorName = req.params.visitingOperator;
    const homeOperatorName = req.params.homeOperator;
    const data = await roamingDataManagementContract.methods
        .fetchUserDataSummary(visitingOperatorName)
        .call({ from: accounts[operatorIndexMap[homeOperatorName]] });
    console.log(`\n\n\n \t fetching data as ${homeOperatorName} done!`);
    console.log(data[0])
    console.log('\n\n\n\n');
    console.log(data[1])

    // console.log(data[0].length)
    // console.log(data[1].length)

    return res.json(
        data
    )
}

exports.fetchSubscriptionDataRecords = function (req, res, next) {
    return res.json('fetching subscription data records ...')
}