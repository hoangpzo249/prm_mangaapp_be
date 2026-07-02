const mongoose = require('mongoose');

// ============================================================
// Bookmark Model — Tủ truyện / Danh sách yêu thích
// ============================================================
// - Mỗi user chỉ bookmark 1 truyện 1 lần (unique compound index)
// - bookmarkCount của Story sẽ được tính ở Repository khi query
// ============================================================

const bookmarkSchema = new mongoose.Schema({
    // Người bookmark
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'userId là bắt buộc']
    },

    // Truyện được bookmark
    storyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story',
        required: [true, 'storyId là bắt buộc']
    }

}, {
    timestamps: true
});

// ============================================================
// Indexes
// ============================================================
// Mỗi user chỉ bookmark 1 truyện 1 lần
bookmarkSchema.index({ userId: 1, storyId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);