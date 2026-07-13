const History = require('../models/History');

// ============================================================
// History Repository — Data access layer cho History
// ============================================================

/**
 * Lấy lịch sử đọc của user, mới nhất trước.
 * Populate có match isHidden để không trả về story/chapter đã ẩn.
 * Sau populate, record nào có storyId hoặc lastChapterId = null → loại bỏ.
 */
exports.findByUserId = async (userId, limit = 100) => {
    const items = await History.find({ userId })
        .populate({
            path: 'storyId',
            match: { isHidden: { $ne: true } },
            select: 'title thumbnail views slug'
        })
        .populate({
            path: 'lastChapterId',
            match: { isHidden: { $ne: true } },
            select: 'chapterNumber chapterTitle'
        })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .lean();

    return items.filter(
        (item) => item.storyId != null && item.lastChapterId != null
    );
};

/**
 * Lấy history của user cho 1 truyện cụ thể (dùng cho Continue Reading).
 * Trả null nếu chưa đọc, hoặc story/chapter đã bị ẩn.
 */
exports.findByUserAndStory = async (userId, storyId) => {
    const item = await History.findOne({ userId, storyId })
        .populate({
            path: 'storyId',
            match: { isHidden: { $ne: true } },
            select: 'title thumbnail views slug'
        })
        .populate({
            path: 'lastChapterId',
            match: { isHidden: { $ne: true } },
            select: 'chapterNumber chapterTitle'
        })
        .lean();

    if (!item || item.storyId == null || item.lastChapterId == null) return null;
    return item;
};

/** Tìm history record của user cho 1 truyện cụ thể (raw, không populate) */
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
