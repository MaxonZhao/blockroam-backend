const keys = require('./config/keys');
const randomMobile = require('random-mobile');
const {RandomUtils} = require('../utils/util')
const { v4: uuidv4, v4 } = require('uuid');

require('./models/user');
require('./models/serviceusage');

const mongoose = require('mongoose');
const mongoDB = keys.mongoURI;

mongoose.connect(mongoDB, {useNewUrlParser: true, uuseUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

const UserSchema = mongoose.model('user');
const ServiceUsageSchema = mongoose.model('service-usage');

const NUMBER_OF_ENTRIES = 100;
const SERVICE_USAGE_ENTRIES = 30;
const serviceProviders = ['Fido', 'Bells', 'AT&T', 'T-mobile', 'Rogers', 'Cricket']
const serviceType = ['SMS', 'Voice Call', 'Internet']

var users = [];
var serviceUsage = [];

function userCreate(imsi, number, serviceProvider, voiceCallUsage, smsUsage, serviceUsage, cb) {
    let userDetail = {
        imsi: imsi,
        number: number,
        serviceProvider: serviceProvider,
        voiceCallUsage: voiceCallUsage,
        smsUsage: smsUsage,
        serviceUsage: serviceUsage
    }

    let user = new UserSchema(userDetail);

    user.save(function(err) {
        if (err) {
            cb(err, null)
            return;
        } 

        console.log('New user: ' + user);
        user.push(user);
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
        serviceUsage.push(serviceUsageInstance);
        cb(null, serviceUsageInstance)
    }) 
}

function createUsers(cb) {
    var fs = [];
    for (let i = 0; i < NUMBER_OF_ENTRIES; ++i) {
        const randomInt = RandomUtils.getRandomInt(serviceType.length);
        const randomImsi = uuid4();
        const randomNumber = randomMobile({formatted: true});
        const randomServiceProvider = serviceProviders[randomInt]; 
        const randomVoiceCallUsage = RandomUtils.getRandomFloat(1000, 2);
        const randomSmsUsage = RandomUtils.getRandomInt(1000);
        const randomServiceUsage = RandomUtils.getRandomFloat(2000, 2);
        

        const f = function(callback) {
            userCreate(randomImsi, randomNumber, randomServiceProvider, randomVoiceCallUsage, randomSmsUsage, randomServiceUsage, callback)
        } 
        
    }
}

/*
 const startDate = RandomUtils.getRandomDate(new Date(Date.now()), 
        new Date(today.getFullYear() + 1, today.getMonth() + 1, today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds()))
        const endDate = RandomUtils.getRandomDate(startDate, 
            new Date(startDate.getFullYear() + 1, startDate.getMonth() + 1, startDate.getDate(), startDate.getHours(), startDate.getMinutes(), startDate.getSeconds()));
*/

const populationMethod = async () => {
    for (let i = 0; i < NUMBER_OF_ENTRIES; ++i) {
        const id = uuidv4();
        const today = new Date(Date.now())
        let serviceTypeEntries = [];
        let startTimeEntries = [];
        let endTimeEntries = [];
        
        for (var k = 0; k < SERVICE_USAGE_ENTRIES; ++k) {
            const randomInt = RandomUtils.getRandomInt(serviceType.length);
            const startDate = RandomUtils.getRandomDate(new Date(Date.now()), 
            new Date(today.getFullYear() + 1, today.getMonth() + 1, today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds()))
    
            serviceTypeEntries.push(serviceType[randomInt]);
            startTimeEntries.push(startDate)
            endTimeEntries.push(RandomUtils.getRandomDate(startDate, 
            new Date(startDate.getFullYear() + 1, startDate.getMonth() + 1, startDate.getDate(), startDate.getHours(), startDate.getMinutes(), startDate.getSeconds())))
        }

        await new UserProfileSchema({
            _id: id,
            number: randomMobile({ formatted: true }),
            serviceProvider: serviceProviders[RandomUtils.getRandomInt(serviceProviders.length)],
            voiceCallUsage: RandomUtils.getRandomFloat(1000, 2),
            smsUsage: RandomUtils.getRandomInt(1000),
            internetUsage: RandomUtils.getRandomFloat(2000, 2),
            serviceUsageProfile: new ServiceUsageSchema({
                _id: id,
                serviceType: serviceTypeEntries,
                startTime: startTimeEntries,
                endTime: endTimeEntries
            }).save()
        }).save();
    }
}


populationMethod();

async.series([

], 
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: ' + err);
    } 
    else {
        console.log('done')
    }

    // All done, disconnect from database
    mongoose.connection.close();
});






