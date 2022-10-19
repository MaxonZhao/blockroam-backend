import keys from '../../config/keys.js';
import randomMobile from 'random-mobile';
import { RandomUtils } from '../../utils/util.mjs'

import { v4 } from 'uuid';
import async from 'async'
import mongoose from 'mongoose';
// import DateTime from 'luxon'


import '../../models/user.js';
import '../../models/serviceusage.js';



export default (numberOfUsers, numberOfDataRecords, timeInterval, year, month, date) => {
    const mongoDB = keys.mongoURI;

    mongoose.connect(mongoDB, { useNewUrlParser: true });
    mongoose.Promise = global.Promise;
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'))

    const UserSchema = mongoose.model('user');
    const ServiceUsageSchema = mongoose.model('service-usage');

    const NUMBER_OF_ENTRIES = numberOfUsers;
    const SERVICE_USAGE_ENTRIES = numberOfDataRecords;
    const serviceProviders = ['Fido', 'Bell', 'AT&T', 'T-Mobile', 'Rogers', 'Cricket']
    const serviceType = ['SMS', 'Voice Call', 'Internet']

    var userEntries = [];
    var randomImsiArray = [];
    // var serviceUsageEntries = [];
    var serviceUsageEntries = {}; 
    var startDates = {};
    var users = 0;

    // var voiceCallUsage = 0;
    // var smsUsage = 0;
    // var internetUsage = 0;
    var userDataSummaryTable = {};

    const today = new Date();
    // var startDate = new Date(year, month, date - 1, today.getHours(), today.getMinutes(), today.getSeconds(), today.getMilliseconds());
    var startDate = new Date(year, month - 1, date);


    function userCreate(imsi, number, serviceProvider, voiceCallUsage, smsUsage, 
        internetUsage, serviceStartTime, voiceCallStartTime, smsStartTime, internetStartTime, 
        voiceCallDate, smsDate, internetDate, serviceUsage, cb) {

        let userDetail = {
            imsi: imsi,
            number: number,
            serviceProvider: serviceProvider,
            voiceCallUsage: voiceCallUsage,
            smsUsage: smsUsage,
            internetUsage: internetUsage,
            serviceStartTime: serviceStartTime,
            voiceCallStartTime: voiceCallStartTime,
            smsStartTime: smsStartTime,
            internetStartTime: internetStartTime,
            voiceCallDate, 
            smsDate,
            internetDate,
            serviceUsage: serviceUsage
        }

        let user = new UserSchema(userDetail);

        user.save(function (err) {
            if (err) {
                cb(err, null)
                return;
            }

            // console.log('New user: ' + user);
            userEntries.push(user);
            cb(null, user);
        });
    }

    function update({imsi, voiceCallUsage, smsUsage, internetUsage, voiceCallDate, smsDate, internetDate}) {
        UserSchema.findOneAndUpdate(
            {"imsi": imsi},
            {"smsUsage": smsUsage, "voiceCallUsage":voiceCallUsage, 
            "internetUsage":internetUsage, "serviceUsage": serviceUsageEntries[imsi],
            "voiceCallDate": voiceCallDate, "smsDate": smsDate, "internetDate": internetDate})
        .exec(function (err, list_users) {
            if (err) { return; }
        });
    }
     

    function serviceUsageCreate(imsi, serviceType, date, usage, cb) {
        let serviceUsageDetail = {
            imsi: imsi,
            serviceType: serviceType,
            usage: usage,
            date: date
        }

        var serviceUsageInstance = new ServiceUsageSchema(serviceUsageDetail);

        serviceUsageInstance.save(function (err) {
            if (err) {
                cb(err, null);
                return;
            }
            // console.log('New ServiceUsage: ' + serviceUsageInstance);
            // serviceUsageEntries.push(serviceUsageInstance);
            
            if (serviceUsageEntries[imsi] == null) serviceUsageEntries[imsi] = [];
            serviceUsageEntries[imsi].push(serviceUsageInstance);

            cb(null, serviceUsageInstance)
        })
    }

    function populateImsiArray(callback) {
        if (users == numberOfUsers) {
            callback(null, null);
            return;
        }
        for (let i = 0; i < NUMBER_OF_ENTRIES; ++i) {
            const r = v4();
            randomImsiArray.push(r);
            userDataSummaryTable[r] = {
                voiceCallUsage: 0,
                smsUsage: 0,
                internetUsage: 0
            };

        }
        callback(null, null);
    }

    function initializeStartDates(callback) {
        if (users == numberOfUsers) {
            callback(null, startDates);
            return;
        }
        for (let i = 0; i < NUMBER_OF_ENTRIES; ++i) {
            // startDates[randomImsiArray[i]] = RandomUtils.getRandomDate(startDate,
            //         // new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 3, startDate.getHours(), startDate.getMinutes(), startDate.getSeconds()));
            //         new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1));

            startDates[randomImsiArray[i]] = startDate;

        }
        callback(null, startDates);
    }


    function createUsers(cb) {
        if (users == numberOfUsers) {
            console.log("updating ...")
            updateUserDataSummary();
            cb(null, null);
            return;
        }
        var fs = [];
        for (let i = 0; i < NUMBER_OF_ENTRIES; ++i) {
            const randomInt = RandomUtils.getRandomInt(serviceProviders.length);
            const randomImsi = randomImsiArray[i];
            const randomNumber = randomMobile({ formatted: true });
            const randomServiceProvider = serviceProviders[randomInt];
            // const randomVoiceCallUsage = RandomUtils.getRandomFloat(1000, 2);
            // const randomSmsUsage = RandomUtils.getRandomInt(1000);
            // const randomInternetUsage = RandomUtils.getRandomFloat(100000, 2);
            // const serviceUsage = serviceUsageEntries.slice(numberOfDataRecords * i, numberOfDataRecords * (i + 1));
            const serviceUsages = serviceUsageEntries[randomImsi]; 

            var voiceCallStartTime = 0;
            var smsStartTime = 0;
            var internetStartTime = 0;
            var serviceStartTime = 0;
            var voiceCallDate = 0;
            var smsDate = 0;
            var internetDate = 0;
            
            for (let i = 0; i < serviceUsages.length; ++i) {
                const t = serviceUsages[i].date.valueOf();
                if (serviceStartTime == 0 || t < serviceStartTime) serviceStartTime = t;
                const st = serviceUsages[i].serviceType;

                if (st == 'Voice Call') {
                    userDataSummaryTable[randomImsi].voiceCallUsage += Number(serviceUsages[i].usage);
                    // voiceCallUsage += Number(serviceUsages[i].usage);
                    if (voiceCallStartTime == 0 || t < voiceCallStartTime) voiceCallStartTime = t;
                    if (t > voiceCallDate) voiceCallDate = t;
                } else if (st == 'SMS') {
                    userDataSummaryTable[randomImsi].smsUsage += Number(serviceUsages[i].usage);
                    // smsUsage += Number(serviceUsages[i].usage);
                    // console.log(smsUsage)

                    if (smsStartTime == 0 || t < smsStartTime) smsStartTime= t;
                    if (t > smsDate) smsDate = t;
                } else {
                    userDataSummaryTable[randomImsi].internetUsage += Number(serviceUsages[i].usage);
                    // internetUsage += Number(serviceUsages[i].usage);
                    if (internetStartTime == 0 || t < internetStartTime) internetStartTime = t;
                    if (t > internetDate) internetDate = t;
                }
            }
            // console.log()

            const f = function (callback) {
                // userCreate(randomImsi, randomNumber, randomServiceProvider, voiceCallUsage, smsUsage, 
                //     internetUsage, serviceStartTime, voiceCallStartTime, smsStartTime, internetStartTime,
                //     serviceUsages, callback);
                const voiceCallUsage = userDataSummaryTable[randomImsi].voiceCallUsage;
                const internetUsage = userDataSummaryTable[randomImsi].internetUsage;
                const smsUsage = userDataSummaryTable[randomImsi].smsUsage;
                userCreate(randomImsi, randomNumber, randomServiceProvider, voiceCallUsage, smsUsage, 
                    internetUsage, serviceStartTime, voiceCallStartTime, smsStartTime, internetStartTime,
                    voiceCallDate, smsDate, internetDate,
                    serviceUsages, callback);
            }
            fs.push(f);
            users++;
        }

        async.parallel(fs, cb);
    }

    function updateUserDataSummary() {
        for (let i = 0; i < NUMBER_OF_ENTRIES; ++i) {
            const randomImsi = randomImsiArray[i];
            const serviceUsages = serviceUsageEntries[randomImsi]; 

            // console.log(serviceUsageEntries);
            userDataSummaryTable[randomImsi].voiceCallUsage = 0;
            userDataSummaryTable[randomImsi].smsUsage = 0;
            userDataSummaryTable[randomImsi].internetUsage = 0;
            
            var voiceCallDate = 0;
            var smsDate = 0;
            var internetDate = 0;
            for (let i = 0; i < serviceUsages.length; ++i) {
                const st = serviceUsages[i].serviceType;
                const t = serviceUsages[i].date.valueOf();

                if (st == 'Voice Call') {
                    if (t > voiceCallDate) voiceCallDate = t;
                    userDataSummaryTable[randomImsi].voiceCallUsage += Number(serviceUsages[i].usage);
                } else if (st == 'SMS') {
                    if (t > smsDate) smsDate = t;
                    userDataSummaryTable[randomImsi].smsUsage += Number(serviceUsages[i].usage);
                } else {
                    if (t > internetDate) internetDate = t;
                    userDataSummaryTable[randomImsi].internetUsage += Number(serviceUsages[i].usage);
                }
            }
            const voiceCallUsage = userDataSummaryTable[randomImsi].voiceCallUsage;
            const internetUsage = userDataSummaryTable[randomImsi].internetUsage;
            const smsUsage = userDataSummaryTable[randomImsi].smsUsage;
            update({imsi: randomImsi, voiceCallUsage: voiceCallUsage, smsUsage: smsUsage, internetUsage: internetUsage,
            voiceCallDate: voiceCallDate, smsDate: smsDate, internetDate: internetDate});
        }
    }

    function createServiceUsages(cb) {
        // console.log('in createServi Usage')
        var fs = [];
        for (let i = 0; i < NUMBER_OF_ENTRIES; ++i) {
            // console.log(`printing stats user with imsi: ${randomImsiArray[i]}`)

            for (let j = 0; j < SERVICE_USAGE_ENTRIES; ++j) {
                const imsi = randomImsiArray[i];
                const date = startDates[imsi];
                // console.log(`the current start date is ${date}`)
                // console.log()
                for (let k = 0; k < serviceType.length; ++k) {
                    const st = serviceType[k];
                    let randomUsage = 0;
                    if (st == 'Voice Call') {
                        randomUsage = RandomUtils.getRandomFloat(1440, 2);
                    } else if (st == 'SMS') {
                        randomUsage = RandomUtils.getRandomInt(1000, 2);
                    } else {
                        randomUsage = RandomUtils.getRandomFloat(5 * 1024, 2); // number of GB
                    }
                    // const randomStartDate = startDates[randomImsi];
                    
                    // const randomEndDate = RandomUtils.getRandomDate(randomStartDate,
                    //     new Date(randomStartDate.getFullYear(), randomStartDate.getMonth(), randomStartDate.getDate() + 2, randomStartDate.getHours(), randomStartDate.getMinutes(), randomStartDate.getSeconds()));
                    fs.push(function (callback) {
                        serviceUsageCreate(imsi, st, date, randomUsage, callback)
                    })
                }
                startDates[imsi] = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

            }
        }
        async.parallel(fs, cb);
    }
    
    async function populateRandomDataRecords() {
        await async.series([
            populateImsiArray,
            initializeStartDates,
            createServiceUsages,
            createUsers,
        ],
            // Optional callback
            function (err, results) {
                if (err) {
                    console.log('FATAL ERR: ' + err);
                }
                else {
                    console.log('populate service usage entries ---- ### job done\n\n\n\n')
                    // console.log(serviceUsageEntries.slice(0,30))
                }
    
                // All done, disconnect from database
                // console.log('closing connection ...')
                // mongoose.connection.close();
            });
        
    }
    
    populateRandomDataRecords();
    setInterval(populateRandomDataRecords, timeInterval)
    
}