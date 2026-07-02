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
