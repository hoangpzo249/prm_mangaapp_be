const Wallet = require('../models/Wallet');

// ============================================================
// Wallet Repository — Data access layer cho Wallet
// ============================================================

exports.findByUserId = (userId) => {
    return Wallet.findOne({ userId });
};

exports.findById = (id) => {
    return Wallet.findById(id);
};

/**
 * Tạo ví mới cho user (gọi khi register)
 */
exports.create = (userId) => {
    const wallet = new Wallet({ userId, balance: 0 });
    return wallet.save();
};

/**
 * Cộng xu vào ví (nạp tiền)
 * @param {string} walletId
 * @param {number} amount - Số xu cần cộng (số dương)
 */
exports.addBalance = (walletId, amount) => {
    return Wallet.findByIdAndUpdate(
        walletId,
        { $inc: { balance: amount } },
        { new: true, runValidators: true }
    );
};

/**
 * Trừ xu khỏi ví (mua VIP)
 * @param {string} walletId
 * @param {number} amount - Số xu cần trừ (số dương, hàm sẽ tự trừ)
 */
exports.deductBalance = (walletId, amount) => {
    return Wallet.findByIdAndUpdate(
        walletId,
        { $inc: { balance: -amount } },
        { new: true, runValidators: true }
    );
};

/**
 * Khóa/mở khóa ví
 */
exports.setLocked = (walletId, isLocked) => {
    return Wallet.findByIdAndUpdate(walletId, { isLocked }, { new: true });
};
