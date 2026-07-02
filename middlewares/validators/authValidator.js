// ============================================================
// Auth Validator — Validation rules cho đăng ký / đăng nhập
// ============================================================

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

/** Rules cho POST /api/auth/register */
const registerRules = [
    {
        field: 'username',
        check: (v) => isNonEmptyString(v) && v.trim().length >= 3,
        message: 'Username là bắt buộc và tối thiểu 3 ký tự'
    },
    {
        field: 'email',
        check: (v) => isNonEmptyString(v) && /^\S+@\S+\.\S+$/.test(v),
        message: 'Email là bắt buộc và phải đúng định dạng'
    },
    {
        field: 'password',
        check: (v) => isNonEmptyString(v) && v.length >= 6,
        message: 'Password là bắt buộc và tối thiểu 6 ký tự'
    }
];

/** Rules cho POST /api/auth/login */
const loginRules = [
    {
        field: 'username',
        check: isNonEmptyString,
        message: 'Username là bắt buộc'
    },
    {
        field: 'password',
        check: isNonEmptyString,
        message: 'Password là bắt buộc'
    }
];

module.exports = { registerRules, loginRules };
