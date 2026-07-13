const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { auth } = require('../middlewares/auth');
const { authorize } = require('../middlewares/authorize');

// Gửi báo cáo (Tất cả user đã đăng nhập)
router.post('/', auth, reportController.createReport);

// Quản lý báo cáo (Admin duy nhất)
router.get('/', auth, authorize('admin'), reportController.getAllReports);
router.get('/:id', auth, authorize('admin'), reportController.getReportById);
router.put('/:id/resolve', auth, authorize('admin'), reportController.resolveReport);

module.exports = router;
