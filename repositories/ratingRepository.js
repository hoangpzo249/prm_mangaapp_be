const mongoose = require('mongoose');
const Rating = require('../models/Rating');

// ============================================================
// Rating Repository — Data access layer cho Rating
// ============================================================

/** Tìm rating của user cho truyện */
exports.findOne = (userId, storyId) => {
    return Rating.findOne({ userId, storyId });
};

/** Tạo hoặc cập nhật rating (upsert) */
exports.upsert = (userId, storyId, score) => {
    return Rating.findOneAndUpdate(
        { userId, storyId },
        { score },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
};

/**
 * Tính averageRating và ratingCount cho một truyện
 * Đây là aggregation pipeline — được gọi khi query story detail
 * @returns {{ averageRating: number, ratingCount: number }}
 */
exports.getAverageRating = async (storyId) => {
    const result = await Rating.aggregate([
        { $match: { storyId: new mongoose.Types.ObjectId(storyId) } },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$score' },
                ratingCount: { $sum: 1 }
            }
        }
    ]);

    if (result.length === 0) {
        return { averageRating: 0, ratingCount: 0 };
    }

    return {
        averageRating: Math.round(result[0].averageRating * 10) / 10, // Làm tròn 1 chữ số
        ratingCount: result[0].ratingCount
    };
};
