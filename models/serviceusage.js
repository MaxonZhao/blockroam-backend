var {DateTime} = require('luxon')
var mongoose = require('mongoose')

var Schema = mongoose.Schema;

var ServiceUsageSchema = new Schema(
    {
        imsi: {type: String, required: true},
        serviceType: {type: String, required: true, enum: ['Voice Call', 'SMS', 'Internet']},
        usage: {type: Schema.Types.Decimal128, required: true},
        date: {type: Date, required: true},
        // startTime: {type: Date, required: true},
        // endTime: {type: Date}
    }
)

ServiceUsageSchema
.virtual('url')
.get(function() {
    return '/catalog/user/service-usage/' + this._id;
})

ServiceUsageSchema
.virtual('time_formatted')
.get(function() {
    return this.date?date: ''
    // DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED) : '';
})


// ServiceUsageSchema
// .virtual('start_time_formatted')
// .get(function() {
//     return this.startTime?
//     DateTime.fromJSDate(this.startTime).toLocaleString(DateTime.DATE_MED) : '';
// }) 

// ServiceUsageSchema
// .virtual('end_time_formatted')
// .get(function() {
//     return this.endTime?
//     DateTime.fromJSDate(this.endTime).toLocaleString(DateTime.DATE_MED) : '';
// })


module.exports = mongoose.model('service-usage', ServiceUsageSchema); 