// ============================================================
// Genre Validator — Validation rules cho CRUD thể loại
// ============================================================

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

/** Rules cho POST /api/genres */
const createGenreRules = [
    {
        field: 'name',
        check: isNonEmptyString,
        message: 'Tên thể loại là bắt buộc'
    },
    {
        field: 'isActive',
        check: (v) => v === undefined || typeof v === 'boolean',
        message: 'isActive phải là boolean',
        optional: true
    }
];

/** Rules cho PUT /api/genres/:id */
const updateGenreRules = [
    {
        field: 'name',
        check: (v) => v === undefined || isNonEmptyString(v),
        message: 'Tên thể loại không hợp lệ',
        optional: true
    },
    {
        field: 'isActive',
        check: (v) => v === undefined || typeof v === 'boolean',
        message: 'isActive phải là boolean',
        optional: true
    }
];

module.exports = { createGenreRules, updateGenreRules };
