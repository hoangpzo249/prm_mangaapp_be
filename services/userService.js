const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userRepo = require('../repositories/userRepository');
const walletRepo = require('../repositories/walletRepository');
const AppError = require('../utils/AppError');
const { sendEmail } = require('../utils/email');

// ============================================================
// User Service — CRUD User (chủ yếu Admin)
// ============================================================

// Helper kiểm tra và clear VIP nếu hết hạn (Lazy loading)
exports.checkAndClearExpiredVip = async (user) => {
    if (!user) return user;
    if (user.vipUntil && user.vipUntil < new Date()) {
        user.vipUntil = null;
        await userRepo.update(user._id, { vipUntil: null });
    }
    return user;
};

/** Lấy thông tin cá nhân */
exports.getMe = async (userId) => {
    let user = await userRepo.findById(userId);
    if (!user) throw new AppError('User không tồn tại', 404);

    // Lazy load: Check và xoá VIP nếu hết hạn
    user = await exports.checkAndClearExpiredVip(user);

    const wallet = await walletRepo.findByUserId(userId);

    return {
        ...user.toObject(),
        wallet: wallet ? { balance: wallet.balance, isLocked: wallet.isLocked } : null
    };
};

/** User tự cập nhật thông tin profile */
exports.updateProfile = async (userId, data) => {
    const allowedFields = {};
    if (data.fullName !== undefined) allowedFields.fullName = data.fullName;
    if (data.avatar !== undefined) allowedFields.avatar = data.avatar;

    const user = await userRepo.update(userId, allowedFields);
    if (!user) throw new AppError('User không tồn tại', 404);

    return user;
};

/** Admin: Lấy danh sách tất cả users */
exports.getAllUsers = async () => {
    return userRepo.findAll();
};

/** Admin: Tạo user mới + wallet */
exports.adminCreateUser = async (data) => {
    console.log('ADMIN CREATE USER DATA:', data);
    const existing = await userRepo.findByUsername(data.username);
    if (existing) throw new AppError('Username đã tồn tại', 400);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const user = await userRepo.create({
        username: data.username,
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        role: data.role ?? 'user',
        isBanned: data.isBanned ?? false,
    });

    await walletRepo.create(user._id);
    return user;
};

/** Admin: Cập nhật user */
exports.adminUpdateUser = async (userId, data) => {
    const allowedFields = {};
    if (data.isBanned !== undefined) allowedFields.isBanned = data.isBanned;

    const user = await userRepo.update(userId, allowedFields);
    if (!user) throw new AppError('User không tồn tại', 404);

    return user;
};

/** Admin: Xóa user */
exports.adminDeleteUser = async (userId) => {
    const user = await userRepo.delete(userId);
    if (!user) throw new AppError('User không tồn tại', 404);
    return { message: 'Xóa user thành công' };
};

/** Admin: Reset password cho user */
exports.adminResetPassword = async (userId) => {
    const user = await userRepo.findById(userId);
    if (!user) throw new AppError('User không tồn tại', 404);

    if (!user.email) {
        throw new AppError('Người dùng chưa có email để gửi mật khẩu mới', 400);
    }

    const newPassword = crypto.randomBytes(8).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await userRepo.update(userId, { password: hashedPassword });

    const subject = 'Mật khẩu mới từ hệ thống Manga App';
    const text = `Mật khẩu mới của bạn là: ${newPassword}. Vui lòng đổi lại sau khi đăng nhập.`;
    const html = `<p>Mật khẩu mới của bạn là: <b>${newPassword}</b></p><p>Vui lòng đổi lại sau khi đăng nhập.</p>`;

    await sendEmail(user.email, subject, text, html);

    return { message: 'Đã reset mật khẩu và gửi mật khẩu mới qua email' };
};
