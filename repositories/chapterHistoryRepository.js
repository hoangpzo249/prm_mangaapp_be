const ChapterHistory = require('../models/ChapterHistory');

// ============================================================
// ChapterHistory Repository — Data access layer
// ============================================================

/**
 * Upsert 1 record đọc chapter cho user.
 * - Lần đầu: tạo record với readWhileVip theo trạng thái hiện tại.
 * - Lần sau: chỉ nâng readWhileVip từ false → true (không hạ true → false),
 *   để user không bị mất quyền refund khi VIP đã hết hạn nhưng trước đó
 *   đã đọc chapter một cách hợp lệ.
 */
exports.upsertRead = async (userId, chapterId, storyId, readWhileVip) => {
    if (readWhileVip) {
        // User đang VIP → set readWhileVip=true, ghi đè nếu cần
        return ChapterHistory.findOneAndUpdate(
            { userId, chapterId },
            {
                $set: { storyId, readWhileVip: true },
                $setOnInsert: { userId, chapterId }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    }

    // User không VIP → chỉ tạo mới nếu chưa có; không hạ true → false
    return ChapterHistory.findOneAndUpdate(
        { userId, chapterId },
        {
            $set: { storyId },
            $setOnInsert: { userId, chapterId, readWhileVip: false }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
};

/**
 * Danh sách userId (distinct) đã đọc chapter này với tư cách VIP.
 * Dùng cho refund flow ở cấp chapter.
 */
exports.findDistinctVipReaderIdsByChapter = (chapterId) => {
    return ChapterHistory.distinct('userId', {
        chapterId,
        readWhileVip: true
    });
};

/**
 * Aggregate: với 1 tập chapterIds (thường là các VIP chapter của truyện),
 * đếm mỗi user đã đọc bao nhiêu chapter trong tập đó khi đang VIP.
 * Dùng cho refund fair khi ẩn cả truyện — mỗi user nhận đúng số xu tương
 * ứng với số VIP chapter họ THỰC SỰ đã đọc.
 *
 * @returns {Array<{ userId: ObjectId, count: number }>}
 */
exports.aggregateVipReadCountsByChapters = async (chapterIds) => {
    if (!chapterIds || chapterIds.length === 0) return [];
    const rows = await ChapterHistory.aggregate([
        {
            $match: {
                chapterId: { $in: chapterIds },
                readWhileVip: true
            }
        },
        {
            $group: {
                _id: '$userId',
                count: { $sum: 1 }
            }
        }
    ]);
    return rows.map(r => ({ userId: r._id, count: r.count }));
};
