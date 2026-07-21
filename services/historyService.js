const historyRepo = require('../repositories/historyRepository');
const chapterHistoryRepo = require('../repositories/chapterHistoryRepository');
const chapterRepo = require('../repositories/chapterRepository');
const userRepo = require('../repositories/userRepository');

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

/**
 * Lưu history:
 * 1) Upsert History cấp truyện (1 record / user / story) — cho Continue Reading.
 * 2) Upsert ChapterHistory cấp chapter (1 record / user / chapter) kèm
 *    snapshot readWhileVip — dùng cho refund công bằng khi admin ẩn chapter VIP.
 * Chỉ ghi ChapterHistory cho chapter VIP (chapter free không cần refund).
 */
exports.saveHistory = async (userId, storyId, chapterId) => {
    const history = await historyRepo.upsert(userId, storyId, chapterId);

    // Chỉ track per-chapter cho VIP chapter — dùng cho refund flow.
    // Chapter free không bao giờ được refund nên không cần ghi.
    try {
        const chapter = await chapterRepo.findByIdIncludeHidden(chapterId);
        if (chapter && chapter.isVip) {
            const user = await userRepo.findByIdWithPassword(userId);
            const readWhileVip = !!(user && user.isVip);
            await chapterHistoryRepo.upsertRead(
                userId,
                chapterId,
                storyId,
                readWhileVip
            );
        }
    } catch (err) {
        // Không chặn saveHistory nếu ghi ChapterHistory thất bại
        console.error('ChapterHistory upsert failed:', err.message);
    }

    return { message: 'Lưu lịch sử thành công', history };
};

exports.deleteHistory = async (userId, storyId) => {
    await historyRepo.delete(userId, storyId);
    return { message: 'Xóa lịch sử thành công' };
};
