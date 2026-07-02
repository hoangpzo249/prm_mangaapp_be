const express = require('express');
const router = express.Router();
const vipController = require('../controllers/vipController');
const { auth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { buyVipRules } = require('../middlewares/validators/vipValidator');

router.get('/packages', vipController.getPackages);

router.post('/buy', auth, validate(buyVipRules), vipController.buyVipPackage);
router.get('/my-subscriptions', auth, vipController.getMySubscriptions);

module.exports = router;
