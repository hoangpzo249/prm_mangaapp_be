const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { auth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createDepositRules } = require('../middlewares/validators/transactionValidator');

// User query
router.get('/', auth, transactionController.getTransactions);
router.get('/:id/status', auth, transactionController.getTransactionStatus);

// Tạo giao dịch nạp xu
router.post('/deposit', auth, validate(createDepositRules), transactionController.createDeposit);

// Nhận redirect từ VNPay
router.get('/vnpay-return', transactionController.vnpayReturn);

// Webhook / Callback từ bên thứ 3 (không cần auth vì webhook gọi từ server khác)
// Lưu ý: Thực tế cần middleware xác minh chữ ký (signature) của đối tác
router.post('/callback/:method', transactionController.handleCallback);

module.exports = router;
