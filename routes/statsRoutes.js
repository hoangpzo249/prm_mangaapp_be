const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { auth } = require('../middlewares/auth');
const { authorize } = require('../middlewares/authorize');

// Protect all stats endpoints for Admin only
router.use(auth, authorize('admin'));

router.get('/overview', statsController.getOverview);
router.get('/top-stories', statsController.getTopStories);
router.get('/revenue-chart', statsController.getRevenueChart);
router.get('/user-growth', statsController.getUserGrowthChart);

module.exports = router;
