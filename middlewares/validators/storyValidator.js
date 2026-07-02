// ============================================================
// Story Validator — Validation rules cho CRUD truyện
// ============================================================

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

/** Rules cho POST /api/stories (tạo truyện) */
const createStoryRules = [
    {
        field: 'title',
        check: isNonEmptyString,
        message: 'Tên truyện là bắt buộc'
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
        check: (v) => !v || Array.isArray(v),
        message: 'Genres phải là mảng',
        optional: true
    }
];

module.exports = { createStoryRules, updateStoryRules };
