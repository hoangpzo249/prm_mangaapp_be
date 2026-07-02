const mongoose = require('mongoose');

// ============================================================
// Story Model — Thông tin truyện tranh
// ============================================================
// - averageRating, ratingCount, bookmarkCount KHÔNG lưu trong DB
//   → Các giá trị này sẽ được tính toán ở Repository layer khi query
// - chapterCount được cập nhật tự động bởi Chapter hooks
// ============================================================

const storySchema = new mongoose.Schema({
    // Tên truyện — bắt buộc
    title: {
        type: String,
        required: [true, 'Tên truyện là bắt buộc']
    },

    // URL slug — bắt buộc, duy nhất (dùng cho SEO-friendly URLs)
    slug: {
        type: String,
        required: [true, 'Slug là bắt buộc'],
        unique: true
    },

    // Tác giả
    author: {
        type: String,
        default: 'Đang cập nhật'
    },

    // Ảnh bìa (URL)
    thumbnail: {
        type: String
    },

    // Mô tả nội dung truyện
    description: {
        type: String,
        default: 'Đang cập nhật...'
    },

    // Danh sách thể loại
    genres: [{
        type: String
    }],

    // Tổng lượt xem
    views: {
        type: Number,
        default: 0
    },

    // Tổng số chapter — tự động cập nhật bởi Chapter post-save/post-delete hooks
    chapterCount: {
        type: Number,
        default: 0
    },

    // Trạng thái truyện
    status: {
        type: String,
        enum: ['Ongoing', 'Complete'],
        default: 'Ongoing'
    }

}, {
    timestamps: true
});

// ============================================================
// Indexes
// ============================================================
// Sắp xếp theo lượt xem giảm dần (trang Hot/Trending)
storySchema.index({ views: -1 });

// Tìm truyện theo thể loại
storySchema.index({ genres: 1 });

module.exports = mongoose.model('Story', storySchema);