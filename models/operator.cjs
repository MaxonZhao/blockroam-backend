var mongoose = require('mongoose')

var Schema = mongoose.Schema;

var OperatorSchema = new Schema(
    {
        operatorName: {type: String, required: true},
        password: {type: String, required: true},
        address: {type: String, required: true},
        secretKey: {type: String, required: true}
    }
)

module.exports = mongoose.model('operator', OperatorSchema); 