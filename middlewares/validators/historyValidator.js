// ============================================================
// History Validator — Validation rules cho lịch sử đọc
// ============================================================

const mongoose = require('mongoose');
const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);

/** Rules cho POST /api/history (lưu lịch sử đọc) */
const saveHistoryRules = [
    {
        field: 'storyId',
        check: isObjectId,
        message: 'storyId là bắt buộc và phải là ObjectId hợp lệ'
    },
    {
        field: 'chapterId',
        check: isObjectId,
        message: 'chapterId là bắt buộc và phải là ObjectId hợp lệ'
    }
];

module.exports = { saveHistoryRules };
