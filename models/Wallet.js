const mongoose = require('mongoose');

// ============================================================
// Wallet Model — Ví xu của người dùng (tách riêng khỏi User)
// ============================================================
// - Mỗi user chỉ có DUY NHẤT 1 ví (userId unique)
// - balance luôn >= 0 (validate ở schema level)
// - isLocked dùng để khóa ví khi phát hiện gian lận nạp lậu
// ============================================================

const walletSchema = new mongoose.Schema({
    // Chủ sở hữu ví — liên kết 1-1 với User
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'userId là bắt buộc'],
        unique: true
    },

    // Số dư xu hiện tại — không được âm
    balance: {
        type: Number,
        default: 0,
        validate: {
            validator: function (value) {
                return value >= 0;
            },
            message: 'Số dư ví không được âm'
        }
    },

    // Khóa ví — admin bật khi phát hiện gian lận
    isLocked: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

// Index: Tìm ví theo userId nhanh (đã unique ở trên, Mongoose tự tạo index)

module.exports = mongoose.model('Wallet', walletSchema);
