const mongoose = require('mongoose');

// ============================================================
// Genre Model — Thể loại truyện tranh
// ============================================================
// - name: tên hiển thị (VD: "Hành động")
// - slug: URL-friendly, unique (VD: "hanh-dong")
// - isActive: cờ ẩn/hiện trên client (soft-disable)
// ============================================================

const genreSchema = new mongoose.Schema({
    // Tên hiển thị — bắt buộc, duy nhất
    name: {
        type: String,
        required: [true, 'Tên thể loại là bắt buộc'],
        trim: true,
        unique: true
    },

    // URL slug — bắt buộc, duy nhất
    slug: {
        type: String,
        required: [true, 'Slug là bắt buộc'],
        unique: true
    },

    // Cờ ẩn/hiện (admin có thể tắt tạm mà không xóa)
    isActive: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

// ============================================================
// Indexes
// ============================================================
genreSchema.index({ isActive: 1, name: 1 });

module.exports = mongoose.model('Genre', genreSchema);
