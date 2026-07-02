const walletRepo = require('../repositories/walletRepository');
const AppError = require('../utils/AppError');

// ============================================================
// Wallet Service — Quản lý ví xu
// ============================================================

/** Lấy thông tin ví của user */
exports.getWallet = async (userId) => {
    const wallet = await walletRepo.findByUserId(userId);
    if (!wallet) throw new AppError('Ví không tồn tại', 404);
    return wallet;
};

/** Kiểm tra ví có đủ xu và không bị khóa */
exports.validateForPurchase = async (userId, requiredCoins) => {
    const wallet = await walletRepo.findByUserId(userId);
    if (!wallet) throw new AppError('Ví không tồn tại', 404);
    if (wallet.isLocked) throw new AppError('Ví đang bị khóa', 403);
    if (wallet.balance < requiredCoins) {
        throw new AppError('Không đủ xu trong ví', 400);
    }
    return wallet;
};
