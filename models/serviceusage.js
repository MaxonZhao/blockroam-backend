var mongoose = require('mongoose')

var Schema = mongoose.Schema;

var ServiceUsageSchema = new Schema(
    {
        imsi: {type: String, required: true},
        serviceType: [{type: String, required: true, enum: ['Voice Call', 'SMS', 'Internet']}],
        startTime: [{type: Date, required: true}],
        endTime: [{type: Date}]
    }
)

ServiceUsageSchema
.virtual('url')
.get(function() {
    return '/catalog/user/service-usage/' + this._id;
})

mongoose.model('service-usage', ServiceUsageSchema);