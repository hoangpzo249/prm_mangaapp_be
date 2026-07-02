const mongoose = require('mongoose');

// ============================================================
// History Model — Lịch sử đọc truyện
// ============================================================
// - Mỗi user chỉ có 1 record history cho mỗi truyện (upsert)
// - lastChapterId lưu chapter đọc gần nhất để user quay lại đọc tiếp
// ============================================================

const historySchema = new mongoose.Schema({
    // Người đọc
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'userId là bắt buộc']
    },

    // Truyện đã đọc
    storyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story',
        required: [true, 'storyId là bắt buộc']
    },

    // Chapter đọc gần nhất — dùng để "Đọc tiếp"
    lastChapterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter',
        required: [true, 'lastChapterId là bắt buộc']
    }

}, {
    timestamps: true
});

// ============================================================
// Indexes
// ============================================================
// Mỗi user chỉ có 1 bản ghi history cho mỗi truyện
historySchema.index({ userId: 1, storyId: 1 }, { unique: true });

module.exports = mongoose.model('History', historySchema);