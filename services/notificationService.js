const notificationRepo = require('../repositories/notificationRepository');
const AppError = require('../utils/AppError');

// ============================================================
// Notification Service — Thông báo
// ============================================================

/** Lấy thông báo của user (phân trang) */
exports.getNotifications = async (userId, page, limit) => {
    const [notifications, unreadCount] = await Promise.all([
        notificationRepo.findByUserId(userId, page, limit),
        notificationRepo.countUnread(userId)
    ]);

    return { notifications, unreadCount };
};

/** Đánh dấu 1 thông báo đã đọc */
exports.markAsRead = async (notificationId, userId) => {
    const notification = await notificationRepo.findById(notificationId);
    if (!notification) throw new AppError('Thông báo không tồn tại', 404);
    if (notification.userId.toString() !== userId) {
        throw new AppError('Không có quyền', 403);
    }

    return notificationRepo.markAsRead(notificationId);
};

/** Đánh dấu tất cả đã đọc */
exports.markAllAsRead = async (userId) => {
    await notificationRepo.markAllAsRead(userId);
    return { message: 'Đã đọc tất cả thông báo' };
};

/** Gửi thông báo (dùng bởi các service khác) */
exports.sendNotification = async (data) => {
    return notificationRepo.create(data);
};
