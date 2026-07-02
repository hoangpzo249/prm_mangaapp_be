// ============================================================
// AppError — Custom Error class cho toàn bộ ứng dụng
// ============================================================
// Service throw AppError với statusCode → Controller forward
// đến global error handler qua next(error)
//
// Ví dụ: throw new AppError('Không đủ xu', 400);
// ============================================================

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Phân biệt lỗi nghiệp vụ vs lỗi hệ thống

        // Giữ stack trace chính xác
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
