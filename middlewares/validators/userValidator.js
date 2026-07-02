// ============================================================
// User Validator — Validation rules cho admin CRUD user
// ============================================================

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

/** Rules cho POST /api/users (admin tạo user) */
const adminCreateUserRules = [
    {
        field: 'username',
        check: (v) => isNonEmptyString(v) && v.trim().length >= 3,
        message: 'Username là bắt buộc và tối thiểu 3 ký tự'
    },
    {
        field: 'password',
        check: (v) => isNonEmptyString(v) && v.length >= 6,
        message: 'Password là bắt buộc và tối thiểu 6 ký tự'
    }
];

/** Rules cho PUT /api/users/:id (admin sửa user) */
const adminUpdateUserRules = [
    {
        field: 'role',
        check: (v) => !v || ['user', 'admin'].includes(v),
        message: 'Role phải là "user" hoặc "admin"',
        optional: true
    }
];

module.exports = { adminCreateUserRules, adminUpdateUserRules };
