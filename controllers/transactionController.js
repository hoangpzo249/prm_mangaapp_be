const transactionService = require('../services/transactionService');

// ============================================================
// Transaction Controller — Giao dịch
// ============================================================

exports.getTransactions = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const transactions = await transactionService.getTransactions(req.user.id, page, limit);
        res.json(transactions);
    } catch (error) {
        next(error);
    }
};

exports.createDeposit = async (req, res, next) => {
    try {
        const transaction = await transactionService.createDeposit(req.user.id, req.body);
        res.status(201).json(transaction);
    } catch (error) {
        next(error);
    }
};

// Webhook từ cổng thanh toán (VD: MoMo) gọi vào đây
exports.handleCallback = async (req, res, next) => {
    try {
        const { appTransactionId, gatewayTransactionId, isSuccess } = req.body;
        const result = await transactionService.handlePaymentCallback(
            appTransactionId,
            gatewayTransactionId,
            isSuccess
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
};
