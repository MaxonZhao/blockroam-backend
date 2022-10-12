const keys = require('./config/keys');

require('./models/user');
require('./models/serviceusage');

const mongoose = require('mongoose');
const mongoDB = keys.mongoURI;

mongoose.connect(mongoDB, {useNewUrlParser: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

const User = mongoose.model('user');
const ServiceUsageSchema = mongoose.model('service-usage');




User.findOneAndUpdate(
    {"imsi": "5041b254-9653-417f-ac6d-af5e9a00b031"},
    {"smsUsage": 0, "voiceCallUsage":0, "internetUsage":0})
.exec(function (err, list_users) {
    if (err) { return next(err); }
    console.log(list_users);
});




