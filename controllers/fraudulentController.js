const async = require('async');
const fraudulent = require('../models/fraudulent');
const { subscribe } = require('../routes');

exports.check_fraudulent = async function(req,res,next) {
            const fraudulentList = new fraudulent({
            imsi: req.body.imsi,
            operator: req.body.operator
        });
        
        try {
            const newFraudulentList = await fraudulentList.save()
            return res.status(201).json(newFraudulentList)
        } catch (err) {
            return res.status(400).json({message: err.message})
        }
        next();
}

exports.Is_Updated_fraudulent = async function(req,res,next) {
    const imsi = req.params.imsi;
    const operator = req.params.operator
    fraudulent.find({imsi: imsi , operator: operator}, {})
    .exec(function(error,fraudulentList) {
        return res.status(200).json({"fraudulent" : fraudulentList})
    }) 
}