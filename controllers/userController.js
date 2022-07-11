const async = require('async');
const mongoose = require('mongoose')

require('../models/serviceusage');
require('../models/user');
var ServiceUsage = mongoose.model('service-usage');
var User = mongoose.model('user')

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