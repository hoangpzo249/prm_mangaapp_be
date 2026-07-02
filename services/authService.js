const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/userRepository');
const walletRepo = require('../repositories/walletRepository');
const AppError = require('../utils/AppError');

// ============================================================
// Auth Service — Đăng ký, Đăng nhập, JWT
// ============================================================

/**
 * Đăng ký tài khoản mới + tạo Wallet
 */
exports.register = async ({ username, email, password, fullName }) => {
    // Kiểm tra username đã tồn tại
    const existing = await userRepo.findByUsername(username);
    if (existing) {
        throw new AppError('Username đã tồn tại', 400);
    }

    // Kiểm tra email đã tồn tại
    const existingEmail = await userRepo.findByEmail(email);
    if (existingEmail) {
        throw new AppError('Email đã tồn tại', 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user
    const user = await userRepo.create({
        username,
        email,
        password: hashedPassword,
        fullName
    });

    // Tạo ví cho user mới
    await walletRepo.create(user._id);

    return { message: 'Đăng ký thành công' };
};

/**
 * Đăng nhập → trả về JWT token + user info
 */
exports.login = async ({ username, password }) => {
    const user = await userRepo.findByUsername(username);
    if (!user) {
        throw new AppError('Sai tên đăng nhập hoặc mật khẩu', 401);
    }

    if (user.isBanned) {
        throw new AppError('Tài khoản đã bị cấm', 403);
    }

    // So sánh password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError('Sai tên đăng nhập hoặc mật khẩu', 401);
    }

    // Tạo JWT token
    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    return {
        token,
        user: {
            id: user._id,
            username: user.username,
            fullName: user.fullName,
            isVip: user.isVip, // Virtual field
            role: user.role
        }
    };
};
