const History = require('../models/History');

// ============================================================
// History Repository — Data access layer cho History
// ============================================================

/** Lấy lịch sử đọc của user, mới nhất trước */
exports.findByUserId = (userId, limit = 100) => {
    return History.find({ userId })
        .populate('storyId', 'title thumbnail views slug')
        .populate('lastChapterId', 'chapterNumber chapterTitle')
        .sort({ updatedAt: -1 })
        .limit(limit)
        .lean();
};

/** Tìm history record của user cho 1 truyện cụ thể */
exports.findOne = (userId, storyId) => {
    return History.findOne({ userId, storyId });
};

/** Tạo hoặc cập nhật history (upsert pattern) */
exports.upsert = async (userId, storyId, lastChapterId) => {
    return History.findOneAndUpdate(
        { userId, storyId },
        { lastChapterId, updatedAt: new Date() },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
};

exports.delete = (userId, storyId) => {
    return History.findOneAndDelete({ userId, storyId });
};
