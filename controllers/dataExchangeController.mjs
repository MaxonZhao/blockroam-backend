import async from 'async';
import mongoose from 'mongoose';
import roamingDataManagementContract from '../ethereum/roamingDataManagement.cjs';
import getAccount from '../ethereum/accounts.cjs';
import ganache from 'ganache-cli';
import Web3 from 'web3';
const web3 = new Web3(ganache.provider());
import * as IPFS from 'ipfs-core'

import {FileHandler} from '../utils/ipfs.mjs'

import '../models/serviceusage.cjs';
import '../models/user.cjs';
var User = mongoose.model('user')
let ipfs

const serviceProviders = ["Rogers", "Fido", "T-Mobile", "Cricket", "Bell", "AT&T"];
const operatorIndexMap =
    {
        "Rogers": 0,
        "Fido": 1,
        "T-Mobile": 4,
        "Cricket": 5,
        "Bell": 3,
        "AT&T": 2
    }


const registerOperators = async function (req, res, next) {

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
        registerOpFuncs.push(f);
    }

    await async.parallel(registerOpFuncs, function (err, results) {
        if (err) console.log(err);
        else return res.json('registering operators done ...!');
    })
}

const uploadUserDataSummary = async function (req, res, next) {

    const accounts = await getAccount;
    const visitingOperator = req.params.visitingOperator
    console.log(visitingOperator)
    // console.log(accounts)
    const users = await User.find({},)
        .sort('imsi')
        .exec();

    console.log(users)
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
        if (err) {
            console.log(err);
            return res.status(403).json("unable to upload user data summary!")
        }
        else {
            console.log(`uploading roaming data as ${visitingOperator} job done!`)
            return res.json("uploading user data summary done!")
        }
    })
}

const fetchBillingHistory = async function (req, res, next) {
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

const checkAccountBalance = async function (req, res, next) {
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


const fetchUserDataSummary = async function (req, res, next) {
    const accounts = await getAccount;

    const visitingOperatorName = req.body.visitingOperator;
    const homeOperatorName = req.body.homeOperator;
    console.log(req.body.visitingOperator)
    console.log(req.body.homeOperator)
    console.log(req.body.secretKey)

    await roamingDataManagementContract.methods
        .operatorSecretKeysCID(accounts[operatorIndexMap[homeOperatorName]])
        .call({
            from: accounts[operatorIndexMap[homeOperatorName]],
            gas: '1000000'
        }, async (err, result) => {
            if (err) {
                console.log('***************ERROR********************\n\n\n')
                console.log(err);
                console.log('***************ERROR********************\n\n\n')
            } else {
                if (ipfs == null) ipfs = await IPFS.create();
                const cid = result;
                const stream = ipfs.cat(cid)
                const decoder = new TextDecoder()
                let data = ''

                // fetching the secret key
                for await (const chunk of stream) {
                    // chunks of data are returned as a Uint8Array, convert it back to a string
                    data += decoder.decode(chunk, {stream: true})
                }

                console.log(data)
                if (data == req.body.secretKey) {
                    await roamingDataManagementContract.methods
                        .fetchUserDataSummary(visitingOperatorName, req.body.secretKey)
                        .call({from: accounts[operatorIndexMap[homeOperatorName]]}, (err, result) => {
                            if (err) {
                                console.log('***************ERROR********************\n\n\n')
                                console.log(err);
                                console.log('***************ERROR********************\n\n\n')
                                return res.json("ungranted access!")
                            } else {
                                // accountBalance[serviceProviders[i]] = result;
                                console.log(`\n\n\n \t fetching data as ${homeOperatorName} done!`);
                                console.log(result[0])
                                console.log('\n\n\n\n');
                                console.log(result[1])

                                return res.json(
                                    result
                                )
                            }
                        })
                        .catch(e => console.log(e));
                } else {
                    return res.status(403).send("forbidden access to roaming data summary, possibly incorrect" +
                        "secret key");
                }
            }
        });
}

const fetchSubscriptionDataRecords = function (req, res, next) {
    return res.json('fetching subscription data records ...')
}

const uploadFile = async function(req, res, next) {
    const ipfs = await IPFS.create()
    const {cid} = await ipfs.add(req.body.message);
    console.log("-------------- PRINTING CID ------------------")
    console.log(cid)
    return res.json(cid.toString());
}

const fetchFile = async function(req, res, next) {

    const node = await IPFS.create()

    console.log(req.body.cid)
    const stream = node.cat(req.body.cid)
    const decoder = new TextDecoder()
    let data = ''

    for await (const chunk of stream) {
        // chunks of data are returned as a Uint8Array, convert it back to a string
        data += decoder.decode(chunk, { stream: true })
    }

    return res.json(data);
}

const data_exchange_controller = {
    registerOperators,
    uploadUserDataSummary,
    fetchBillingHistory,
    checkAccountBalance,
    fetchUserDataSummary,
    fetchSubscriptionDataRecords,
    uploadFile,
    fetchFile
}
export default data_exchange_controller

