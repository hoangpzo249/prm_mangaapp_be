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

module.exports = { buyVipRules };
