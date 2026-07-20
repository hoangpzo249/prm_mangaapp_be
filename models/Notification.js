const mongoose = require('mongoose');

// ============================================================
// Notification Model — Thông báo cho người dùng
// ============================================================
// - NEW_CHAPTER: Truyện đã bookmark có chapter mới
// - REPLY_COMMENT: Có người reply comment của bạn
// - SYSTEM: Thông báo hệ thống (bảo trì, khuyến mãi...)
// - REFUND: Bồi thường xu khi truyện/chapter VIP đã đọc bị ẩn
// ============================================================

const notificationSchema = new mongoose.Schema({
    // Người nhận thông báo
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'userId là bắt buộc']
    },

    // Loại thông báo
    type: {
        type: String,
        enum: ['NEW_CHAPTER', 'REPLY_COMMENT', 'SYSTEM', 'REFUND'],
        required: [true, 'Loại thông báo là bắt buộc']
    },

    // Tiêu đề thông báo
    title: {
        type: String,
        required: [true, 'Tiêu đề là bắt buộc']
    },

    // Nội dung chi tiết
    message: {
        type: String,
        required: [true, 'Nội dung thông báo là bắt buộc']
    },

    // Deep link — URL/route để điều hướng khi user tap vào thông báo
    link: {
        type: String
    },

    // Đã đọc chưa
    isRead: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

// ============================================================
// Indexes
// ============================================================
// Lấy thông báo chưa đọc của user, mới nhất trước
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
