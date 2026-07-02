const mongoose = require('mongoose');

// ============================================================
// User Model — Quản lý tài khoản người dùng
// ============================================================
// - Virtual `isVip` tự động tính từ `vipUntil` (không lưu trong DB)
// - Password nên được hash ở controller trước khi lưu
// ============================================================

const userSchema = new mongoose.Schema({
    // Tên đăng nhập — bắt buộc, duy nhất, tự động viết thường & trim
    username: {
        type: String,
        required: [true, 'Username là bắt buộc'],
        unique: true,
        lowercase: true,
        trim: true
    },

    // Email đăng nhập
    email: {
        type: String,
        required: true,
        unique: true,
        immutable: true, // Không cho phép đổi sau khi tạo
        match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
        trim: true,
        lowercase: true
    },

    // Mật khẩu (đã được băm bởi bcrypt)
    password: {
        type: String,
        required: [true, 'Password là bắt buộc']
    },

    // Họ tên đầy đủ
    fullName: {
        type: String
    },

    // Vai trò: user thường hoặc admin
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    // Ngày hết hạn VIP — null nghĩa là chưa từng mua VIP
    vipUntil: {
        type: Date,
        default: null
    },

    // Trạng thái bị cấm — admin có thể ban user
    isBanned: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true,
    // Bật virtuals khi convert sang JSON/Object (để isVip xuất hiện trong response)
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ============================================================
// Virtual: isVip
// Trả về true nếu vipUntil tồn tại VÀ chưa hết hạn
// ============================================================
userSchema.virtual('isVip').get(function () {
    return this.vipUntil != null && this.vipUntil > new Date();
});

module.exports = mongoose.model('User', userSchema);