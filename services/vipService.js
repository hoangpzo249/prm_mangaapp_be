const vipPackageRepo = require('../repositories/vipPackageRepository');
const userSubRepo = require('../repositories/userSubscriptionRepository');
const walletRepo = require('../repositories/walletRepository');
const transactionRepo = require('../repositories/transactionRepository');
const userRepo = require('../repositories/userRepository');
const AppError = require('../utils/AppError');

// ============================================================
// VIP Service — Mua gói VIP (orchestration phức tạp nhất)
// ============================================================

/** Lấy danh sách gói VIP đang bán */
exports.getPackages = async () => {
    return vipPackageRepo.findActive();
};

/**
 * Mua gói VIP — Luồng orchestration:
 * 1. Kiểm tra gói tồn tại + active
 * 2. Kiểm tra ví không khóa + đủ xu
 * 3. Trừ xu
 * 4. Tạo transaction
 * 5. Tạo subscription
 * 6. Gia hạn User.vipUntil
 */
exports.buyVipPackage = async (userId, packageId) => {
    // 1. Lấy gói VIP
    const pkg = await vipPackageRepo.findById(packageId);
    if (!pkg || !pkg.isActive) {
        throw new AppError('Gói VIP không tồn tại hoặc đã ngừng bán', 404);
    }

    // 2. Kiểm tra ví
    const wallet = await walletRepo.findByUserId(userId);
    if (!wallet) throw new AppError('Ví không tồn tại', 404);
    if (wallet.isLocked) throw new AppError('Ví đang bị khóa', 403);
    if (wallet.balance < pkg.priceCoins) {
        throw new AppError(`Không đủ xu. Cần ${pkg.priceCoins} xu, hiện có ${wallet.balance} xu`, 400);
    }

    // 3. Trừ xu
    await walletRepo.deductBalance(wallet._id, pkg.priceCoins);

    // 4. Tạo transaction
    const transaction = await transactionRepo.create({
        userId,
        walletId: wallet._id,
        type: 'BUY_VIP',
        paymentMethod: 'COIN_SYSTEM',
        amountMoney: 0,
        amountCoins: -pkg.priceCoins, // Số âm khi mua VIP
        status: 'SUCCESS',
        packageId: pkg._id,
        description: `Mua ${pkg.name}`
    });

    // 5. Tạo subscription
    const now = new Date();
    const user = await userRepo.findByIdWithPassword(userId);
    const startDate = (user.vipUntil && user.vipUntil > now) ? user.vipUntil : now;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + pkg.durationDays);

    const subscription = await userSubRepo.create({
        userId,
        packageId: pkg._id,
        transactionId: transaction._id,
        startDate,
        endDate,
        status: 'ACTIVE'
    });

    // 6. Gia hạn VIP cho user
    await userRepo.extendVip(userId, pkg.durationDays);

    return {
        message: `Mua ${pkg.name} thành công!`,
        transaction,
        subscription
    };
};

/** Lấy lịch sử đăng ký VIP của user */
exports.getMySubscriptions = async (userId) => {
    return userSubRepo.findByUserId(userId);
};

// --- ADMIN METHODS ---

exports.getAllPackagesAdmin = async () => {
    return vipPackageRepo.findAll();
};

exports.createPackage = async (data) => {
    return vipPackageRepo.create(data);
};

exports.updatePackage = async (id, data) => {
    const pkg = await vipPackageRepo.update(id, data);
    if (!pkg) throw new AppError('Gói VIP không tồn tại', 404);
    return pkg;
};

exports.deletePackage = async (id) => {
    const pkg = await vipPackageRepo.delete(id);
    if (!pkg) throw new AppError('Gói VIP không tồn tại', 404);
    return { message: 'Xóa gói VIP thành công' };
};
