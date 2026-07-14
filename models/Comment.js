const mongoose = require('mongoose');

// ============================================================
// Comment Model — Bình luận truyện / chapter
// ============================================================
// - Hỗ trợ nested comments (reply) qua parentId
// - chapterId tùy chọn: null = comment chung cho truyện,
//   có giá trị = comment cho chapter cụ thể
// ============================================================

const commentSchema = new mongoose.Schema({
    // Người bình luận
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'userId là bắt buộc']
    },

    // Truyện được bình luận
    storyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story',
        required: [true, 'storyId là bắt buộc']
    },

    // Chapter cụ thể (tùy chọn) — null nếu comment chung cho truyện
    chapterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter',
        default: null
    },

    // Nội dung bình luận
    content: {
        type: String,
        required: [true, 'Nội dung bình luận là bắt buộc']
    },

    // Comment cha — null nếu là comment gốc, có giá trị nếu là reply
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },

    // Số lượt thích
    likesCount: {
        type: Number,
        default: 0
    },

    // Trạng thái ẩn do bị report
    isHidden: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

// ============================================================
// Indexes
// ============================================================
// Phân trang comment theo truyện, mới nhất trước
commentSchema.index({ storyId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
