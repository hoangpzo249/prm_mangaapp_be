const Transaction = require('../models/Transaction');

// ============================================================
// Transaction Repository — Data access layer cho Transaction
// ============================================================

/** Lấy lịch sử giao dịch của user, mới nhất trước */
exports.findByUserId = (userId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    return Transaction.find({ userId })
        .populate('packageId', 'name durationDays priceCoins')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};

exports.findById = (id) => {
    return Transaction.findById(id);
};

/** Tìm theo mã giao dịch từ cổng thanh toán */
exports.findByGatewayId = (gatewayTransactionId) => {
    return Transaction.findOne({ gatewayTransactionId });
};

/** Tìm theo mã đơn hàng nội bộ */
exports.findByAppId = (appTransactionId) => {
    return Transaction.findOne({ appTransactionId });
};

exports.create = (data) => {
    const transaction = new Transaction(data);
    return transaction.save();
};

/** Cập nhật trạng thái giao dịch (PENDING → SUCCESS/FAILED) */
exports.updateStatus = (id, status) => {
    return Transaction.findByIdAndUpdate(id, { status }, { new: true });
};
