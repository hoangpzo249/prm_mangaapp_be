const notificationService = require('../services/notificationService');

// ============================================================
// Notification Controller — Thông báo
// ============================================================

exports.getNotifications = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await notificationService.getNotifications(req.user.id, page, limit);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await notificationService.markAsRead(req.params.id, req.user.id);
        res.json(notification);
    } catch (error) {
        next(error);
    }
};

exports.markAllAsRead = async (req, res, next) => {
    try {
        const result = await notificationService.markAllAsRead(req.user.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
