// ============================================================
// Comment Validator — Validation rules cho bình luận
// ============================================================

const mongoose = require('mongoose');
const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);
const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

/** Rules cho POST /api/comments (tạo comment) */
const createCommentRules = [
    {
        field: 'storyId',
        check: isObjectId,
        message: 'storyId là bắt buộc và phải là ObjectId hợp lệ'
    },
    {
        field: 'content',
        check: isNonEmptyString,
        message: 'Nội dung bình luận là bắt buộc'
    },
    {
        field: 'chapterId',
        check: (v) => !v || isObjectId(v),
        message: 'chapterId phải là ObjectId hợp lệ',
        optional: true
    },
    {
        field: 'parentId',
        check: (v) => !v || isObjectId(v),
        message: 'parentId phải là ObjectId hợp lệ',
        optional: true
    }
];

module.exports = { createCommentRules };
