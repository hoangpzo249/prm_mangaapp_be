const Chapter = require('../models/Chapter');

// ============================================================
// Chapter Repository — Data access layer cho Chapter
// ============================================================

exports.findById = (id) => {
    return Chapter.findById(id);
};

/** Lấy chapter kèm populate story info */
exports.findByIdWithStory = (id) => {
    return Chapter.findById(id).populate('storyId', 'title thumbnail').lean();
};

/** Lấy tất cả chapters của một truyện, sắp xếp theo số chapter */
exports.findByStoryId = (storyId) => {
    return Chapter.find({ storyId }).sort({ chapterNumber: 1 }).lean();
};

/** Lấy chapter mới nhất của truyện */
exports.findLatestByStoryId = (storyId, limit = 1) => {
    return Chapter.find({ storyId })
        .sort({ chapterNumber: -1 })
        .limit(limit)
        .select('_id chapterNumber chapterTitle updatedAt createdAt isVip')
        .lean();
};

/** Kiểm tra chapter number đã tồn tại chưa */
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

/** Dùng findOneAndDelete để trigger post hook giảm chapterCount */
exports.delete = (id) => {
    return Chapter.findOneAndDelete({ _id: id });
};

/** Xóa tất cả chapters của một truyện */
exports.deleteByStoryId = (storyId) => {
    return Chapter.deleteMany({ storyId });
};
