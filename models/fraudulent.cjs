var mongoose = require('mongoose')


var Schema = mongoose.Schema;

var fraudulentSchema = new Schema (
    {
        imsi: {type: String, required: true},
        operator:{type: String, required: true},
    }
)

module.exports = mongoose.model('fraudulent', fraudulentSchema)