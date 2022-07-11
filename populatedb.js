const keys = require('./config/keys');
const randomMobile = require('random-mobile');
const {RandomUtils} = require('./utils/util')
const { v4: uuidv4, v4 } = require('uuid');
const async = require('async')

require('./models/user');
require('./models/serviceusage');

const mongoose = require('mongoose');
const mongoDB = keys.mongoURI;

mongoose.connect(mongoDB, {useNewUrlParser: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

const UserSchema = mongoose.model('user');
const ServiceUsageSchema = mongoose.model('service-usage');

const NUMBER_OF_ENTRIES = 120;
const SERVICE_USAGE_ENTRIES = 30;
const serviceProviders = ['Fido', 'Bells', 'AT&T', 'T-mobile', 'Rogers', 'Cricket']
const serviceType = ['SMS', 'Voice Call', 'Internet']

var userEntries = [];
var randomImsiArray = [];
var serviceUsageEntries = [];

function userCreate(imsi, number, serviceProvider, voiceCallUsage, smsUsage, internetUsage, serviceUsage, cb) {
    let userDetail = {
        imsi: imsi,
        number: number,
        serviceProvider: serviceProvider,
        voiceCallUsage: voiceCallUsage,
        smsUsage: smsUsage,
        internetUsage: internetUsage,
        serviceUsage: serviceUsage
    }

    let user = new UserSchema(userDetail);

    user.save(function(err) {
        if (err) {
            cb(err, null)
            return;
        } 

        console.log('New user: ' + user);
        userEntries.push(user);
        cb(null, user);
    });
}

function serviceUsageCreate(imsi, serviceType, startTime, endTime, cb) {
    let serviceUsageDetail = {
        imsi: imsi,
        serviceType: serviceType,
        startTime: startTime,
        endTime: endTime
    }
    
    var serviceUsageInstance = new ServiceUsageSchema(serviceUsageDetail);

    serviceUsageInstance.save(function(err) {
        if (err) {
            cb(err, null);
            return;
        } 
        console.log('New ServiceUsage: ' + serviceUsageInstance);
        serviceUsageEntries.push(serviceUsageInstance);
        cb(null, serviceUsageInstance)
    }) 
}

function populateImsiArray(callback) {
    console.log('in populateImsiArray')
    for (let i = 0; i < NUMBER_OF_ENTRIES; ++i) {
        randomImsiArray.push(uuidv4());
    }
    callback(null, randomImsiArray);
}


function createUsers(cb) {
    var fs = [];
    for (let i = 0; i < NUMBER_OF_ENTRIES; ++i) {
        const randomInt = RandomUtils.getRandomInt(serviceType.length);
        const randomImsi = randomImsiArray[i];
        const randomNumber = randomMobile({formatted: true});
        const randomServiceProvider = serviceProviders[randomInt]; 
        const randomVoiceCallUsage = RandomUtils.getRandomFloat(1000, 2);
        const randomSmsUsage = RandomUtils.getRandomInt(1000);
        const randomInternetUsage = RandomUtils.getRandomFloat(100000, 2);
        const serviceUsage = serviceUsageEntries.slice(30*i, 30*(i+1));
        

        const f = function(callback) {
            userCreate(randomImsi, randomNumber, randomServiceProvider, randomVoiceCallUsage, randomSmsUsage, randomInternetUsage, serviceUsage, callback)
        } 
        fs.push(f);
    }

    async.parallel(fs, cb);
}

function createServiceUsages(cb) {
    console.log('in createServi Usage')
    var fs = [];
    for (let i = 0; i < NUMBER_OF_ENTRIES; ++i) {
        for (let j = 0; j < SERVICE_USAGE_ENTRIES; ++j) {
            const randomImsi = randomImsiArray[i];
            const randomServiceType = serviceType[RandomUtils.getRandomInt(serviceType.length)];
            const today = new Date();
            const randomStartDate = RandomUtils.getRandomDate(new Date(Date.now()), 
            new Date(today.getFullYear() + 1, today.getMonth() + 1, today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds()))
            const randomEndDate = RandomUtils.getRandomDate(randomStartDate, 
                new Date(randomStartDate.getFullYear() + 1, randomStartDate.getMonth() + 1, randomStartDate.getDate(), randomStartDate.getHours(), randomStartDate.getMinutes(), randomStartDate.getSeconds()));
            
            fs.push(function(callback) {
                serviceUsageCreate(randomImsi, randomServiceType, randomStartDate, randomEndDate, callback)
            })
        }
    }
    async.series(fs, cb);
}



// const populationMethod = async () => {
//     for (let i = 0; i < NUMBER_OF_ENTRIES; ++i) {
//         const id = uuidv4();
//         const today = new Date(Date.now())
//         let serviceTypeEntries = [];
//         let startTimeEntries = [];
//         let endTimeEntries = [];
        
//         for (var k = 0; k < SERVICE_USAGE_ENTRIES; ++k) {
//             const randomInt = RandomUtils.getRandomInt(serviceType.length);
//             const startDate = RandomUtils.getRandomDate(new Date(Date.now()), 
//             new Date(today.getFullYear() + 1, today.getMonth() + 1, today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds()))
    
//             serviceTypeEntries.push(serviceType[randomInt]);
//             startTimeEntries.push(startDate)
//             endTimeEntries.push(RandomUtils.getRandomDate(startDate, 
//             new Date(startDate.getFullYear() + 1, startDate.getMonth() + 1, startDate.getDate(), startDate.getHours(), startDate.getMinutes(), startDate.getSeconds())))
//         }

//         await new UserProfileSchema({
//             _id: id,
//             number: randomMobile({ formatted: true }),
//             serviceProvider: serviceProviders[RandomUtils.getRandomInt(serviceProviders.length)],
//             voiceCallUsage: RandomUtils.getRandomFloat(1000, 2),
//             smsUsage: RandomUtils.getRandomInt(1000),
//             internetUsage: RandomUtils.getRandomFloat(2000, 2),
//             serviceUsageProfile: new ServiceUsageSchema({
//                 _id: id,
//                 serviceType: serviceTypeEntries,
//                 startTime: startTimeEntries,
//                 endTime: endTimeEntries
//             }).save()
//         }).save();
//     }
// }


// populationMethod();


// populateImsiArray();
// createServiceUsages(() => {
//     console.log('create service usage entries -----### job completed');
// })
async.series([
    populateImsiArray,
    createServiceUsages,
    createUsers
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: ' + err);
    } 
    else {
        console.log('populate service usage entries ---- ### job done\n\n\n\n')
        // console.log(serviceUsageEntries.slice(0,30))
    }

    // All done, disconnect from database
    console.log('closing connection ...')
    mongoose.connection.close();
});





