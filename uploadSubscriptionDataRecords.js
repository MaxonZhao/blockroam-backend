const mongoose = require('mongoose');
const keys = require('./config/keys');
const mongoDB = keys.mongoURI;

mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'))


require('./models/serviceusage');
require('./models/user');
var ServiceUsage = mongoose.model('service-usage');
var User = mongoose.model('user')

let userList;
async function run() {
    await User.find({}, 'imsi')
        .sort('imsi')
        .exec(async (err, users) => {
            users.map(async (entry) => {
                // console.log(entry.imsi);
            });
            console.log('\n\n\nregistering all users done!');
            userList = users;
        });
}

run()

console.log(userList)