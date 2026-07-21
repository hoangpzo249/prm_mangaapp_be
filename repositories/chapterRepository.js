const Chapter = require('../models/Chapter');

// ============================================================
// Chapter Repository — Data access layer cho Chapter
// ============================================================

exports.findById = (id) => {
    return Chapter.findOne({ _id: id, isHidden: { $ne: true } });
};

/** Bao gồm cả chapter đã ẩn — dùng cho admin restore */
exports.findByIdIncludeHidden = (id) => {
    return Chapter.findById(id);
};

/** Lấy chapter kèm populate story info */
exports.findByIdWithStory = (id) => {
    return Chapter.findOne({ _id: id, isHidden: { $ne: true } })
        .populate('storyId', 'title thumbnail')
        .lean();
};

/** Lấy tất cả chapters của một truyện, sắp xếp theo số chapter */
exports.findByStoryId = (storyId) => {
    return Chapter.find({ storyId, isHidden: { $ne: true } })
        .sort({ chapterNumber: 1 })
        .lean();
};

/** Lấy chapter mới nhất của truyện */
exports.findLatestByStoryId = (storyId, limit = 1) => {
    return Chapter.find({ storyId, isHidden: { $ne: true } })
        .sort({ chapterNumber: -1 })
        .limit(limit)
        .select('_id chapterNumber chapterTitle updatedAt createdAt isVip')
        .lean();
};

/** Kiểm tra chapter number đã tồn tại chưa (kể cả bản đã ẩn để tránh vi phạm unique index) */
exports.existsByStoryAndNumber = (storyId, chapterNumber) => {
    return Chapter.findOne({ storyId, chapterNumber });
};

exports.create = (data) => {
    const chapter = new Chapter(data);
    return chapter.save();
};

exports.update = (id, data) => {
    return Chapter.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

/** Soft delete — set isHidden = true */
exports.softDelete = (id) => {
    return Chapter.findOneAndUpdate(
        { _id: id, isHidden: { $ne: true } },
        { isHidden: true },
        { new: true }
    );
};

/** Khôi phục chapter đã ẩn */
exports.restore = (id) => {
    return Chapter.findOneAndUpdate(
        { _id: id, isHidden: true },
        { isHidden: false },
        { new: true }
    );
};

/** Ẩn cascade: chỉ ẩn những chapter đang hiển thị, đánh dấu hiddenByStory */
exports.hideByStoryId = (storyId) => {
    return Chapter.updateMany(
        { storyId, isHidden: { $ne: true } },
        { isHidden: true, hiddenByStory: true }
    );
};

/** Bỏ ẩn cascade: chỉ khôi phục chapter đã bị ẩn do story cascade */
exports.unhideByStoryId = (storyId) => {
    return Chapter.updateMany(
        { storyId, isHidden: true, hiddenByStory: true },
        { isHidden: false, hiddenByStory: false }
    );
};

/** Đếm chapter đang hiển thị của truyện — dùng để đồng bộ lại chapterCount */
exports.countVisibleByStoryId = (storyId) => {
    return Chapter.countDocuments({ storyId, isHidden: { $ne: true } });
};

/** Đếm chapter VIP đang hiển thị của truyện — dùng cho refund khi ẩn cả truyện */
exports.countVisibleVipByStoryId = (storyId) => {
    return Chapter.countDocuments({
        storyId,
        isVip: true,
        isHidden: { $ne: true }
    });
};

/** Danh sách _id các chapter VIP đang hiển thị — dùng cho refund fair khi ẩn cả truyện */
exports.findVisibleVipIdsByStoryId = async (storyId) => {
    const rows = await Chapter.find(
        { storyId, isVip: true, isHidden: { $ne: true } },
        { _id: 1 }
    ).lean();
    return rows.map(r => r._id);
};

/** Danh sách chapter đã ẩn của truyện — cho admin xem/khôi phục */
exports.findHiddenByStoryId = (storyId) => {
    return Chapter.find({ storyId, isHidden: true })
        .sort({ chapterNumber: 1 })
        .lean();
};
