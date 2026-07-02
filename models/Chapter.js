const mongoose = require('mongoose');

// ============================================================
// Chapter Model — Các chapter (tập) của truyện
// ============================================================
// - post('save') → tự động tăng Story.chapterCount
// - post('findOneAndDelete') → tự động giảm Story.chapterCount
// - isVip = true → chỉ user có VIP mới xem được
// ============================================================

const chapterSchema = new mongoose.Schema({
    // Truyện chứa chapter này
    storyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story',
        required: [true, 'storyId là bắt buộc']
    },

    // Số thứ tự chapter
    chapterNumber: {
        type: Number,
        required: [true, 'Số chapter là bắt buộc']
    },

    // Tiêu đề chapter (tùy chọn)
    chapterTitle: {
        type: String
    },

    // Danh sách URL ảnh các trang
    image: [{
        type: String
    }],

    // Chapter dành cho VIP — chỉ user có isVip = true mới đọc được
    isVip: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

// ============================================================
// Indexes
// ============================================================
// Mỗi truyện không được có 2 chapter trùng số
chapterSchema.index({ storyId: 1, chapterNumber: 1 }, { unique: true });

// ============================================================
// Mongoose Hooks
// ============================================================

// Sau khi tạo chapter mới → tăng chapterCount trong Story
chapterSchema.post('save', async function (doc) {
    // Chỉ tăng khi document mới được tạo (không phải update)
    // Kiểm tra bằng cách so sánh createdAt và updatedAt
    if (doc.createdAt.getTime() === doc.updatedAt.getTime()) {
        const Story = mongoose.model('Story');
        await Story.findByIdAndUpdate(doc.storyId, {
            $inc: { chapterCount: 1 }
        });
    }
});

// Sau khi xóa chapter → giảm chapterCount trong Story
chapterSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        const Story = mongoose.model('Story');
        await Story.findByIdAndUpdate(doc.storyId, {
            $inc: { chapterCount: -1 }
        });
    }
});

module.exports = mongoose.model('Chapter', chapterSchema);