const bcrypt = require('bcrypt');
const userRepo = require('../repositories/userRepository');
const walletRepo = require('../repositories/walletRepository');
const AppError = require('../utils/AppError');

// ============================================================
// User Service — CRUD User (chủ yếu Admin)
// ============================================================

/** Lấy thông tin cá nhân */
exports.getMe = async (userId) => {
    const user = await userRepo.findById(userId);
    if (!user) throw new AppError('User không tồn tại', 404);

    const wallet = await walletRepo.findByUserId(userId);

    return {
        ...user.toObject(),
        wallet: wallet ? { balance: wallet.balance, isLocked: wallet.isLocked } : null
    };
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
    // Chỉ cho phép update các field an toàn
    const allowedFields = {};
    if (data.fullName !== undefined) allowedFields.fullName = data.fullName;
    if (data.role !== undefined) allowedFields.role = data.role;
    if (data.isBanned !== undefined) allowedFields.isBanned = data.isBanned;
    if (data.vipUntil !== undefined) allowedFields.vipUntil = data.vipUntil;

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
exports.adminResetPassword = async (userId, { newPassword }) => {
    if (!newPassword || newPassword.length < 6) {
        throw new AppError('Mật khẩu mới là bắt buộc và phải có ít nhất 6 ký tự', 400);
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const user = await userRepo.update(userId, { password: hashedPassword });
    if (!user) throw new AppError('User không tồn tại', 404);

    return { message: 'Đổi mật khẩu thành công' };
};
