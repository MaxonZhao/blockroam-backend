var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema= new Schema(
    {
        imsi: {type: String, required: true},
        number: {type: String, required: true},
        serviceProvider: {type: String, required: true, enum: ['Rogers', 'Bells', 'AT&T', 'Cricket', 'Fido', 'T-mobile'], default: 'Rogers'},
        voiceCallUsage: {type: Schema.Types.Decimal128}, // I think this might be a virtual
        smsUsage: {type: Number}, // this might be a virtual as well
        serviceUsage: {type: Schema.Types.ObjectId, ref: 'serviceusage'}
    }
)

UserSchema
.virtual('url')
.get(function() {
    return '/catalog/user/' + this._id;
})

module.exports = mongoose.model('Book', BookSchema);