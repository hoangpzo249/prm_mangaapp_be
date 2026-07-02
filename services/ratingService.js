const ratingRepo = require('../repositories/ratingRepository');

// ============================================================
// Rating Service — Đánh giá truyện
// ============================================================

/** Lấy thống kê rating của truyện */
exports.getRatingByStory = async (storyId) => {
    return ratingRepo.getAverageRating(storyId);
};

/** Tạo hoặc cập nhật rating (mỗi user chỉ rate 1 lần/truyện) */
exports.rateStory = async (userId, storyId, score) => {
    const rating = await ratingRepo.upsert(userId, storyId, score);
    const stats = await ratingRepo.getAverageRating(storyId);

    return {
        message: 'Đánh giá thành công',
        yourScore: rating.score,
        ...stats
    };
};
