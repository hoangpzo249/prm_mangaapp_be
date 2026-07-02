const Notification = require('../models/Notification');

// ============================================================
// Notification Repository — Data access layer cho Notification
// ============================================================

/** Lấy thông báo của user, phân trang */
exports.findByUserId = (userId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    return Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};

/** Đếm thông báo chưa đọc */
exports.countUnread = (userId) => {
    return Notification.countDocuments({ userId, isRead: false });
};

exports.findById = (id) => {
    return Notification.findById(id);
};

exports.create = (data) => {
    const notification = new Notification(data);
    return notification.save();
};

/** Đánh dấu 1 thông báo đã đọc */
exports.markAsRead = (id) => {
    return Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
};

/** Đánh dấu tất cả thông báo của user đã đọc */
exports.markAllAsRead = (userId) => {
    return Notification.updateMany({ userId, isRead: false }, { isRead: true });
};
