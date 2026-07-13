const transactionRepo = require('../repositories/transactionRepository');
const walletRepo = require('../repositories/walletRepository');
const AppError = require('../utils/AppError');


/** Lấy lịch sử giao dịch */
exports.getTransactions = async (userId, page, limit) => {
    return transactionRepo.findByUserId(userId, page, limit);
};

/**
 * Tạo giao dịch nạp xu (DEPOSIT) — trạng thái PENDING
 * Callback từ cổng thanh toán sẽ xác nhận sau
 */
exports.createDeposit = async (userId, data) => {
    const wallet = await walletRepo.findByUserId(userId);
    if (!wallet) throw new AppError('Ví không tồn tại', 404);
    if (wallet.isLocked) throw new AppError('Ví đang bị khóa', 403);

    // Tạo mã đơn hàng nội bộ
    const appTransactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const transaction = await transactionRepo.create({
        userId,
        walletId: wallet._id,
        type: 'DEPOSIT',
        paymentMethod: data.paymentMethod,
        amountMoney: data.amountMoney,
        amountCoins: data.amountCoins,
        status: 'PENDING',
        appTransactionId,
        description: data.description || `Nạp ${data.amountCoins} xu qua ${data.paymentMethod}`
    });

    return transaction;
};

/**
 * Xử lý callback từ cổng thanh toán
 * Xác nhận giao dịch thành công → cộng xu vào ví
 */
exports.handlePaymentCallback = async (appTransactionId, gatewayTransactionId, isSuccess) => {
    const transaction = await transactionRepo.findByAppId(appTransactionId);
    if (!transaction) throw new AppError('Giao dịch không tồn tại', 404);
    if (transaction.status !== 'PENDING') {
        throw new AppError('Giao dịch đã được xử lý', 400);
    }

    if (isSuccess) {
        // Cập nhật transaction
        await transactionRepo.updateStatus(transaction._id, 'SUCCESS');

        // Lưu mã từ cổng thanh toán
        if (gatewayTransactionId) {
            transaction.gatewayTransactionId = gatewayTransactionId;
            await transaction.save();
        }

        // Cộng xu vào ví
        await walletRepo.addBalance(transaction.walletId, transaction.amountCoins);

        return { message: 'Nạp xu thành công' };
    } else {
        await transactionRepo.updateStatus(transaction._id, 'FAILED');
        return { message: 'Giao dịch thất bại' };
    }
};
