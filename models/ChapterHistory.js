const mongoose = require('mongoose');

// ============================================================
// ChapterHistory Model — Ghi nhận từng lần user MỞ chapter
// ============================================================
// - Khác với History (1 record / user / story), collection này lưu
//   1 record / user / chapter → dùng cho refund flow công bằng.
// - `readWhileVip`: snapshot trạng thái VIP tại thời điểm đọc.
//   Nếu chapter là VIP và user đọc thành công → true.
// - Refund chỉ áp dụng cho user có record với readWhileVip=true.
// ============================================================

const chapterHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    chapterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter',
        required: true
    },
    storyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story',
        required: true
    },
    // Snapshot: user có VIP active tại thời điểm đọc chapter này?
    readWhileVip: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Mỗi user chỉ có 1 record cho mỗi chapter (upsert khi đọc lại)
chapterHistorySchema.index({ userId: 1, chapterId: 1 }, { unique: true });
// Truy vấn nhanh: ai đã đọc chapter X với VIP?
chapterHistorySchema.index({ chapterId: 1, readWhileVip: 1 });

module.exports = mongoose.model('ChapterHistory', chapterHistorySchema);
