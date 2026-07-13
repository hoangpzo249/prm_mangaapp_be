const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const rateLimiter = require('../middlewares/rateLimiter');
const { auth } = require('../middlewares/auth');
const { registerRules, sendRegisterOtpRules, loginRules, forgotPasswordRules, resetPasswordRules, changePasswordRules } = require('../middlewares/validators/authValidator');


const registerLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Bạn đã thử đăng ký quá nhiều lần, vui lòng thử lại sau 15 phút'
});


const loginLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Bạn đã thử đăng nhập quá nhiều lần, vui lòng thử lại sau 15 phút'
});

const forgotPasswordLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: 'Bạn đã thử lấy lại mật khẩu quá nhiều lần, vui lòng thử lại sau 15 phút'
});

router.post('/register/send-otp', registerLimiter, validate(sendRegisterOtpRules), authController.sendRegisterOtp);
router.post('/register', registerLimiter, validate(registerRules), authController.register);
router.post('/login', loginLimiter, validate(loginRules), authController.login);
router.post('/forgot-password', forgotPasswordLimiter, validate(forgotPasswordRules), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordRules), authController.resetPassword);
router.post('/change-password', auth, validate(changePasswordRules), authController.changePassword);

module.exports = router;