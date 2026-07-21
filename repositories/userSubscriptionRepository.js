const UserSubscription = require('../models/UserSubscription');

// ============================================================
// UserSubscription Repository — Data access layer
// ============================================================

/** Lấy lịch sử đăng ký VIP của user */
exports.findByUserId = (userId) => {
    return UserSubscription.find({ userId })
        .populate('packageId', 'name durationDays priceCoins')
        .sort({ createdAt: -1 })
        .lean();
};

/** Lấy các gói đang active của user */
exports.findActiveByUserId = (userId) => {
    return UserSubscription.find({ userId, status: 'ACTIVE' })
        .populate('packageId', 'name durationDays priceCoins')
        .lean();
};

exports.create = (data) => {
    const subscription = new UserSubscription(data);
    return subscription.save();
};

/** Đánh dấu các gói hết hạn */
exports.expireOutdated = () => {
    return UserSubscription.updateMany(
        { status: 'ACTIVE', endDate: { $lt: new Date() } },
        { status: 'EXPIRED' }
    );
};

/**
 * Lọc trong tập userIds những ai đã từng mua VIP (có ít nhất 1 subscription).
 * Dùng cho refund policy: chỉ hoàn xu cho user đã từng là VIP.
 */
exports.filterUsersEverSubscribed = async (userIds) => {
    if (!userIds || userIds.length === 0) return [];
    const rows = await UserSubscription.aggregate([
        { $match: { userId: { $in: userIds } } },
        { $group: { _id: '$userId' } }
    ]);
    return rows.map(r => r._id);
};
