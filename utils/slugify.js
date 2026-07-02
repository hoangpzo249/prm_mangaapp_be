// ============================================================
// Slugify — Tạo URL-friendly slug từ tiếng Việt
// ============================================================
// "Naruto Shippuden: Cái Chết" → "naruto-shippuden-cai-chet"
// ============================================================

/**
 * Chuyển đổi chuỗi tiếng Việt thành slug URL-friendly
 * @param {string} text - Chuỗi cần chuyển
 * @returns {string} Slug đã xử lý
 */
const slugify = (text) => {
    if (!text) return '';

    return text
        .toString()
        .toLowerCase()
        .trim()
        // Bỏ dấu tiếng Việt
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        // Chuyển đ → d
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        // Thay khoảng trắng và ký tự đặc biệt thành dấu gạch ngang
        .replace(/[^a-z0-9]+/g, '-')
        // Bỏ dấu gạch ngang ở đầu/cuối
        .replace(/^-+|-+$/g, '');
};

module.exports = slugify;
