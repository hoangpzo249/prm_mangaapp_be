const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

// ============================================================
// Auth Middleware — Xác thực JWT token
// ============================================================
// Sau middleware: req.user = { id, role }
// Sử dụng: router.get('/me', auth, controller.getMe)
// ============================================================

/**
 * Middleware bắt buộc đăng nhập — throw 401 nếu không có/sai token
 */
const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Token xác thực là bắt buộc', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);


        req.user = {
            id: decoded.id,
            role: decoded.role
        };

        next();
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
};

const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.user = null;
            return next();
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: decoded.id,
            role: decoded.role
        };
    } catch (error) {
        // Token không hợp lệ → coi như chưa đăng nhập
        req.user = null;
    }

    next();
};

module.exports = { auth, optionalAuth };
