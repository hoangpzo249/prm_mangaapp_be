const User = require('../models/User');

// ============================================================
// User Repository — Data access layer cho User
// ============================================================

exports.findById = (id) => {
    return User.findById(id).select('-password');
};

exports.findByIdWithPassword = (id) => {
    return User.findById(id);
};

exports.findByUsername = (username) => {
    return User.findOne({ username });
};

exports.findByEmail = (email) => {
    return User.findOne({ email });
};

exports.findAll = () => {
    return User.find({}).select('-password');
};

exports.create = (data) => {
    const user = new User(data);
    return user.save();
};

exports.update = (id, data) => {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select('-password');
};

exports.delete = (id) => {
    return User.findByIdAndDelete(id);
};

/**
 * Gia hạn VIP cho user
 * Nếu đang VIP (vipUntil > now) → cộng thêm ngày
 * Nếu hết hạn hoặc chưa mua → tính từ now
 * @param {string} userId
 * @param {number} durationDays - Số ngày VIP cần thêm
 */
exports.extendVip = async (userId, durationDays) => {
    const user = await User.findById(userId);
    if (!user) return null;

    const now = new Date();
    // Nếu đang VIP → cộng thêm, nếu hết hạn → tính từ now
    const baseDate = (user.vipUntil && user.vipUntil > now) ? user.vipUntil : now;
    const newVipUntil = new Date(baseDate);
    newVipUntil.setDate(newVipUntil.getDate() + durationDays);

    user.vipUntil = newVipUntil;
    return user.save();
};
