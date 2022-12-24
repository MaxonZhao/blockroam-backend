import axios from 'axios';
import keys from '../../config/keys.js'
import mongoose from 'mongoose'
import async from 'async'


export default (homeOperator, visitingOperator, timeInterval, options) => {

    const mongoDB = keys.mongoURI;

    mongoose.connect(mongoDB, { useNewUrlParser: true });
    mongoose.Promise = global.Promise;
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'))


    const UserSchema = mongoose.model('user');
    const ServiceUsageSchema = mongoose.model('service-usage');
    const url = "http://localhost:8080/catalog/fetch-user-summary/" + homeOperator + "/" + visitingOperator

    const fetch = async () => {
        let res = await axios.get(url)
        
        // console.log(res.data[0]);
        // console.log('\n\n\n\n')
        console.log(res.data[1]);
    }


    async function fetchRoamingDataFunc() {
        await fetch()
    }

    setInterval(fetchRoamingDataFunc, timeInterval)
}
