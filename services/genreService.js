const genreRepo = require('../repositories/genreRepository');
const slugify = require('../utils/slugify');
const AppError = require('../utils/AppError');

// ============================================================
// Genre Service — Business logic cho thể loại
// ============================================================

/** Lấy toàn bộ thể loại (kể cả inactive) — Admin */
exports.getAllGenres = () => genreRepo.findAll();

/** Lấy các thể loại active — Public */
exports.getActiveGenres = () => genreRepo.findActive();

/** Chi tiết theo id */
exports.getGenreById = async (id) => {
    const genre = await genreRepo.findById(id);
    if (!genre) throw new AppError('Thể loại không tồn tại', 404);
    return genre;
};

/** Tạo thể loại (Admin) */
exports.createGenre = async (data) => {
    const payload = { ...data };
    payload.slug = payload.slug ? slugify(payload.slug) : slugify(payload.name);
    return genreRepo.create(payload);
};

/** Cập nhật thể loại (Admin) */
exports.updateGenre = async (id, data) => {
    const payload = { ...data };
    if (payload.name && !payload.slug) {
        payload.slug = slugify(payload.name);
    } else if (payload.slug) {
        payload.slug = slugify(payload.slug);
    }

    const genre = await genreRepo.update(id, payload);
    if (!genre) throw new AppError('Thể loại không tồn tại', 404);
    return genre;
};

/** Xóa thể loại (Admin) */
exports.deleteGenre = async (id) => {
    const genre = await genreRepo.delete(id);
    if (!genre) throw new AppError('Thể loại không tồn tại', 404);
    return { message: 'Đã xóa thể loại thành công' };
};
