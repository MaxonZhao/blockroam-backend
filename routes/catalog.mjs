import express from 'express';
var router = express.Router();

// require controller modules.
import user_controller from '../controllers/userController.mjs';
import data_exchange_controller from '../controllers/dataExchangeController.mjs';
import fraudulent_controller from '../controllers/fraudulentController.cjs';

/// USER ROUTES ///

// GET catalog home page
router.get('/', user_controller.index);
router.get('/users', user_controller.user_list);
router.get('/users/:id', user_controller.user_detail);
router.get('/users/local/:service_provider', user_controller.check_Authenticated,user_controller.fetch_local_user_list);
router.get('/upload-user-data-summary/:visitingOperator', data_exchange_controller.uploadUserDataSummary);
// router.get('/register-operators', data_exchange_controller.registerOperators);
router.get('/fetch-billing-history', data_exchange_controller.fetchBillingHistory);
router.get('/balance', data_exchange_controller.checkAccountBalance);
router.post('/fetch-user-summary', data_exchange_controller.fetchUserDataSummary);
// router.get('/test', (req, res) => {return res.json('Testing!')})

// authentication
router.post('/register', user_controller.register);
router.get('/delete-operator/:operatorName', user_controller.deleteOperator);

router.post('/login', user_controller.login);
router.get('/logout', user_controller.logout);

//
router.post('/fraudulent',fraudulent_controller.check_fraudulent)
router.get('/fraudulent/:imsi/:operator', fraudulent_controller.Is_Updated_fraudulent)

//
router.post('/upload-file', data_exchange_controller.uploadFile)
router.post('/download-file', data_exchange_controller.fetchFile)

export default router;