// ============================================================
// Story Validator — Validation rules cho CRUD truyện
// ============================================================

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const isObjectIdLike = (v) => typeof v === 'string' && /^[a-fA-F0-9]{24}$/.test(v);
const isGenreIdArray = (v) => Array.isArray(v) && v.every(isObjectIdLike);

/** Rules cho POST /api/stories (tạo truyện) */
const createStoryRules = [
    {
        field: 'title',
        check: isNonEmptyString,
        message: 'Tên truyện là bắt buộc'
    },
    {
        field: 'genres',
        check: (v) => v === undefined || isGenreIdArray(v),
        message: 'Genres phải là mảng ObjectId của Genre',
        optional: true
    }
];

/** Rules cho PUT /api/stories/:id (sửa truyện) — tất cả optional */
const updateStoryRules = [
    {
        field: 'status',
        check: (v) => !v || ['Ongoing', 'Complete'].includes(v),
        message: 'Status phải là "Ongoing" hoặc "Complete"',
        optional: true
    },
    {
        field: 'genres',
        check: (v) => v === undefined || isGenreIdArray(v),
        message: 'Genres phải là mảng ObjectId của Genre',
        optional: true
    }
];

module.exports = { createStoryRules, updateStoryRules };
