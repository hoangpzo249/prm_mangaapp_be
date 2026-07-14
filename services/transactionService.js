const transactionRepo = require('../repositories/transactionRepository');
const walletRepo = require('../repositories/walletRepository');
const AppError = require('../utils/AppError');
const vnpayService = require('./vnpayService');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');


/** Lấy lịch sử giao dịch */
exports.getTransactions = async (userId, page, limit) => {
    return transactionRepo.findByUserId(userId, page, limit);
};

exports.getTransactionById = async (id, userId) => {
    const tx = await transactionRepo.findById(id);
    if (!tx || tx.userId.toString() !== userId) throw new AppError('Không tìm thấy giao dịch', 404);
    return tx;
};

/**
 * Tạo giao dịch nạp xu (DEPOSIT) — trạng thái PENDING
 */
exports.createDeposit = async (userId, data, ipAddr) => {
    const wallet = await walletRepo.findByUserId(userId);
    if (!wallet) throw new AppError('Ví không tồn tại', 404);
    if (wallet.isLocked) throw new AppError('Ví đang bị khóa', 403);

    // Tạo mã đơn hàng nội bộ (VNPAY chỉ cho phép chữ và số, KHÔNG có ký tự đặc biệt như _)
    const appTransactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    let transaction = await transactionRepo.create({
        userId,
        walletId: wallet._id,
        type: 'DEPOSIT',
        paymentMethod: data.paymentMethod, // E.g., 'VNPAY'
        amountMoney: data.amountMoney,
        amountCoins: data.amountCoins,
        status: 'PENDING',
        appTransactionId,
        description: data.description || `Nap ${data.amountCoins} xu qua ${data.paymentMethod}`
    });

    let paymentUrl = null;
    if (data.paymentMethod === 'VNPAY') {
        paymentUrl = vnpayService.createPaymentUrl(
            ipAddr,
            data.amountMoney, // Thư viện vnpay tự động nhân 100
            appTransactionId,
            transaction.description
        );
    }

    // Convert mongoose doc to object and attach paymentUrl
    const result = transaction.toObject();
    result.paymentUrl = paymentUrl;

    return result;
};

exports.handlePaymentCallback = async (appTransactionId, gatewayTransactionId, isSuccess) => {
    try {
        const transaction = await Transaction.findOne({ appTransactionId });
        if (!transaction) throw new AppError('Giao dịch không tồn tại', 404);

        if (transaction.status !== 'PENDING') {
            return { message: 'Giao dịch đã được xử lý', status: transaction.status };
        }

        if (isSuccess) {
            transaction.status = 'SUCCESS';
            if (gatewayTransactionId) transaction.gatewayTransactionId = gatewayTransactionId;
            await transaction.save();

            await Wallet.findByIdAndUpdate(
                transaction.walletId,
                { $inc: { balance: transaction.amountCoins } },
                { new: true, runValidators: true }
            );

            return { message: 'Nạp xu thành công', status: 'SUCCESS' };
        } else {
            transaction.status = 'FAILED';
            if (gatewayTransactionId) transaction.gatewayTransactionId = gatewayTransactionId;
            await transaction.save();

            return { message: 'Giao dịch thất bại', status: 'FAILED' };
        }
    } catch (error) {
        throw error;
    }
};
