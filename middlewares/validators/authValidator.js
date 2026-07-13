

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;


const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;


const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/;


const registerRules = [
    {
        field: 'username',
        check: (v) => isNonEmptyString(v) && USERNAME_REGEX.test(v.trim()),
        message: 'Username phải từ 3-20 ký tự, chỉ gồm chữ, số và dấu gạch dưới (_), không khoảng trắng'
    },
    {
        field: 'email',
        check: (v) => isNonEmptyString(v) && v.trim().length <= 254 && EMAIL_REGEX.test(v.trim()),
        message: 'Email là bắt buộc và phải đúng định dạng'
    },
    {
        field: 'password',
        check: (v) => isNonEmptyString(v) && PASSWORD_REGEX.test(v),
        message: 'Password tối thiểu 8 ký tự, phải có chữ hoa, chữ thường, số và ký tự đặc biệt'
    },
    {
        field: 'fullName',
        optional: true,
        check: (v) => typeof v === 'string' && v.trim().length <= 100,
        message: 'Họ tên tối đa 100 ký tự'
    }
];

/** Rules cho POST /api/auth/login */
const loginRules = [
    {
        field: 'username',
        check: (v) => isNonEmptyString(v) && v.trim().length <= 254,
        message: 'Username là bắt buộc'
    },
    {
        field: 'password',
        check: (v) => isNonEmptyString(v) && v.length <= 72,
        message: 'Password là bắt buộc'
    }
];

module.exports = { registerRules, loginRules };
 