// ============================================================
// Bookmark Validator — Validation rules cho bookmark
// ============================================================

const mongoose = require('mongoose');
const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);

/** Rules cho POST /api/bookmarks/toggle */
const toggleBookmarkRules = [
    {
        field: 'storyId',
        check: isObjectId,
        message: 'storyId là bắt buộc và phải là ObjectId hợp lệ'
    }
];

module.exports = { toggleBookmarkRules };
