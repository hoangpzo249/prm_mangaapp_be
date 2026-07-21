const mongoose = require('mongoose');

// ============================================================
// VipPackage Model — Danh mục các gói VIP (Admin quản lý)
// ============================================================
// - Admin tạo/sửa/ẩn các gói VIP bán trên app
// - User chọn gói → trừ xu từ Wallet → tạo UserSubscription
// - isActive = false để ẩn gói mà không cần xóa
// ============================================================

const vipPackageSchema = new mongoose.Schema({
    // Tên gói — hiển thị trên app (VD: "Gói VIP 1 Tháng")
    name: {
        type: String,
        required: [true, 'Tên gói là bắt buộc'],
        unique: true
    },

    // Số ngày được hưởng VIP (VD: 30, 90, 365)
    durationDays: {
        type: Number,
        required: [true, 'Số ngày VIP là bắt buộc'],
        min: [1, 'Số ngày VIP phải lớn hơn 0']
    },

    // Giá gói tính bằng xu
    priceCoins: {
        type: Number,
        required: [true, 'Giá xu là bắt buộc'],
        min: [0, 'Giá xu không được âm']
    },

    // Mô tả chi tiết gói
    description: {
        type: String
    },

    // Gói còn bán hay đã ẩn — admin toggle
    isActive: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('VipPackage', vipPackageSchema);
