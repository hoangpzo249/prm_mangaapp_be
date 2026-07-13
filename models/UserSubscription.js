const mongoose = require('mongoose');

// ============================================================
// UserSubscription Model — Lịch sử đăng ký gói VIP
// ============================================================
// - Lưu vết chi tiết mỗi lần user MUA gói VIP
// - Mỗi record = 1 lần mua gói, có startDate/endDate riêng
// - User.vipUntil = endDate xa nhất trong các gói ACTIVE
// ============================================================

const userSubscriptionSchema = new mongoose.Schema({
    // Ai mua
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'userId là bắt buộc']
    },

    // Mua gói nào
    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VipPackage',
        required: [true, 'packageId là bắt buộc']
    },

    // Liên kết với giao dịch trừ xu tương ứng
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: [true, 'transactionId là bắt buộc']
    },

    // Ngày bắt đầu có hiệu lực
    startDate: {
        type: Date,
        required: [true, 'Ngày bắt đầu là bắt buộc']
    },

    // Ngày hết hiệu lực
    endDate: {
        type: Date,
        required: [true, 'Ngày hết hạn là bắt buộc']
    },

    // Trạng thái của riêng gói đăng ký này
    status: {
        type: String,
        enum: ['ACTIVE', 'EXPIRED'],
        default: 'ACTIVE'
    }

}, {
    timestamps: true
});

// ============================================================
// Indexes
// ============================================================
// Tra cứu nhanh các gói đang active của user
userSubscriptionSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('UserSubscription', userSubscriptionSchema);
