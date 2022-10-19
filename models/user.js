var mongoose = require('mongoose');

var Schema = mongoose.Schema;
// const ServiceUsageSchema = mongoose.model('service-usage');

var UserSchema = new Schema(
    {
        imsi: {type: String, required: true},
        number: {type: String, required: true},
        serviceProvider: {type: String, required: true, enum: ['Rogers', 'Bell', 'AT&T', 'Cricket', 'Fido', 'T-Mobile'], default: 'Rogers'},
        // voiceCallUsage: {type: Schema.Types.Decimal128}, // I think this might be a virtual
        voiceCallUsage: {type: Number}, // I think this might be a virtual
        smsUsage: {type: Number}, // this might be a virtual as well
        internetUsage: {type: Number},
        serviceStartTime: {type: Date},
        voiceCallStartTime: {type: Date},
        smsStartTime: {type: Date},
        internetStartTime: {type: Date},
        voiceCallDate: {type: Date},
        smsDate: {type: Date},
        internetDate: {type: Date},
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

// UserSchema
// .virtual('serviceStartTime')
// .get(async function() {
//     const su = await ServiceUsageSchema.find({imsi: this.imsi})
//     let earliestTimeMillis = su[0].startTime.valueOf();
//     let earliestTime = su[0].startTime;
//     for (let i = 0; i < su.length; ++i) {
//         if (su[i].startTime.valueOf() < earliestTimeMillis) {
//             earliestTimeMillis = su[i].startTime.valueOf();
//             earliestTime = su[i].startTime;
//         }
//     }

//     return earliestTime;
// })

// UserSchema
// .virtual('voiceCallStartTime')
// .get(async function() {
//     const su = await ServiceUsageSchema.find({imsi: this.imsi, serviceType: 'Voice Call'})
//     let earliestTimeMillis = su[0].startTime.valueOf();
//     let earliestTime = su[0].startTime;
//     for (let i = 0; i < su.length; ++i) {
//         if (su[i].startTime.valueOf() < earliestTimeMillis) {
//             earliestTimeMillis = su[i].startTime.valueOf();
//             earliestTime = su[i].startTime;
//         }
//     }

//     return earliestTime;
// })

// UserSchema
// .virtual('smsStartTime')
// .get(async function() {
//     const su = await ServiceUsageSchema.find({imsi: this.imsi, serviceType: 'SMS'})
//     let earliestTimeMillis = su[0].startTime.valueOf();
//     let earliestTime = su[0].startTime;
//     for (let i = 0; i < su.length; ++i) {
//         if (su[i].startTime.valueOf() < earliestTimeMillis) {
//             earliestTimeMillis = su[i].startTime.valueOf();
//             earliestTime = su[i].startTime;
//         }
//     }

//     return earliestTime;
// })

// UserSchema
// .virtual('internetStartTime')
// .get(async function() {
//     const su = await ServiceUsageSchema.find({imsi: this.imsi, serviceType: 'Internet'})
//     let earliestTimeMillis = su[0].startTime.valueOf();
//     let earliestTime = su[0].startTime;
//     for (let i = 0; i < su.length; ++i) {
//         if (su[i].startTime.valueOf() < earliestTimeMillis) {
//             earliestTimeMillis = su[i].startTime.valueOf();
//             earliestTime = su[i].startTime;
//         }
//     }

//     return earliestTime;
// })



module.exports = mongoose.model('user', UserSchema);