const express = require('express');
const router = express.Router();
const vipController = require('../controllers/vipController');
const { auth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { buyVipRules, createPackageRules, updatePackageRules } = require('../middlewares/validators/vipValidator');

router.get('/packages', vipController.getPackages);

router.post('/buy', auth, validate(buyVipRules), vipController.buyVipPackage);
router.get('/my-subscriptions', auth, vipController.getMySubscriptions);

// Admin routes
const { authorize } = require('../middlewares/authorize');
router.get('/admin/packages', auth, authorize('admin'), vipController.getAllPackagesAdmin);
router.post('/packages', auth, authorize('admin'), validate(createPackageRules), vipController.createPackage);
router.put('/packages/:id', auth, authorize('admin'), validate(updatePackageRules), vipController.updatePackage);
router.delete('/packages/:id', auth, authorize('admin'), vipController.deletePackage);

module.exports = router;
