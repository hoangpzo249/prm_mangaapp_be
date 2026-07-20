const Bookmark = require('../models/Bookmark');

// ============================================================
// Bookmark Repository — Data access layer cho Bookmark
// ============================================================

/** Lấy bookmarks của user, populate story info */
exports.findByUserId = (userId) => {
    return Bookmark.find({ userId })
        .populate({ path: 'storyId', select: 'title thumbnail views status slug' })
        .sort({ createdAt: -1 })
        .lean();
};

/** Kiểm tra user đã bookmark truyện này chưa */
exports.findOne = (userId, storyId) => {
    return Bookmark.findOne({ userId, storyId });
};

exports.create = (userId, storyId) => {
    const bookmark = new Bookmark({ userId, storyId });
    return bookmark.save();
};

exports.delete = (id) => {
    return Bookmark.findByIdAndDelete(id);
};

/** Đếm tổng bookmark của một truyện (dùng cho Repository-level aggregation) */
exports.countByStory = (storyId) => {
    return Bookmark.countDocuments({ storyId });
};

/** Lấy danh sách user đang bookmark truyện */
exports.findUsersByStoryId = (storyId) => {
    return Bookmark.find({ storyId })
        .select('userId')
        .lean();
};