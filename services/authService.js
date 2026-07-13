const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepo = require('../repositories/userRepository');
const walletRepo = require('../repositories/walletRepository');
const AppError = require('../utils/AppError');
const { sendEmail } = require('../utils/email');

// ============================================================
// Auth Service — Đăng ký, Đăng nhập, JWT
const Otp = require('../models/Otp');

/**
 * Gửi OTP để đăng ký tài khoản
 */
exports.sendRegisterOtp = async (email) => {
    const normalizedEmail = email.trim().toLowerCase();

    // Kiểm tra email đã tồn tại chưa
    const existingEmail = await userRepo.findByEmail(normalizedEmail);
    if (existingEmail) {
        throw new AppError('Email đã được sử dụng', 400);
    }

    // Tạo OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu/Cập nhật OTP vào DB
    await Otp.findOneAndUpdate(
        { email: normalizedEmail },
        { otp, createdAt: new Date() },
        { upsert: true, new: true }
    );

    // Gửi email
    const subject = 'Mã xác nhận đăng ký tài khoản';
    const text = `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 10 phút.`;
    const html = `<p>Mã OTP đăng ký của bạn là: <b>${otp}</b></p><p>Mã này sẽ hết hạn sau 10 phút.</p>`;

    await sendEmail(normalizedEmail, subject, text, html);
    return { message: 'Mã OTP đã được gửi đến email của bạn' };
};

/**
 * Đăng ký tài khoản mới + tạo Wallet (Yêu cầu có OTP)
 */
exports.register = async ({ username, email, password, fullName, otp }) => {
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedFullName = fullName ? fullName.trim() : undefined;

    // Kiểm tra OTP
    const otpRecord = await Otp.findOne({ email: normalizedEmail, otp });
    if (!otpRecord) {
        throw new AppError('Mã OTP không hợp lệ hoặc đã hết hạn', 400);
    }

    // Kiểm tra username đã tồn tại
    const existing = await userRepo.findByUsername(normalizedUsername);
    if (existing) {
        throw new AppError('Username đã tồn tại', 400);
    }

    // Kiểm tra email đã tồn tại
    const existingEmail = await userRepo.findByEmail(normalizedEmail);
    if (existingEmail) {
        throw new AppError('Email đã tồn tại', 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user
    const user = await userRepo.create({
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
        fullName: normalizedFullName
    });

    // Tạo ví cho user mới
    await walletRepo.create(user._id);

    // Xoá OTP sau khi dùng
    await Otp.deleteOne({ _id: otpRecord._id });

    return { message: 'Đăng ký thành công' };
};

/**
 * Đăng nhập → trả về JWT token + user info
 */
exports.login = async ({ username, password }) => {
    const normalizedUsername = username.trim().toLowerCase();
    const user = await userRepo.findByUsername(normalizedUsername);

    // Thông báo lỗi giống nhau dù sai username hay password, tránh lộ thông tin tài khoản nào tồn tại
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

/**
 * Quên mật khẩu: Gửi OTP qua email
 */
exports.forgotPassword = async (email) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await userRepo.findByEmail(normalizedEmail);

    if (!user) {
        throw new AppError('Không tìm thấy tài khoản với email này', 404);
    }

    // Tạo OTP ngẫu nhiên 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu OTP và thời gian hết hạn (VD: 10 phút) vào db
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10);

    await userRepo.update(user._id, {
        resetPasswordOtp: otp,
        resetPasswordExpires: expires
    });

    // Gửi email
    const subject = 'Mã xác nhận lấy lại mật khẩu';
    const text = `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 10 phút.`;
    const html = `<p>Mã OTP của bạn là: <b>${otp}</b></p><p>Mã này sẽ hết hạn sau 10 phút.</p>`;

    await sendEmail(normalizedEmail, subject, text, html);

    return { message: 'Mã OTP đã được gửi đến email của bạn' };
};

/**
 * Đặt lại mật khẩu với OTP
 */
exports.resetPassword = async ({ email, otp, newPassword }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await userRepo.findByEmail(normalizedEmail);

    if (!user) {
        throw new AppError('Không tìm thấy tài khoản', 404);
    }

    // Kiểm tra OTP
    if (user.resetPasswordOtp !== otp) {
        throw new AppError('Mã OTP không hợp lệ', 400);
    }

    // Kiểm tra thời hạn OTP
    if (user.resetPasswordExpires < new Date()) {
        throw new AppError('Mã OTP đã hết hạn', 400);
    }

    // Hash password mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật password và xóa OTP
    await userRepo.update(user._id, {
        password: hashedPassword,
        resetPasswordOtp: null,
        resetPasswordExpires: null
    });

    return { message: 'Đặt lại mật khẩu thành công' };
};

/**
 * Đổi mật khẩu khi đã đăng nhập (yêu cầu mật khẩu cũ)
 */
exports.changePassword = async (userId, { oldPassword, newPassword }) => {
    // Cần password (bị ẩn ở findById) để so sánh
    const user = await userRepo.findByIdWithPassword(userId);
    if (!user) {
        throw new AppError('User không tồn tại', 404);
    }

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        throw new AppError('Mật khẩu cũ không đúng', 400);
    }

    // Mật khẩu mới không được trùng mật khẩu cũ
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
        throw new AppError('Mật khẩu mới phải khác mật khẩu cũ', 400);
    }

    // Hash password mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await userRepo.update(user._id, { password: hashedPassword });

    return { message: 'Đổi mật khẩu thành công' };
};