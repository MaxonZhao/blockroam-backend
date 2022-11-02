var express = require('express');
var router = express.Router();

// require controller modules.
var user_controller = require('../controllers/userController');
var serviceUsage_controller = require('../controllers/serviceUsageController');
var data_exchange_controller = require('../controllers/dataExchangeController');
var fraudulent_controller = require('../controllers/fraudulentController');
const session = require("express-session");

/// USER ROUTES ///

// GET catalog home page
router.get('/', user_controller.index);
router.get('/users', user_controller.user_list);
router.get('/users/:id', user_controller.user_detail);
router.get('/users/local/:service_provider', user_controller.check_Authenticated ,user_controller.fetch_local_user_list);
router.get('/upload-user-data-summary/:visitingOperator', data_exchange_controller.uploadUserDataSummary);
router.get('/register-operators', data_exchange_controller.registerOperators);
router.get('/fetch-user-summary/:homeOperator/:visitingOperator', data_exchange_controller.fetchUserDataSummary);
router.get('/fetch-billing-history', data_exchange_controller.fetchBillingHistory);
router.get('/balance', data_exchange_controller.checkAccountBalance);

// authentication
router.post('/register',user_controller.register);
router.post('/login',user_controller.login);

//
router.post('/fraudulent',fraudulent_controller.check_fraudulent)
router.get('/fraudulent/:imsi/:operator', fraudulent_controller.Is_Updated_fraudulent)



module.exports = router;