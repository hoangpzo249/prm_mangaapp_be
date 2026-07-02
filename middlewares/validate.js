// ============================================================
// Validate Middleware — Chạy validation rules trước khi vào controller
// ============================================================
// Nhận array các rule { field, location, check, message }
// Trả 400 + danh sách lỗi nếu có field không hợp lệ
//
// Sử dụng: router.post('/', validate(createRules), controller.create)
// ============================================================

/**
 * @typedef {Object} ValidationRule
 * @property {string} field - Tên field cần validate
 * @property {string} [location='body'] - Vị trí: 'body', 'params', 'query'
 * @property {Function} check - Hàm kiểm tra (value) => boolean, true = hợp lệ
 * @property {string} message - Thông báo lỗi khi không hợp lệ
 * @property {boolean} [optional=false] - Nếu true, bỏ qua khi field không tồn tại
 */

/**
 * Tạo middleware validate từ danh sách rules
 * @param {ValidationRule[]} rules
 * @returns {Function} Express middleware
 */
const validate = (rules) => {
    return (req, res, next) => {
        const errors = [];

        for (const rule of rules) {
            const location = rule.location || 'body';
            const source = req[location];
            const value = source ? source[rule.field] : undefined;

            // Bỏ qua field optional nếu không có giá trị
            if (rule.optional && (value === undefined || value === null)) {
                continue;
            }

            // Chạy hàm check
            if (!rule.check(value)) {
                errors.push({
                    field: rule.field,
                    message: rule.message
                });
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Dữ liệu không hợp lệ',
                errors
            });
        }

        next();
    };
};

module.exports = validate;
