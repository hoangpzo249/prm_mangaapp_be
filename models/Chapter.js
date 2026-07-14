const mongoose = require('mongoose');

// ============================================================
// Chapter Model — Các chapter (tập) của truyện
// ============================================================
// - post('save') → tự động tăng Story.chapterCount khi tạo mới
// - Xóa chapter là SOFT DELETE (set isHidden=true) → Story.chapterCount
//   được điều chỉnh thủ công tại chapterService
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
    },

    // Trạng thái ẩn — dùng cho soft delete (admin xoá) hoặc ẩn do report
    isHidden: {
        type: Boolean,
        default: false
    },

    // Đánh dấu chapter bị ẩn do cascade từ Story bị ẩn
    // → Khi restore story, chỉ bỏ ẩn những chapter có cờ này = true
    //   để không vô tình khôi phục chapter bị admin ẩn thủ công trước đó
    hiddenByStory: {
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

module.exports = mongoose.model('Chapter', chapterSchema);