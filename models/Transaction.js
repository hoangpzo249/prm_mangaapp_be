const mongoose = require('mongoose');

// ============================================================
// Transaction Model — Quản lý giao dịch nạp xu & mua VIP
// ============================================================
// - DEPOSIT: Nạp tiền thật (VND) qua cổng thanh toán → nhận xu
// - BUY_VIP: Trừ xu từ Wallet → mua gói VIP
// - Mỗi transaction liên kết trực tiếp với Wallet bị tác động
// - gatewayTransactionId: Mã từ MoMo/ZaloPay (sparse unique)
// - appTransactionId: Mã đơn hàng tự sinh (sparse unique)
// ============================================================

const transactionSchema = new mongoose.Schema({
    // Người thực hiện giao dịch
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'userId là bắt buộc']
    },

    // Ví bị tác động biến động số dư
    walletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: [true, 'walletId là bắt buộc']
    },

    // Loại giao dịch
    type: {
        type: String,
        enum: ['DEPOSIT', 'BUY_VIP'],
        required: [true, 'Loại giao dịch là bắt buộc']
    },

    // Phương thức thanh toán
    paymentMethod: {
        type: String,
        enum: ['MOMO', 'ZALOPAY', 'VNPAY', 'BANK_TRANSFER', 'COIN_SYSTEM'],
        required: [true, 'Phương thức thanh toán là bắt buộc']
    },

    // Số tiền VND thực tế (chỉ có khi DEPOSIT qua cổng thanh toán)
    amountMoney: {
        type: Number,
        default: 0
    },

    // Số xu biến động: DEPOSIT → số dương, BUY_VIP → số âm
    amountCoins: {
        type: Number,
        required: [true, 'Số xu biến động là bắt buộc']
    },

    // Trạng thái giao dịch
    status: {
        type: String,
        enum: ['PENDING', 'SUCCESS', 'FAILED'],
        default: 'PENDING'
    },

    // Gói VIP liên kết (chỉ có khi type = 'BUY_VIP')
    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VipPackage',
        default: null
    },

    // Mã giao dịch từ đối tác cổng thanh toán (MoMo, ZaloPay...)
    gatewayTransactionId: {
        type: String
    },

    // Mã đơn hàng tự sinh của hệ thống
    appTransactionId: {
        type: String
    },

    // Ghi chú / mô tả giao dịch
    description: {
        type: String
    }

}, {
    timestamps: true
});

// ============================================================
// Indexes
// ============================================================
// Sparse Unique: cho phép nhiều null, nhưng unique khi có giá trị
transactionSchema.index(
    { gatewayTransactionId: 1 },
    { unique: true, sparse: true }
);

transactionSchema.index(
    { appTransactionId: 1 },
    { unique: true, sparse: true }
);

// Lịch sử giao dịch của user, mới nhất trước
transactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
