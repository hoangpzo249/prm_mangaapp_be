const historyRepo = require('../repositories/historyRepository');

// ============================================================
// History Service — Lịch sử đọc truyện
// ============================================================

exports.getHistory = async (userId) => {
    return historyRepo.findByUserId(userId);
};

/** Lấy history của user cho 1 truyện — dùng cho Continue Reading ở story detail */
exports.getHistoryForStory = async (userId, storyId) => {
    return historyRepo.findByUserAndStory(userId, storyId);
};

exports.saveHistory = async (userId, storyId, chapterId) => {
    const history = await historyRepo.upsert(userId, storyId, chapterId);
    return { message: 'Lưu lịch sử thành công', history };
};

exports.deleteHistory = async (userId, storyId) => {
    await historyRepo.delete(userId, storyId);
    return { message: 'Xóa lịch sử thành công' };
};
