const AppError = require('../utils/AppError');

// ============================================================
// Authorize Middleware — Kiểm tra quyền truy cập theo role
// ============================================================
// Sử dụng SAU middleware auth:
// router.delete('/:id', auth, authorize('admin'), controller.delete)
// ============================================================

/**
 * Tạo middleware kiểm tra role
 * @param  {...string} roles - Các role được phép (VD: 'admin')
 * @returns {Function} Express middleware
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        // auth middleware đã gắn req.user rồi
        if (!req.user) {
            return res.status(401).json({ message: 'Chưa xác thực' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Bạn không có quyền truy cập tài nguyên này'
            });
        }

        next();
    };
};

module.exports = { authorize };
