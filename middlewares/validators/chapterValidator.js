// ============================================================
// Chapter Validator — Validation rules cho CRUD chapter
// ============================================================

const mongoose = require('mongoose');
const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

/** Rules cho POST /api/chapters (tạo chapter) */
const createChapterRules = [
    {
        field: 'storyId',
        check: isObjectId,
        message: 'storyId là bắt buộc và phải là ObjectId hợp lệ'
    },
    {
        field: 'chapterNumber',
        check: (v) => typeof v === 'number' && v > 0,
        message: 'chapterNumber là bắt buộc và phải > 0'
    },
    {
        field: 'image',
        check: (v) => Array.isArray(v) && v.filter(isNonEmptyString).length >= 2,
        message: 'Chương phải có ít nhất 2 ảnh'
    }
];

/** Rules cho PUT /api/chapters/:id (sửa chapter) */
const updateChapterRules = [
    {
        field: 'chapterNumber',
        check: (v) => !v || (typeof v === 'number' && v > 0),
        message: 'chapterNumber phải > 0',
        optional: true
    }
];

module.exports = { createChapterRules, updateChapterRules };
