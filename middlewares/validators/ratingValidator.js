// ============================================================
// Rating Validator — Validation rules cho đánh giá truyện
// ============================================================

const mongoose = require('mongoose');
const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);

/** Rules cho POST /api/ratings (đánh giá truyện) */
const createRatingRules = [
    {
        field: 'storyId',
        check: isObjectId,
        message: 'storyId là bắt buộc và phải là ObjectId hợp lệ'
    },
    {
        field: 'score',
        check: (v) => typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 5,
        message: 'Điểm đánh giá là bắt buộc, phải là số nguyên từ 1 đến 5'
    }
];

module.exports = { createRatingRules };
