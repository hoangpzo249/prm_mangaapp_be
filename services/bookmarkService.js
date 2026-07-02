const bookmarkRepo = require('../repositories/bookmarkRepository');
const chapterRepo = require('../repositories/chapterRepository');

// ============================================================
// Bookmark Service — Toggle bookmark truyện
// ============================================================

/** Lấy danh sách bookmark + latest chapter */
exports.getBookmarks = async (userId) => {
    const bookmarks = await bookmarkRepo.findByUserId(userId);

    // Gắn latestChapter cho mỗi truyện
    const formatted = await Promise.all(
        bookmarks.map(async (b) => {
            let latestChapter = null;
            if (b.storyId && b.storyId._id) {
                const chapters = await chapterRepo.findLatestByStoryId(b.storyId._id, 1);
                latestChapter = chapters[0] || null;
            }
            return {
                _id: b._id,
                story: { ...b.storyId, latestChapter },
                bookmarkedAt: b.createdAt
            };
        })
    );

    return formatted;
};

/** Kiểm tra đã bookmark chưa */
exports.checkBookmark = async (userId, storyId) => {
    const bookmark = await bookmarkRepo.findOne(userId, storyId);
    return { isBookmarked: !!bookmark };
};

/** Toggle: thêm hoặc xóa bookmark */
exports.toggleBookmark = async (userId, storyId) => {
    const existing = await bookmarkRepo.findOne(userId, storyId);

    if (existing) {
        await bookmarkRepo.delete(existing._id);
        return { isBookmarked: false, message: 'Đã xóa khỏi tủ truyện' };
    } else {
        await bookmarkRepo.create(userId, storyId);
        return { isBookmarked: true, message: 'Đã thêm vào tủ truyện' };
    }
};
