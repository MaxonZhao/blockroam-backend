const async = require('async');
const mongoose = require('mongoose')
const uuidv5 = require('uuid').v5;

require('../models/serviceusage');
require('../models/user');
require('../models/operator')
const roamingDataManagementContract = require("../ethereum/roamingDataManagement");
const ganache = require('ganache-cli');
const Web3 = require('web3')
const web3 = new Web3(ganache.provider());


let ServiceUsage = mongoose.model('service-usage');
let User = mongoose.model('user');
let OperatorSchema = mongoose.model('operator');

const initialBalance = 100

const USER_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';
 
exports.index = function (req, res) {
    async.parallel({
        user_count: function (callback) {
            User.countDocuments({}, callback);
        },

        service_usage_count: function (callback) {
            ServiceUsage.countDocuments({}, callback);
        }
    }, function (err, results) {
        res.render('index', { title: 'blockroam backend', data: results, error: err })
    });
}

exports.login = function (req, res) {
    const operatorName = req.body.username;
    const password = req.body.password;

    OperatorSchema.find({'operatorName': operatorName})
        .exec(function(err, operators) {

            if (err) {
                res.status(400).json("unable to login: \n" + err);
                return;
            }
            if (operators.length == 0) {
                res.status(400).json("unable to login, user does not exist");
                return
            } else {
                const operator = operators[0];
                if (password === operator.password) {
                    res.status(200).json("Login Successful!")
                } else {
                    res.status(403).json("Wrong password!")
                }
                return;
            }
        });
}

exports.register = function (req, res) {
    // console.log(req.body);
    const opSecretKey = uuidv5(req.body.username + req.body.password, USER_NAMESPACE)
    // console.log(secretKey);
    const op = {
        operatorName: req.body.username,
        password: req.body.password,
        address: req.body.address,
        secretKey: opSecretKey
    };

    OperatorSchema.find({'operatorName': op.operatorName})
        .exec(function(err, operators) {
            console.log("-------------- registering --------------")
            console.log(op.operatorName)
            console.log(operators)
            if (err) {
                res.status(400).json("unable to register: \n" + err);
                return;
            }
            if (operators.length != 0) {
                res.status(403).json("user already existed");
                return
            }

            const operatorInstance = new OperatorSchema(op);
            operatorInstance.save(async function (err) {
                if (err) {
                    console.log(err);
                } else {
                    res.status(200).json({
                        "username": req.body.username,
                        "password": req.body.password,
                        "address": req.body.address,
                        "secretKey": opSecretKey});
                }

                await roamingDataManagementContract.methods
                    .registerRoamingOperator(req.body.address, req.body.username, new Date().valueOf(), opSecretKey)
                    .send({
                        from: req.body.address,
                        value: web3.utils.toWei(initialBalance, 'wei'),
                        gas: '1000000'
                    }, (err, res) => {
                        if (err) {
                            console.log('***************ERROR********************\n\n\n')
                            console.log(err);
                            console.log('***************ERROR********************\n\n\n')
                        } else {
                            return res.status(200).json(`Operator ${req.body.username} has been registered!`);
                        }
                    });
            });


        });
}

exports.user_list = function (req, res, next) {
    User.find({}, 'imsi number servicessage')
        .sort('imsi')
        .populate('serviceUsage')
        .exec(function (err, list_users) {
            if (err) { return next(err); }
            res.render('user_list', { title: 'User List', user_list: list_users })
        });
}

exports.user_detail = function (req, res, next) {
    User.findById(req.params.id)
        .populate('serviceUsage')
        .exec(function(err, user) {
            if (err) {return next(err)}
            
            res.render('user_detail', {user: user})
        })
}

exports.fetch_local_user_list = function(req, res, next) {
    const sp = req.params.service_provider;
    console.log(sp)
    User.find({serviceProvider: sp})
    .populate('serviceUsage')
    .exec(function(err, user_list) {
        console.log(user_list);
        return res.status(200).json({'service provider': sp, 'user list': user_list})
    }) 

    // return res.status(404).send('Sorry we cannot find any!')
}