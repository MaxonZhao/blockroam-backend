var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema= new Schema(
    {
        imsi: {type: String, required: true},
        number: {type: String, required: true},
        serviceProvider: {type: String, required: true, enum: ['Rogers', 'Bells', 'AT&T', 'Cricket', 'Fido', 'T-mobile'], default: 'Rogers'},
        // voiceCallUsage: {type: Schema.Types.Decimal128}, // I think this might be a virtual
        voiceCallUsage: {type: Number}, // I think this might be a virtual
        smsUsage: {type: Number}, // this might be a virtual as well
        internetUsage: {type: Number},
        serviceUsage: [{type: Schema.Types.ObjectId, ref: 'service-usage'}]
    }
)

UserSchema
.virtual('url')
.get(function() {
    return '/catalog/users/' + this._id;
})

UserSchema
.virtual('voiceCallUsageWithUnit')
.get(function() {
    return new String(this.voiceCallUsage) + '  Minutes'
})

UserSchema
.virtual('internetUsageWithUnit')
.get(function() {
    return new String(this.internetUsage) + ' MegaBytes'
})



module.exports = mongoose.model('user', UserSchema);