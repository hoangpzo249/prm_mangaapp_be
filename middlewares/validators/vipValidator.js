// ============================================================
// VIP Validator — Validation rules cho mua gói VIP
// ============================================================

const mongoose = require('mongoose');
const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);

/** Rules cho POST /api/vip/buy (mua gói VIP) */
const buyVipRules = [
    {
        field: 'packageId',
        check: isObjectId,
        message: 'packageId là bắt buộc và phải là ObjectId hợp lệ'
    }
];

/** Rules cho POST /api/vip/packages (Tạo gói VIP - Admin) */
const createPackageRules = [
    {
        field: 'name',
        check: (v) => typeof v === 'string' && v.trim().length > 0,
        message: 'Tên gói là bắt buộc và không được để trống'
    },
    {
        field: 'durationDays',
        check: (v) => typeof v === 'number' && v > 0,
        message: 'Số ngày VIP phải là một số lớn hơn 0'
    },
    {
        field: 'priceCoins',
        check: (v) => typeof v === 'number' && v >= 0,
        message: 'Giá xu phải là một số không được âm'
    }
];

/** Rules cho PUT /api/vip/packages/:id (Cập nhật gói VIP - Admin) */
const updatePackageRules = [
    {
        field: 'name',
        check: (v) => typeof v === 'string' && v.trim().length > 0,
        message: 'Tên gói không được để trống',
        optional: true
    },
    {
        field: 'durationDays',
        check: (v) => typeof v === 'number' && v > 0,
        message: 'Số ngày VIP phải là một số lớn hơn 0',
        optional: true
    },
    {
        field: 'priceCoins',
        check: (v) => typeof v === 'number' && v >= 0,
        message: 'Giá xu phải là một số không được âm',
        optional: true
    }
];

module.exports = { buyVipRules, createPackageRules, updatePackageRules };
